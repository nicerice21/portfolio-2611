# ポートフォリオサイト デザイン設計書

> 前提: [要件定義書](./requirements.md)。実装は SvelteKit + Cloudflare Workers、**ライトモードのみ**、軽量性最優先。
> モックアップ: [`mockup/index.html`](../mockup/index.html) ／ 背景の原案: [reference/background-brief.md](./reference/background-brief.md)

---

## 1. コンセプト

**「Markdown ドキュメントを、そのまま読む。」**

サイト全体を 1 枚の Markdown 文書のように構成する。見出し、段落、箇条書き、引用、インラインコード、水平線——Markdown の要素だけで情報を組み、装飾は最小限に留める。カード・グリッド・影・アニメーションは使わない。

- 1 カラム・左揃え・本文幅 46rem。
- 見出しの横に `##` を薄く表示し、Markdown であることをさりげなく示す。
- 日付・タグ・技術名はインラインコード（`` `2026-10-28` ``）として表現。
- ナビはリンクの列挙のみ。JavaScript は使わない。

> Works は**縦の一覧（Markdown リスト）**とする。詳細ページへの導線は各項目のリンクで担保する。

---

## 2. カラー

| トークン | HEX | 用途 |
| :--- | :--- | :--- |
| `--bg` | `#FBFAF8` | 背景 |
| `--ink` | `#1B1A17` | 本文・見出し |
| `--muted` | `#6E6862` | 補助テキスト・リード |
| `--faint` | `#9A938B` | `##`、日付、矢印 |
| `--line` | `#E4E0D8` | 罫線・リンク下線 |
| `--code` | `#F1EDE5` | インラインコード背景 |
| `--accent` | `#E85D1F` | ロゴのドット・フォーカス |
| `--accent-ink` | `#B8430B` | リンク hover |

- オレンジはごく僅か。文字色には `--accent-ink` のみを使う。
- リンクは通常 `--ink` + `--line` の下線。hover で `--accent-ink` + `--accent` の下線。

### 2.1 背景レイヤー（装飾）
紙面に淡い水彩の色面と紙の質感を重ねる。すべて CSS とインライン SVG で生成し、画像ファイル・ライブラリ・JS は追加しない。

| レイヤー | 実装 | 内容 |
| :--- | :--- | :--- |
| 土台 | `body` の背景 | `--bg: #FFFCF7`（温かいオフホワイト） |
| 色面 | `.bg`（`position: absolute; inset: 0 0 auto; height: min(120vh, 1100px)`） | `radial-gradient` 4〜5 枚。左上に淡い空色、右上にクリーム、右中段にピンク、左下にミント。不透明度 0.32〜0.9 で端ほど濃く、中央は透明 |
| 紙の質感 | `body::before`（`position: fixed; inset: 0`） | インライン SVG の `feTurbulence` を 140px タイルで繰り返し、`opacity: 0.045` |
| 紙吹雪・幾何 | `.bg` の追加 `radial-gradient`（点）と `.bg::after`（`box-shadow` で複製した回転正方形） | ピンク・空色・クリームの点 5〜6 個、正方形 4〜5 個。ページ上部と左右の端にのみ配置 |

- 重なり順: `body` 背景 → `body::before`（質感）→ `.bg`（色面・紙吹雪）→ `.doc`（`z-index: 1`）。装飾は常にコンテンツの背面。
- `.bg` は `pointer-events: none` と `aria-hidden="true"`。クリック・選択・読み上げに影響させない。
- 色面はページ上部（約 1 画面分）に限定し、本文が続く下方向では紙面のみになる。
- アニメーションは付けない（`prefers-reduced-motion` への対応は不要になる）。
- スマートフォン（`< 560px`）では色面の不透明度を下げ、点を 2 個に減らし、正方形（`.bg::after`）を非表示にする。質感は `0.035`。
- 装飾を外しても `--bg` の紙色だけで成立する構造にする。

---

## 3. タイポグラフィ

| 役割 | フォント | サイズ |
| :--- | :--- | :--- |
| 本文 | `--font-body`（システム和文サンセリフ） | `1rem` / `line-height: 1.85` |
| 見出し | 同上（700–800） | h1 `clamp(1.5rem, 4vw, 1.9rem)` / h2 `1.3rem` / h3 `1rem` |
| メタ・コード | `--font-mono`（`ui-monospace` 系） | `0.72–0.85em` |

