# 就活Boost

就活生向けの AI 面接対策サービスです。企業選択、想定質問の生成、回答作成の練習までを一連で扱う Next.js アプリです。

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開くと確認できます。

### PCで開く

起動後、ブラウザで以下にアクセス：

```
http://localhost:3000
```

### スマホで開く（同一 Wi-Fi 内）

1. PC のローカル IP を確認する

   ```bash
   # Mac
   ipconfig getifaddr en0
   ```

2. スマホのブラウザで以下にアクセス（`192.168.x.x` は上で確認した IP に置き換える）：

   ```
   http://192.168.x.x:3000
   ```

3. アクセスできない場合は、`next.config.ts`（または `next.config.js`）に以下を追加してサーバーをホストに公開する：

   ```ts
   // next.config.ts
   const nextConfig = {
     // ...既存の設定
   };
   export default nextConfig;
   ```

   代わりに起動コマンドを以下に変える：

   ```bash
   npm run dev -- -H 0.0.0.0
   ```

## 主な技術構成

- Next.js
- React
- TypeScript
- Tailwind CSS

## 補足

- アプリ名: `就活Boost`
- パッケージ名: `shuukatsu-boost`
