# 就活Boost

就活生向けの AI 面接対策サービスです。企業選択、想定質問の生成、回答作成の練習までを一連で扱う Next.js アプリです。

## デプロイ

このアプリは `Prisma + PostgreSQL` を前提にすると `Vercel` にそのまま載せやすいです。PC でもスマホでも、発行された公開 URL にアクセスすればそのまま確認できます。

### Vercel で公開する

1. このリポジトリを GitHub に push する
2. `Neon` で PostgreSQL データベースを作成する
3. `Vercel` で `New Project` → GitHub リポジトリを import
4. `Environment Variables` に以下を設定する

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
JWT_SECRET=十分に長いランダム文字列
GROQ_API_KEY=あなたのGroq APIキー
NEXT_PUBLIC_BASE_URL=https://発行されたVercelのURL
```

5. 課金機能も使う場合だけ追加

```bash
STRIPE_SECRET_KEY=
STRIPE_GROWTH_PRICE_ID=
STRIPE_EXECUTIVE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

6. ローカルで一度だけ DB にスキーマを流し込む

```bash
npm install
npx prisma db push
```

7. Vercel でデプロイする
8. 発行された URL を PC / スマホで開く

### 補足

- Vercel では SQLite は使えないため、PostgreSQL が必要です
- スマホでは Vercel の公開 URL をそのまま Safari / Chrome で開けば見られます
- 認証や生成機能も公開 URL 上でそのまま動きます

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