- Web フォントは読み込まない（転送量 0）。
- 本文幅 `max-width: 46rem`（日本語 45〜50 文字）。リードは `0.92rem` + `--muted`。
- 見出しは `##`（h2）のみ薄いモノスペースで前置。h3 には付けない。
- `code` は `--code` 背景 + `border-radius: 3px` + `padding: 0.1em 0.4em`。

---

## 4. レイアウト

```
┌──────────────────────────────────────────┐
│ ricezero•                                │
│ About Skills Experience Works Articles…  │
├──────────────────────────────────────────┤  ← hr
│ 山田 太郎                                 │
│ Student / Software Engineer              │
│ > リード文（blockquote）                   │
│ affiliation 〇〇大学 …                    │
│ location    Tokyo, Japan                 │
│ status      Open to internships          │
│                                          │
│ ## About                                 │
│ 段落 / - 箇条書き                          │
│                                          │
│ ## Skills                                │
│ ### Languages                            │
│ - **TypeScript** (3y) — 説明              │
│                                          │
│ ## Experience                            │
│ ### 会社名                                │
│ `期間` 役割                               │
│ 説明                                      │
│                                          │
│ ## Works                                 │
│ ┌──────┐ タイトル                          │
│ │thumb │ 説明                              │
│ └──────┘ `SvelteKit` `Cloudflare` →        │
│ ─────────────────────────────             │
│ （3 件を縦に）                             │
│                                          │
│ ## Articles                              │
│ `2026-10-28` タイトル · Qiita ↗           │
│                                          │
│ ## Links                                 │
│ GitHub  @ricezero                        │
│                                          │
├──────────────────────────────────────────┤  ← hr
│ © 2026 ricezero        Privacy  Top      │
└──────────────────────────────────────────┘
```

- ページ余白: 上 56px / 左右 24px / 下 96px（モバイル 40/20/72）。
- セクション間 `48px`。見出し前の余白で階層を作り、罫線は最小限。
- 本文の左端はすべて揃える（中央揃え・段組みはしない）。

---

## 5. 要素

### 5.1 ヘッダー
- ロゴ（mono・小文字・オレンジの 6px ドット）＋ ナビ（mono 0.75rem・muted）。
- ナビは `About / Skills / Experience / Works / Articles / Links` のリンク列。sticky にしない。
- 直下に 1px の `hr`。

### 5.2 イントロ
- h1 に名前、その下に役割（mono・muted）。
- リードは `blockquote`（左 2px `--line`、muted）。
- プロフィール情報は `dl` の `key value` 形式（`affiliation` / `location` / `status`）。ラベルは mono・faint、値は本文。

### 5.3 About
- 段落 2 つ + `興味のある領域` の箇条書き（`-` を faint で表示）。

### 5.4 Skills
- `### Languages` / `### Frameworks / Infrastructure / Tools`。
- 各項目は `- **技術名** (年数) — 説明`。年数は本文中のかっこ書き。
- カード・チップ・グリッドは使わない。

### 5.5 Experience
- 1 件 = `### タイトル` + `` `期間` `` + 役割 + 説明段落。
- 期間はインラインコード。時系列は新しい順。
- タイムラインの縦線・ドットは使わない。

### 5.6 Works
- 縦一覧。1 件 = サムネイル（148px・4:3・1px 枠）＋ タイトルリンク ＋ 説明 ＋ 技術のインラインコード ＋ `View case →`。
- 項目間は 1px 罫線のみ（カード化しない）。件数は 3 件程度。
- モバイルではサムネイル 200px 幅でテキストの上に置く。
- 詳細ページへはタイトルと `View case →` から遷移。

### 5.7 Articles
- 1 行 = `` `日付` `` + タイトルリンク + 媒体名（mono）+ `↗`。
- 行間は 8px。罫線は使わず、日付の等幅感でリズムを作る。
- 末尾に `More on Qiita ↗` / `More on Hatena ↗`。

