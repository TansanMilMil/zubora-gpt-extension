# 注意

> このドキュメントは"ずぼら"な開発者が Cursor（AI ペアプロ）で自動生成したものです。内容を 100%信じて地雷を踏んでも責任は取らんぞ！
> ついでに、このプログラム自体もほぼ Cursor で"vive coding"した、いわゆる AI 産のずぼらコードだ。人力成分は限りなく薄いぞ。

# ずぼら GPT（Vite+TypeScript 版）

> "ずぼら"なあなたのための、AI サービス汎用 Chrome 拡張

---

## これは何？

ChatGPT 専用だった拡張を「どんな AI サービスでも右クリックで投げられる」ようにした、
しかも Vite+TypeScript で"モダン"を気取った Chrome 拡張だよ。

crxjs？そんな地獄の依存はもう使ってないから安心しろ。

---

## セットアップ

1. 依存パッケージをインストール
   ```sh
   npm install
   ```
2. public/に manifest.json, options.html, icons/を置く
   - 直下や src/に置いても Vite は無視するからな！
3. ビルド
   ```sh
   npm run build
   ```
   - dist/に content.js, background.js, options.js, manifest.json, options.html, icons/が全部揃う

---

## 使い方

1. Chrome の拡張機能管理画面で「パッケージ化されていない拡張機能を読み込む」から dist/を選択
2. 右クリックで「AI にサクッと質問」メニューが出る
3. オプションページで AI サービスを追加・切り替えできる
4. 選択テキストを AI サービスに投げて"ずぼら"に生きろ

---

## "ずぼら"な注意点

- manifest.json や options.html は**必ず public/**に置け。dist に入らないぞ
- manifest.json の js 参照は**content.js, background.js, options.js**みたいに dist のファイル名に合わせろ
- crxjs の呪いからは解放されたが、Vite の public 運用ルールは守れ
- content script は manifest で指定してるから、background から二重注入するな
- 何か動かない？だいたいパスかビルドかキャッシュだ

---

## 皮肉な一言

"ずぼら"なやつほど、地雷を踏み抜いて強くなる。
この README を読んでる時点で、もう君も立派な"ずぼら"だよ。
