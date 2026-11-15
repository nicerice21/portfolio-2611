# ドキュメント

エンジニア志望学生のポートフォリオサイト（SvelteKit / Cloudflare Workers）の設計資料。
実装前にここを読めば、何を・なぜ・どの順で作るかが分かる状態を保つ。

---

## 読み順

| # | ドキュメント | 内容 | 状態 |
| :-- | :--- | :--- | :--- |
| 1 | [requirements.md](./requirements.md) | 目的・機能要件・非機能要件・コンテンツ仕様 | 確定 |
| 2 | [design.md](./design.md) | コンセプト・配色・タイポグラフィ・コンポーネント・背景 | 確定 |
| 3 | [architecture.md](./architecture.md) | 技術選定・ディレクトリ構成・データフロー・環境変数 | 確定 |
| 4 | [implementation-plan.md](./implementation-plan.md) | タスク分解・完了条件・リスク | 実装完了（デプロイ待ち） |
| — | [reference/background-brief.md](./reference/background-brief.md) | 背景デザインの原案（参考資料） | 参考 |
| — | [`mockup/index.html`](../mockup/index.html) | デザイン確認用の静的モックアップ | 参考 |

---

## 確定している方針（要約）

**プロダクト**

- 1 ページに `about / skills / experience / works / articles / links` を集約。Works の詳細と `/privacy` のみ独立ページ。
- コンテンツは Git 管理の Markdown + frontmatter。UI とデータを分離する。
- 記事一覧は Qiita / はてなブログのフィードを Workers で取得し、Cache API に 1 時間キャッシュ。
- アセットは R2 のカスタムドメインから配信。
- GA4 と Cloudflare Web Analytics を環境変数で有効化。`/privacy` に明記。

**デザイン**

- 「Markdown ドキュメントをそのまま読む」1 カラム（46rem）。
- オフホワイトの紙面 + 淡い水彩の色面 + 紙の質感 + 少数の紙吹雪。装飾は本文の背面。
- カード・影・グラデーション・カルーセルは使わない。
- ライトモードのみ。Web フォントなし。

**技術**

- SvelteKit (Svelte 5) + TypeScript / `@sveltejs/adapter-cloudflare`。
- `mdsvex` でビルド時に Markdown を変換、`zod` で frontmatter を検証。
- `fast-xml-parser` でフィードを解析（サーバー専用）。
- `csr = false`。クライアント JS はアナリティクスのみ。
- `/` は SSR、`/works/[slug]` と `/privacy` は prerender。

---

## 現在の状態

| 項目 | 状態 |
| :--- | :--- |
| 要件定義 | 完了 |
| デザイン設計 | 完了 |
| 静的モックアップ | 完了（`mockup/index.html`） |
| 実装準備（アーキテクチャ・計画） | 完了 |
| SvelteKit プロジェクト | 完了（R2実画像配置・本番デプロイ待ち） |

### モックアップの確認方法

```bash
python -m http.server 4173 --directory mockup
# http://localhost:4173/
```

---

## 次のアクション

1. [architecture.md §12](./architecture.md#12-未確定事項) の未確定事項を決める（ドメイン・Qiita / はてな・R2）。
2. [implementation-plan.md](./implementation-plan.md) の Phase 4.1 から着手する。
3. 実装中に仕様判断が変わったら、**先にドキュメントを更新してから**コードを変更する。

---

## ドキュメント運用ルール

- 仕様の正は `requirements.md`、見た目の正は `design.md`、実装の正は `architecture.md`。
- 意思決定が変わった場合は、該当ドキュメントの該当箇所を更新し、必要なら本ファイルの「確定している方針」も直す。
- モックアップはデザイン確認用。実装コードの代わりにはしない。
- 実装完了後は、`implementation-plan.md` のチェックボックスと「現在の状態」を更新する。