### 5.8 Links
- 1 行 = サービス名リンク（600）+ ハンドル（mono・muted）。
- アイコンは使わない（テキストのみ）。

### 5.9 フッター
- `hr` の下に `© 2026 ricezero` と `Privacy` / `Top`。
- すべて mono・0.72rem・muted。`/privacy` へのリンクを必ず置く。

### 5.10 Works 詳細（`/works/[slug]`）
- h1 タイトル → リード → メタ（`role` / `period` / `stack` / `links` を `dl` で）。
- 画像は 1px 枠のみ、影なし。本文は同じ `.prose`。
- 末尾に一覧へ戻るリンク。

### 5.11 プライバシーポリシー（`/privacy`）
- 同じ 1 カラム文書。タイトル下に `制定日` / `改定日` をインラインコードで。
- 見出しは h2/h3、表は 1px 罫線。冒頭にトップへ戻るリンク。

---

## 6. Markdown → スタイル対応表

| Markdown | 要素 | スタイル |
| :--- | :--- | :--- |
| `# 見出し` | h1 | 800 / 1.5–1.9rem |
| `## 見出し` | h2 | 800 / 1.3rem / 前に薄い `##` |
| `### 見出し` | h3 | 700 / 1rem / 上 28px |
| 段落 | p | 1rem / 1.85 |
| `- 項目` | ul > li | 前に `-`（faint） |
| `> 引用` | blockquote | 左 2px `--line` / muted |
| `` `code` `` | code | `--code` 背景 / 角丸 3px |
| `[text](url)` | a | 下線 `--line` → hover `--accent` |
| `---` | hr | 1px `--line` |
| `**強調**` | strong | 600–700 |

---

## 7. モーション

- なし。色の変化（hover）のみ、`120ms`。
- `prefers-reduced-motion` で `scroll-behavior` を無効化。

---

## 8. レスポンシブ

| 幅 | 挙動 |
| :--- | :--- |
| `< 560px` | 左右 20px。Works はサムネイルを上に置く。ナビは折返し。 |
| `≥ 560px` | Works はサムネイル左・テキスト右。 |

- タップターゲット 44px 以上。横スクロールを出さない。

---

## 9. アクセシビリティ

- フォーカスリング `2px solid var(--accent)` + `outline-offset: 3px`。
- 見出し順序 h1 → h2 → h3。
- リンクは下線で識別（色だけに依存しない）。
- 装飾の `##` と矢印は `aria-hidden="true"`。
- 画像に `alt`、装飾画像は `alt=""`。

---

## 10. パフォーマンス

- モックアップは JavaScript なし・CSS 1 ファイルのみ。実装では `csr = false` でハイドレーションを行わず、クライアント JS はアナリティクスのみ。
- Web フォントなし。追加画像なし（実データのサムネイルのみ）。
- 影・グラデーション・フィルタなし。
- 目標: Lighthouse Performance 95+ / LCP 1.5s 未満 / CLS 0.1 未満。

---

## 11. トークン

```css
:root {
  color-scheme: light;
  --bg: #fbfaf8;
  --ink: #1b1a17;
  --muted: #6e6862;
  --faint: #9a938b;
  --line: #e4e0d8;
  --code: #f1ede5;
  --accent: #e85d1f;
  --accent-ink: #b8430b;

  --font-body: "Hiragino Sans", "Noto Sans JP", "Yu Gothic", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", "Cascadia Code", monospace;

  --measure: 46rem;
}
```

---

## 12. チェックリスト

- [x] カード・グリッド・影・グラデーションを使っていない
- [x] 本文幅が 46rem を超えていない
- [x] 日付・タグ・技術名がインラインコードで統一されている
- [x] 見出しの `##` は h2 のみ
- [x] リンクが下線で識別できる
- [x] ハイドレーション用のクライアント JS を読み込んでいない（アナリティクスを除く）
- [x] 背景装飾が `pointer-events: none` / `aria-hidden` でコンテンツを妨げない
- [x] 背景を外しても紙色だけで読める
- [x] 560px 未満で装飾が減り、横スクロールが出ない
- [x] 320px 幅で横スクロールが出ない
- [x] フッターから `/privacy` に到達できる
