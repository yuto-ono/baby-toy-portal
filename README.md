# Baby Toy Portal

子どもがブラウザ上で気軽に遊べる、やさしいおもちゃのポータルです。

明るい色、丸みのある形、大きく分かりやすい操作を大切にしながら、音や動きを楽しめる遊びを少しずつ追加していきます。

## 技術スタック

- SvelteKit
- Svelte 5
- TypeScript
- SCSS
- Lucide Icons
- Vite
- Vitest
- PWA (Progressive Web App)
- pnpm

静的サイトとしてビルドできるよう、`@sveltejs/adapter-static` を使用しています。

## 開発環境

Node.js と pnpm のバージョン管理には [mise](https://mise.jdx.dev/) の利用を推奨します。

使用するバージョンは [`mise.toml`](./mise.toml) に定義されています。

```sh
mise install
pnpm install
pnpm dev
```

起動後、ターミナルに表示されるローカルURLへアクセスしてください。

miseを使用しない場合も、必要な Node.js と pnpm のバージョンは [`mise.toml`](./mise.toml) を確認してください。

## ディレクトリ構成

```text
src/
├── lib/                    # 複数ページで共有するコードやアセット
├── routes/
│   ├── +page.svelte        # トップページ
│   ├── PlayCard.svelte     # トップページ固有のコンポーネント
│   └── instruments/
│       ├── +page.svelte    # 楽器ページ
│       └── PageHeading.svelte
└── service-worker.ts       # PWAのキャッシュと更新処理
```

SvelteKitでは、先頭に `+` が付くファイルがルーティングのために特別扱いされます。

そのページだけで使用するコンポーネントやロジックは、対象の `+page.svelte` と同じディレクトリ付近に配置します。複数ページで共有するようになったものは `src/lib/` へ移します。

## 開発方針

- 子どもが迷いにくい、単純で大きな操作を優先する
- 色だけに頼らず、形や文言でも意味を伝える
- キーボード操作や読み上げにも配慮する
- ページ固有のコードはページの近くに置く
- 小さなコンポーネントを組み合わせ、遊びを追加しやすくする
- 変更後は `pnpm check`、`pnpm lint`、`pnpm build` を実行する
