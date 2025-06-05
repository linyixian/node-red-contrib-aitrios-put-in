# node-red-contrib-aitrios-put-in

[日本語](#日本語) | [English](#english)

<a id="日本語"></a>
# 日本語

## 概要

このノードはAITRIOSデバイスからのPUTリクエストを受け付け、画像データ（JPEG、BMP）やテキストデータを処理することができます。

## 機能

- AITRIOSデバイスからのPUTリクエストの受信
- 画像データ（JPEG、BMP）の処理
- テキストデータの処理
- カスタマイズ可能なエンドポイントパス
- Swagger API仕様書のサポート（オプション）

## インストール

Node-REDのルートディレクトリで以下のコマンドを実行してください：

```bash
npm install @linyixian/node-red-contrib-aitrios-put-in
```

## 使用方法

1. Node-REDのフローエディタを開きます
2. パレットから「aitrios put in」ノードを探します
3. フローにドラッグ＆ドロップします
4. ノードをダブルクリックして設定を開きます
5. 以下の設定を行います：
   - URL: エンドポイントのパス（例: /aitrios/put）
   - Swagger Doc: API仕様書のパス（オプション）

## 出力メッセージ

ノードは以下のプロパティを持つメッセージを出力します：

- req: リクエストオブジェクト（ヘッダー情報を含む）
- res: レスポンスオブジェクト
- payload: リクエストボディの内容

## 依存関係

- body-parser: ^1.20.2
- content-type: ^1.0.5
- cookie-parser: ^1.4.6
- cors: ^2.8.5
- is-utf8: ^0.2.1
- media-typer: ^1.1.0
- on-headers: ^1.0.2
- raw-body: ^2.5.2

## 必要条件

- Node.js >= 14.0.0
- Node-RED

## ライセンス

Apache License 2.0

## 作者

linyixian

## サポート

問題や質問がある場合は、GitHubのIssuesページで報告してください。

---

<a id="english"></a>
# English

## Overview

This node accepts PUT requests from AITRIOS devices and can process image data (JPEG, BMP) and text data.

## Features

- Accept PUT requests from AITRIOS devices
- Process image data (JPEG, BMP)
- Process text data
- Customizable endpoint path
- Swagger API specification support (optional)

## Installation

Run the following command in your Node-RED root directory:

```bash
npm install @linyixian/node-red-contrib-aitrios-put-in
```

## Usage

1. Open the Node-RED flow editor
2. Find the "aitrios put in" node in the palette
3. Drag and drop it into your flow
4. Double-click the node to open its settings
5. Configure the following:
   - URL: Endpoint path (e.g., /aitrios/put)
   - Swagger Doc: Path to API specification (optional)

## Output Message

The node outputs a message with the following properties:

- req: Request object (including header information)
- res: Response object
- payload: Request body content

## Dependencies

- body-parser: ^1.20.2
- content-type: ^1.0.5
- cookie-parser: ^1.4.6
- cors: ^2.8.5
- is-utf8: ^0.2.1
- media-typer: ^1.1.0
- on-headers: ^1.0.2
- raw-body: ^2.5.2

## Requirements

- Node.js >= 14.0.0
- Node-RED

## License

Apache License 2.0

## Author

linyixian

## Support

If you have any issues or questions, please report them on the GitHub Issues page.
