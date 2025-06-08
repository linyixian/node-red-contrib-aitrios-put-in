const helper = require("node-red-node-test-helper");
const aitriosPutIn = require("../aitrios-put-in.js");
const should = require("should");

helper.init(require.resolve('node-red'));

describe('aitrios-put-in node', function () {
    before(function (done) {
        helper.startServer(done);
    });

    after(function (done) {
        helper.stopServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        const flow = [
            { id: "n1", type: "aitrios-put-in", name: "aitrios-put-in", url: "/test" }
        ];
        helper.load(aitriosPutIn, flow, function () {
            try {
                const n1 = helper.getNode("n1");
                n1.should.have.property('name', 'aitrios-put-in');
                done();
            } catch(err) {
                done(err);
            }
        });
    });

    it('should handle PUT request and output payload', function (done) {
        const flow = [
            { id: "n1", type: "aitrios-put-in", name: "aitrios-put-in", url: "/test" ,wires:[["n2"]]},
            { id: "n2", type: "helper" }
        ];
        helper.load(aitriosPutIn, flow, function () {
            const n1 = helper.getNode("n1");
            const n2 = helper.getNode("n2");
            n2.on('input', function (msg) {
                try {
                    msg.should.have.property('payload');
                    msg.payload.should.have.property('foo', 'bar');
                    done();
                } catch(err) {
                    done(err);
                }
            });
            const req = {
                headers: {'content-type':'application/json'},
                body: {foo:'bar'}
            };
            const res = {};
            n1.callback(req,res);
        });
    });
});
