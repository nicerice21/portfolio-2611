# Portfolio — ricezero

エンジニア志望学生のポートフォリオサイト。
SvelteKit で構築し、Cloudflare Workers でホストする。コンテンツは Markdown、画像は R2 から配信する。

- 1 ページに About / Skills / Experience / Works / Articles / Links を集約
- Works の詳細とプライバシーポリシーのみ独立ページ
- Qiita・はてなブログの記事を Workers 上で取得してキャッシュ
- 軽量（クライアント JS はアナリティクスのみ）・ライトモード・Web フォントなし

## 状態

| フェーズ | 状態 |
| :--- | :--- |
| 要件定義・デザイン設計 | 完了 |
| 静的モックアップ | 完了 |
| 実装準備（アーキテクチャ・計画） | 完了 |
| 実装 | 完了（本番デプロイ待ち） |

## ドキュメント

| ドキュメント | 内容 |
| :--- | :--- |
| [docs/README.md](docs/README.md) | ドキュメントの索引・確定方針・次のアクション |
| [docs/requirements.md](docs/requirements.md) | 要件定義（機能・非機能・コンテンツ仕様） |
| [docs/design.md](docs/design.md) | デザイン設計（コンセプト・配色・タイポグラフィ・背景） |
| [docs/architecture.md](docs/architecture.md) | 技術構成（依存・ディレクトリ・データフロー・環境変数） |
| [docs/implementation-plan.md](docs/implementation-plan.md) | 実装タスク・完了条件・リスク |
| [docs/reference/background-brief.md](docs/reference/background-brief.md) | 背景デザインの原案 |

## モックアップ

デザイン確認用の静的 HTML（ビルド不要）。

```bash
python -m http.server 4173 --directory mockup
# http://localhost:4173/
```

## 実装予定のスタック

- SvelteKit (Svelte 5) + TypeScript
- `@sveltejs/adapter-cloudflare`（Cloudflare Workers）
- `mdsvex` + `zod`（Markdown / frontmatter をビルド時に検証）
- `fast-xml-parser`（Qiita / はてな RSS の解析、サーバー専用）
- Cloudflare R2（画像）+ カスタムドメイン
- Google Analytics 4 / Cloudflare Web Analytics（環境変数で有効化）

## 予定しているコマンド

```bash
npm install
npm run dev       # 開発サーバー
npm run check     # 型・Svelte チェック
npm run build     # 本番ビルド
npm run preview   # Workers 相当でプレビュー
npm run deploy    # Cloudflare へデプロイ
```

## ディレクトリ

```text
docs/     設計資料
mockup/   デザイン確認用の静的モックアップ
src/      実装（Phase 4 で作成）
```
