# Baby Toy Portal

子どもがブラウザ上で気軽に遊べる、やさしいおもちゃのポータルです。

明るい色、丸みのある形、大きく分かりやすい操作を大切にしながら、音や動きを楽しめる遊びを少しずつ追加していきます。

公開URL: <https://baby-toy-portal.pages.dev/>

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
assets/
└── icon-source.png         # アプリアイコンの編集用素材

src/
├── lib/                    # 複数ページで共有するコードやアセット
├── routes/
│   ├── +layout.svelte      # アプリ全体のレイアウト
│   ├── +page.svelte        # トップページ
│   ├── instruments/        # 楽器ページ
│   └── settings/           # 設定ページ
└── service-worker.ts       # PWAのキャッシュと更新処理
```

SvelteKitでは、先頭に `+` が付くファイルがルーティングのために特別扱いされます。

そのページだけで使用するコンポーネントやロジックは、対象ルートの近くに配置します。複数ページで共有するコードだけ `src/lib/` に置きます。詳しい実装判断の基準は [`AGENTS.md`](./AGENTS.md) を参照してください。

## プロダクト方針

- 子どもが迷いにくい、単純で大きな操作を優先する
- iPad 等のタブレット端末での操作を考慮する

## 品質確認

変更後は必要に応じて以下を実行します。

```sh
pnpm check
pnpm lint
pnpm test
```

## 全体見直し

AIエージェントに「全体見直し」と依頼すると、[`AGENTS.md`](./AGENTS.md) の基準に沿ってコード全体をレビューします。明示的な許可なしに、コード変更や Issue 作成は行いません。

## Cloudflare Pages

Cloudflare Pages では、以下のビルド設定を使用します。

| 項目                   | 設定値       |
| ---------------------- | ------------ |
| Production branch      | `main`       |
| Build command          | `pnpm build` |
| Build output directory | `build`      |

Pages v3 のビルド環境では、`package.json` の `engines` や `packageManager` からバージョンが自動検出されないため、Production と Preview の環境変数 `NODE_VERSION`, `PNPM_VERSION` を設定します。

Node.js または pnpm を更新するときは、[`mise.toml`](./mise.toml)、[`package.json`](./package.json)、Cloudflare Pages の環境変数を同じバージョンに更新してください。
