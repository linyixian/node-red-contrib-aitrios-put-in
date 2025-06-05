/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 * (code based on Node-RED's 20-httpin.js)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var bodyParser = require("body-parser");
    var cookieParser = require("cookie-parser");
    var getBody = require('raw-body');
    var cors = require('cors');
    var onHeaders = require('on-headers');
    var typer = require('content-type');
    var mediaTyper = require('media-typer');
    var isUtf8 = require('is-utf8');

    function isJPEG(buffer) {
        if (!buffer || buffer.length < 3) return false;
        return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }

    function isBMP(buffer) {
        if (!buffer || buffer.length < 2) return false;
        return buffer[0] === 0x42 && buffer[1] === 0x4D;
    }

    function aitriosPutBodyParser(req, res, next) {
        if (req.skipRawBodyParser) { next(); }
        if (req._body) { return next(); }
        req.body = "";
        req._body = true;

        if (!req.headers['content-type']) {
            getBody(req, {
                length: req.headers['content-length'],
                encoding: null
            }, function (err, buf) {
                if (err) { return next(err); }
                if (isJPEG(buf) || isBMP(buf)) {
                    req.body = buf;
                } else {
                    if (isUtf8(buf)) {
                        req.body = buf.toString();
                    } else {
                        req.body = buf;
                    }
                }
                next();
            });
        } else {
            var isText = true;
            var checkUTF = false;
            var contentType = typer.parse(req.headers['content-type'])
            if (contentType.type) {
                var parsedType = mediaTyper.parse(contentType.type);
                if (parsedType.type === "text") {
                    isText = true;
                } else if (parsedType.subtype === "xml" || parsedType.suffix === "xml") {
                    isText = true;
                } else if (parsedType.type !== "application") {
                    isText = false;
                } else if ((parsedType.subtype !== "octet-stream") &&
                           (parsedType.subtype !== "cbor") &&
                           (parsedType.subtype !== "x-protobuf")) {
                    checkUTF = true;
                } else {
                    isText = false;
                }
            }
            getBody(req, {
                length: req.headers['content-length'],
                encoding: isText ? "utf8" : null
            }, function (err, buf) {
                if (err) { return next(err); }
                if (!isText && checkUTF && isUtf8(buf)) {
                    req.body = buf.toString()
                } else {
                    req.body = buf;
                }
                next();
            });
        }
    }

    var corsHandler = function(req,res,next) { next(); }
    if (RED.settings.httpNodeCors) {
        corsHandler = cors(RED.settings.httpNodeCors);
        RED.httpNode.options("*",corsHandler);
    }

    function AitriosPutInNode(n) {
        RED.nodes.createNode(this,n);
        this.description = "AITRIOSデバイスからのPUTリクエストを受け付けるノードです。画像データやテキストデータを処理できます。\n" +
                          "A node that accepts PUT requests from AITRIOS devices. Can process image and text data.";
        this.help = "このノードはAITRIOSデバイスからのPUTリクエストを受け付けます。\n" +
                   "入力として画像データ（JPEG、BMP）やテキストデータを処理できます。\n" +
                   "出力メッセージには以下のプロパティが含まれます：\n" +
                   "- req: リクエストオブジェクト（ヘッダー情報を含む）\n" +
                   "- res: レスポンスオブジェクト\n" +
                   "- payload: リクエストボディの内容\n\n" +
                   "設定項目：\n" +
                   "- URL: エンドポイントのパス（例: /aitrios/put）\n" +
                   "- Swagger Doc: API仕様書のパス（オプション）\n\n" +
                   "--- English ---\n" +
                   "This node accepts PUT requests from AITRIOS devices.\n" +
                   "It can process image data (JPEG, BMP) and text data as input.\n" +
                   "The output message contains the following properties:\n" +
                   "- req: Request object (including header information)\n" +
                   "- res: Response object\n" +
                   "- payload: Request body content\n\n" +
                   "Configuration:\n" +
                   "- URL: Endpoint path (e.g., /aitrios/put)\n" +
                   "- Swagger Doc: Path to API specification (optional)";

        if (RED.settings.httpNodeRoot !== false) {
            if (!n.url) {
                this.warn(RED._("httpin.errors.missing-path"));
                return;
            }
            this.url = n.url;
            if (this.url[0] !== '/') {
                this.url = '/'+this.url;
            }
            this.method = "put";
            this.swaggerDoc = n.swaggerDoc;
            var node = this;

            this.errorHandler = function(err,req,res,next) {
                node.warn(err);
                res.sendStatus(500);
            };

            this.callback = function(req,res) {
                var msgid = RED.util.generateId();
                res._msgid = msgid;
                Object.defineProperty(req, 'headers', {
                    value: req.headers,
                    enumerable: true
                });
                node.send({_msgid:msgid,req:req,res:createResponseWrapper(node,res),payload:req.body});
            };

            var httpMiddleware = function(req,res,next) { next(); }
            if (RED.settings.httpNodeMiddleware) {
                if (typeof RED.settings.httpNodeMiddleware === "function" || Array.isArray(RED.settings.httpNodeMiddleware)) {
                    httpMiddleware = RED.settings.httpNodeMiddleware;
                }
            }

            var maxApiRequestSize = RED.settings.apiMaxLength || '5mb';
            var jsonParser = bodyParser.json({limit:maxApiRequestSize});
            var urlencParser = bodyParser.urlencoded({limit:maxApiRequestSize,extended:true});

            var metricsHandler = function(req,res,next) { next(); }
            if (this.metric()) {
                metricsHandler = function(req, res, next) {
                    var startAt = process.hrtime();
                    onHeaders(res, function() {
                        if (res._msgid) {
                            var diff = process.hrtime(startAt);
                            var ms = diff[0] * 1e3 + diff[1] * 1e-6;
                            var metricResponseTime = ms.toFixed(3);
                            var metricContentLength = res.getHeader("content-length");
                            node.metric("response.time.millis", {_msgid:res._msgid} , metricResponseTime);
                            node.metric("response.content-length.bytes", {_msgid:res._msgid} , metricContentLength);
                        }
                    });
                    next();
                };
            }

            RED.httpNode.put(this.url,cookieParser(),httpMiddleware,corsHandler,metricsHandler,jsonParser,urlencParser,aitriosPutBodyParser,this.callback,this.errorHandler);

            this.on("close",function() {
                var node = this;
                RED.httpNode._router.stack.forEach(function(route,i,routes) {
                    if (route.route && route.route.path === node.url && route.route.methods[node.method]) {
                        routes.splice(i,1);
                    }
                });
            });
        } else {
            this.warn(RED._("httpin.errors.not-created"));
        }
    }
    RED.nodes.registerType("aitrios-put-in", AitriosPutInNode); // Changed node type name

    function createResponseWrapper(node,res) {
        var wrapper = { _res: res };
        var toWrap = [
            "append", "attachment", "cookie", "clearCookie", "download", "end", "format", "get",
            "json", "jsonp", "links", "location", "redirect", "render", "send", "sendfile",
            "sendFile", "sendStatus", "set", "status", "type", "vary"
        ];
        toWrap.forEach(function(f) {
            wrapper[f] = function() {
                node.warn(RED._("httpin.errors.deprecated-call",{method:"msg.res."+f}));
                var result = res[f].apply(res,arguments);
                if (result === res) { return wrapper; }
                else { return result; }
            }
        });
        return wrapper;
    }
}