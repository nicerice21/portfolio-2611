# 実装計画

> 仕様は [requirements.md](./requirements.md)、設計は [design.md](./design.md)、技術構成は [architecture.md](./architecture.md)。
> このドキュメントは「上から順に実施すれば完成する」タスクリストとして使う。

---

## 0. 開始条件

- [ ] 未確定事項（[architecture.md §12](./architecture.md#12-未確定事項)）のうち、`PUBLIC_SITE_URL` / Qiita / はてな / R2 を決定
- [x] Node.js 20+ と npm が使える
- [ ] Cloudflare アカウントで Workers と R2 を有効化済み
- [x] 作業ブランチを切る（例: `feat/initial-implementation`）

> アナリティクス ID と実コンテンツは後から差し替え可能なため、開始条件には含めない。

---

## Phase 4: プロジェクト初期構築・基盤実装

### 4.1 プロジェクト作成

- [x] `npm create svelte@latest .`（Skeleton project / TypeScript / ESLint + Prettier は任意）
- [x] `@sveltejs/adapter-cloudflare` を導入し、`svelte.config.js` の adapter を差し替え
- [x] `wrangler.jsonc` を作成（`name`, `compatibility_date`, `assets`）
- [x] `.gitignore` を整備（`node_modules`, `.svelte-kit`, `build`, `.wrangler`, `.dev.vars`, `.env`）
- [x] `.env.example` を作成（[architecture.md §9](./architecture.md#9-環境変数) のキーのみ）
- [x] `npm run dev` で初期ページが表示される

**完了条件**: `npm run check` と `npm run build` が通る。

### 4.2 スタイル基盤

- [x] `src/app.css` に [design.md §11](./design.md#11-トークン) のトークンを移植
- [x] ベースタイポグラフィ（本文 1rem / 1.85、`palt`、リンク下線）を実装
- [x] 背景レイヤー（`.bg` / `body::before` の紙質感 / 紙吹雪）を mockup から移植
- [x] `body { overflow-x: clip }`、`prefers-reduced-motion` の扱いを反映
- [x] `src/app.html` に `lang="ja"`、viewport、theme-color を設定

**完了条件**: 320px 幅で横スクロールが出ない。本文コントラストが 7:1 以上。

### 4.3 コンテンツパイプライン

- [x] `mdsvex` を導入し、`extensions` に `.md` を追加
- [x] `zod` を導入し、`src/lib/content/schemas.ts` を作成（[architecture.md §4.2](./architecture.md#42-スキーマsrclibcontentschemats)）
- [x] `src/lib/content/load.ts` を作成（`getAbout` / `getSkills` / `getExperience` / `getLinks` / `getPrivacy` / `getWorks` / `getWork`）
- [x] `src/content/` にサンプル Markdown を配置（about / skills / experience / links / privacy / works × 3）
- [x] frontmatter の検証エラーがビルドを落とすことを確認

**完了条件**: サンプルコンテンツで全セクションのデータが取得できる。不正 frontmatter で `npm run build` が失敗する。

### 4.4 レイアウトと共通コンポーネント

- [x] `+layout.ts` に `export const csr = false`
- [x] `+layout.svelte` にヘッダー / フッター / Analytics を配置
- [x] `SiteHeader.svelte`（ロゴ + アンカーナビ）
- [x] `SectionHeading.svelte`（`##` + 見出し + 任意のリード）
- [x] `Prose.svelte`（`.prose` ラッパー）
- [x] `SiteFooter.svelte`（メール / Privacy / Top）
- [x] `+error.svelte`（404・500 の最小表示）

**完了条件**: ナビのアンカーが全セクションに遷移する。キーボードでフォーカスが見える。

### 4.5 トップページ（`/`）

- [x] `+page.server.ts` でコンテンツと記事を取得して返す
- [x] イントロ（名前・役割・blockquote・key-value）
- [x] About / Skills / Experience
- [x] Works（縦一覧・3 件）
- [x] Articles（日付 / タイトル / 媒体 / ↗）
- [x] Links
- [x] `setHeaders({ 'cache-control': 'public, max-age=0, s-maxage=3600' })`

**完了条件**: mockup と同等の見た目・情報順序。記事が空でもレイアウトが崩れない。

### 4.6 詳細ページ

- [x] `/works/[slug]/+page.server.ts`（`prerender = true` / `entries` / 404）
- [x] `/works/[slug]/+page.svelte`（タイトル・メタ・画像・本文・戻るリンク）
- [x] `/privacy/+page.svelte`（`privacy.md` を描画、制定日・改定日）
- [x] `/sitemap.xml/+server.ts`（`/`, works, `/privacy`）
- [x] `/robots.txt/+server.ts`
- [x] 全ページの `<title>` / `description` / OGP / canonical

**完了条件**: 存在しない slug が 404。sitemap に全 works が含まれる。

### 4.7 フィード取得

- [x] `fast-xml-parser` を導入（`dependencies`。クライアントで import しない）
- [x] `src/lib/feeds/qiita.ts` / `hatena.ts` / `index.ts`
- [x] Cache API + 開発時 Map フォールバック
- [x] `AbortSignal.timeout(3000)` と `Promise.allSettled`
- [x] 成功分のみキャッシュ、失敗時は空配列 + フォールバック表示
- [x] 最新 8 件を日付降順でマージ

**完了条件**: 片方の URL を不正にしてもページが 200 で表示される。2 回目のリクエストでキャッシュヒットする。

### 4.8 R2 連携

- [ ] R2 バケット作成、カスタムドメイン接続、公開設定
- [x] `src/lib/assets.ts` の `getAssetUrl()` を実装
- [ ] サンプル画像を `profile/` と `works/<slug>/` に配置
- [x] 画像に `width`/`height`（または `aspect-ratio`）・`loading`・`alt` を設定

**完了条件**: R2 の画像が表示され、CLS が 0.1 未満。

### 4.9 アナリティクス

- [x] `Analytics.svelte` を実装（GA4 / Cloudflare ビーコン、未設定時は非出力）
- [x] `/privacy` の本文に両ツールの記載があることを確認
- [x] 本番のみ計測されることを確認（ローカルでは出力されない）

**完了条件**: 環境変数を空にするとスクリプトタグが 0 個。設定時のみ 1 個ずつ出力。

---

## Phase 5: 検証・デプロイ

### 5.1 QA

- [x] `npm run check` / `npm run build`
- [x] `npm run preview` で Workers 相当の挙動を確認
- [ ] Lighthouse（モバイル）: Perf 95+ / A11y 100 / BP 95+ / SEO 100
- [x] 320 / 390 / 768 / 1280 / 1440px の表示確認
- [x] キーボード操作（Tab / Enter）で全リンクに到達
- [x] `prefers-reduced-motion: reduce` で不要な動きがないこと
- [x] リンク切れチェック（内部アンカー・外部 URL）
- [ ] OGP プレビュー確認（X / Slack）

### 5.2 デプロイ

- [ ] `wrangler.jsonc` に vars を設定（Secrets は `wrangler secret put`）
- [ ] `npm run deploy`（`wrangler deploy`）
- [ ] 本番 URL で `/` `/works/[slug]` `/privacy` `/sitemap.xml` `/robots.txt` を確認
- [ ] フィードが本番で取得・キャッシュされることを確認
- [ ] アクセス解析のリアルタイム計測を確認

---

## 完了の定義（DoD）

1. 全ページが本番 URL で表示でき、404 も適切に返る。
2. `npm run build` が frontmatter 検証込みで成功する。
3. Lighthouse の目標値を満たす。
4. 記事フィードが片方失敗してもページが表示される。
5. `/privacy` に GA4 と Cloudflare Web Analytics の記載がある。
6. 320px 幅で横スクロールが発生しない。
7. ドキュメント（requirements / design / architecture / 本計画）と実装が一致している。

---

## リスクと代替案

| リスク | 影響 | 対応 |
| :--- | :--- | :--- |
| `mdsvex` と Svelte 5 の相性問題 | ビルド不可 | `marked` + `gray-matter` を Vite プラグインでビルド時に変換する方式へ切替（実行時パースはしない方針を維持） |
| フィードの形式変更 | 記事が表示されない | パースを防御的に書き、失敗時はフォールバックリンクを表示 |
| Cache API が開発環境で使えない | 毎回取得 | モジュールスコープ `Map` にフォールバック（実装済み方針） |
| R2 カスタムドメイン未接続 | 画像が出ない | 一時的に `PUBLIC_ASSETS_BASE_URL` を Workers 経由の URL に差し替え |
| `csr = false` で一部の UI が動かない | 操作不能 | 本サイトはアンカーとリンクのみのため影響なし。動的 UI を足す場合は該当ルートのみ `csr = true` |
| 背景の `100vw` による横スクロール | レイアウト崩れ | `overflow-x: clip` と実機確認（320px） |

---

## 実装順の推奨

```text
4.1 作成
 └─ 4.2 スタイル
     └─ 4.3 コンテンツ
         └─ 4.4 共通UI
             ├─ 4.5 トップ
             ├─ 4.6 詳細・privacy・sitemap
             └─ 4.7 フィード
                 └─ 4.8 R2
                     └─ 4.9 解析
                         └─ 5 検証・デプロイ
```

4.5 と 4.7 は並行可能。4.8 は画像素材が揃うまで 4.6 と並行して進められる。
