# ポートフォリオサイト 要件定義書

## 1. プロジェクト概要

### 1.1 目的
エンジニア志望の学生としてのプロフィール、技術スキル、経歴、制作物（Works）、技術発信（Articles）、各種外部リンクを集約したポートフォリオサイトを構築する。採用担当者やエンジニアが短時間で全体像を把握でき、興味を持った制作物や記事へスムーズにアクセスできることを目指す。

### 1.2 基本コンセプト
- **ワンページ集約＋詳細ページ構成**: 基本コンテンツ（`about`, `skills`, `experience`, `works`, `articles`, `links`）を1ページ（`/`）に集約し、制作物の詳細のみ別ページ（`/works/[slug]`）で深掘りできる構成とする。
- **軽量・高速（Lightweight & Fast）**: 不要な外部ライブラリや肥大化したクライアントサイドJavaScriptを排除し、Cloudflareのエッジネットワークを活かした高速なページ表示を実現する。
- **MarkdownによるCMSライクなコンテンツ管理**: UI実装とコンテンツデータを分離し、Gitリポジトリ内のMarkdownファイル（Frontmatter + 本文）を編集するだけで更新・追加が完結する仕組みとする。
- **デザインの分離**: 本要件定義では機能・構造・データ・非機能要件を定義し、具体的なビジュアルデザイン（配色・タイポグラフィ・詳細レイアウト等）は別途策定する。

---

## 2. システムアーキテクチャ・技術スタック

| レイヤー / 用途 | 採用技術・サービス | 備考 |
| :--- | :--- | :--- |
| フレームワーク | SvelteKit (Svelte 5) + TypeScript | 軽量なコンパイル結果と高い開発体験 |
| ホスティング / ランタイム | Cloudflare Workers | `@sveltejs/adapter-cloudflare` / Wrangler を使用 |
| コンテンツ管理 | Git管理 Markdown + YAML Frontmatter | `mdsvex` でビルド時に Svelte コンポーネントへ変換。frontmatter は `zod` で検証 |
| アセットストレージ | Cloudflare R2 | 画像・動画等の静的アセットを格納 |
| アセット配信 | R2 カスタムドメイン公開 + Cloudflare CDN | 例: `https://assets.<domain>/...` から直接配信 |
| 外部記事連携 | RSS / Atom フィード取得 (Workers) | `fast-xml-parser` で解析し、Cloudflare Cache API でエッジキャッシュ |
| アクセス解析 | Google Analytics 4 (GA4) / Cloudflare Web Analytics | パフォーマンスを損なわない非同期読み込み。プライバシーポリシーで利用を明記 |

### 2.1 アーキテクチャ構成図
```text
[Browser / User]
   │
   ├── 1. ページリクエスト (/, /works/[slug])
   ▼
[Cloudflare Workers (SvelteKit)]
   ├── 静的コンテンツ (About, Skills, Experience, Works, Links)
   │     └── ビルド時に Markdown から変換・バンドル済み（ゼロレイテンシ）
   └── 外部記事データ (Articles)
         └── Cloudflare Cache API を確認
               ├── Cache Hit  -> キャッシュから即座に返却
               └── Cache Miss -> Qiita / Hatena Blog の RSS/Atom を取得・パースしキャッシュ保存
   │
   ├── 2. アセットリクエスト (画像等)
   ▼
[Cloudflare R2 (カスタムドメイン + CDN Cache)]
```

---

## 3. ページ構成・ルーティング設計

| パス | ページ名 | レンダリング方式 | 概要 |
| :--- | :--- | :--- | :--- |
| `/` | トップページ | SSR (エッジキャッシュ併用) | 全6セクションを縦並びに配置したワンページ構成。Worksは一覧表示。 |
| `/works/[slug]` | 制作物詳細ページ | Prerender | 個別の制作物の詳細説明（Markdown本文）、画像ギャラリー、各種リンクを表示。 |
| `/privacy` | プライバシーポリシーページ | Prerender | アクセス解析ツールの利用・個人情報等の取り扱い方針を記載した独立ページ。 |
| `/sitemap.xml` | サイトマップ | Prerender / Dynamic | クローラー向けサイトマップ |
| `/robots.txt` | robots.txt | Static | クローラー制御用ファイル |

### 3.1 トップページ（`/`）のセクション順序とアンカー
1. **Header / Navigation**: 各セクションへのアンカーリンク（`#about`, `#skills`, `#experience`, `#works`, `#articles`, `#links`）
2. **About (`#about`)**: 自己紹介・基本プロフィール
3. **Skills (`#skills`)**: 技術スタック・使用ツール一覧
4. **Experience (`#experience`)**: 学歴・インターン・ハッカソン・活動歴等のタイムライン
5. **Works (`#works`)**: 制作物の一覧（各項目から `/works/[slug]` へ遷移）
6. **Articles (`#articles`)**: Qiita・はてなブログの最新記事リンク一覧
7. **Links (`#links`)**: SNS・GitHub・連絡先等の外部リンク集
8. **Footer**: コピーライト表記、プライバシーポリシー（`/privacy`）へのリンク

---

## 4. 機能要件（セクション別仕様）

### 4.1 About（自己紹介）
- **目的**: 訪問者に自身の人物像・専攻・興味領域を端的に伝える。
- **表示項目**:
  - 名前 / ハンドルネーム
  - プロフィール画像（R2から配信）
  - 所属（大学・大学院・学部・学科・卒業予定年月など）
  - 関心のある技術領域・志望職種
  - 自己紹介本文（Markdownで記述）

### 4.2 Skills（スキルセット）
- **目的**: 扱えるプログラミング言語、フレームワーク、インフラ、ツールを構造化して提示する。
- **表示項目**:
  - カテゴリ分類（例: `Languages`, `Frontend`, `Backend`, `Infrastructure / Cloud`, `Tools`）
  - スキル名
  - 補足情報（経験年数、個人開発・インターンでの使用実績、概要メモなど）

### 4.3 Experience（経歴・活動歴）
- **目的**: 時系列でこれまでの学習・実践経験（インターン、ハッカソン、研究、アルバイト、登壇・受賞歴など）を示す。
- **表示項目**:
  - 期間（開始年月 〜 終了年月 / 現在）
  - タイトル（企業名・イベント名・所属組織名）
  - 役割・ポジション
  - 活動内容・成果の概要（Markdown対応）
  - 関連リンク（任意）

### 4.4 Works（制作物）
- **目的**: 開発したプロダクトやプロジェクトを提示し、技術的詳細へ誘導する。
- **トップページ（一覧表示）**:
  - 表示項目: サムネイル画像（R2）、タイトル、1〜2行の短い概要、主要使用技術（インラインコード）、詳細ページ（`/works/[slug]`）へのリンク
  - 表示形式: **縦の一覧**。1件を「サムネイル＋テキスト」の行として並べ、項目間は 1px の罫線で区切る。掲載件数は 3 件程度を目安とする。
  - カルーセル・スライダーは使用しない（デザイン方針「Markdown ドキュメント風」に合わせる）。
- **制作物詳細ページ（`/works/[slug]`）**:
  - 表示項目:
    - タイトル、サブタイトル（概要）
    - 制作時期・制作期間、開発体制（個人開発 / チーム開発・担当役割）
    - 使用技術スタック一覧
    - 公開URL（デモサイト等）・GitHubリポジトリURL
    - メインビジュアル / スクリーンショットギャラリー（R2から配信）
    - 詳細本文（Markdownで記述：背景・課題、システム構成、工夫した点、苦労した点、今後の展望など）
    - トップページの `#works` セクションへ戻るナビゲーション

### 4.5 Articles（外部ブログ記事一覧）
- **目的**: Qiita および はてなブログ で執筆した技術記事を自動集約し、継続的なアウトプットを示す。
- **データ取得元**:
  - **Qiita**: Atomフィード（`https://qiita.com/<user_id>/feed`）または Qiita API v2
  - **はてなブログ**: RSS 2.0 / Atomフィード（`https://<blog_domain>/rss` または `/feed`）
- **処理・表示仕様**:
  - 両プラットフォームのフィードを取得・パースし、共通の記事データ型に正規化する。
  - 公開日時の降順（新しい順）でマージ・ソートし、最新 N 件（デフォルト例: 6〜10件）を表示する。
  - 表示項目: 記事タイトル、公開日（`YYYY-MM-DD`）、投稿先バッジ（`Qiita` / `Hatena Blog`）、元記事への外部リンク（`target="_blank" rel="noopener noreferrer"`）、各ブログのプロフィール/一覧ページへの「もっと見る」リンク。
- **キャッシュ・耐障害性**:
  - Cloudflare Cache API（または `fetch` の `cf.cacheTtl`）を利用し、取得結果を一定時間（例: 3600秒 = 1時間）キャッシュする。
  - 片方または両方のフィード取得がタイムアウト（例: 3秒）・エラーとなった場合でもページ全体のレンダリングは失敗させず、取得できた記事のみ表示（またはフォールバックメッセージと各ブログへの直接リンクを表示）する。

### 4.6 Links（各種リンク・連絡先）
- **目的**: GitHubやSNS、ブログ、連絡先への導線を提供する。
- **表示項目**:
  - サービス名 / ラベル（GitHub, X (Twitter), Qiita, Hatena Blog, Zenn, Wantedly, メールアドレス等）
  - アカウントID / 表示テキスト
  - リンク先URL
  - アイコン（インラインSVGで軽量に表示）

### 4.7 プライバシーポリシーページ（`/privacy`）
- **目的**: 当サイトで利用するアクセス解析ツールや個人情報の取り扱いについて明示し、法令および各ツールの利用規約（Google Analytics利用規約等）を遵守する。
- **配置・導線**:
  - トップページとは独立したページ（`/privacy`）として設ける。
  - 全ページ共通のフッター（Footer）に `/privacy` へのリンクを配置し、また `/privacy` ページ内にはトップページ（`/`）へ戻る導線を設ける。
- **記載項目（`src/content/privacy.md` でMarkdown管理）**:
  - **アクセス解析ツールについての明記**:
    - **Google Analytics 4 (GA4)**: トラフィックデータ収集のためにCookie（または類似技術）を使用していること、データは匿名で収集され個人を特定するものではないこと、ブラウザ設定でCookieを無効にすることで収集を拒否できること、およびGoogle社の規約・ポリシーページへのリンク。
    - **Cloudflare Web Analytics**: パフォーマンス・アクセス状況把握のために利用していること（Cookieを使用しないプライバシー重視の解析であること）。
  - **個人情報の利用目的・第三者提供の禁止**: メール等での連絡時に取得した情報の取り扱い方針。
  - **免責事項・著作権**: 外部リンク先（Qiita、はてなブログ、GitHub等）での責任範囲や当サイト内のコンテンツ著作権に関する記載。
  - **制定日・最終改定日**: Frontmatterで管理・表示。

---

## 5. コンテンツ管理要件（Markdown / CMSライク設計）

### 5.1 ディレクトリ構成案
コンテンツは `src/content/` 配下に集約し、UIコンポーネント（`src/routes/`, `src/lib/`）と明確に分離する。

```text
src/content/
├── about.md             # Aboutセクション用（Frontmatter + 自己紹介本文）
├── skills.md            # Skillsセクション用（Frontmatterでカテゴリ・スキル一覧を定義）
├── experience.md        # Experienceセクション用（Frontmatterで経歴リストを定義）
├── links.md             # Linksセクション用（Frontmatterで外部リンク一覧を定義）
├── privacy.md           # プライバシーポリシーページ用（Frontmatter + 本文）
└── works/               # Works個別コンテンツ（ファイル名 = slug）
    ├── portfolio.md
    ├── sample-app.md
    └── ...
```

### 5.2 Frontmatter スキーマ設計

#### `src/content/about.md`
```yaml
---
name: "山田 太郎"
handle: "ricezero"
role: "Student / Software Engineer"
affiliation: "〇〇大学 情報工学部 202X年卒業予定"
location: "Tokyo, Japan"
status: "Open to internships"
avatar: "profile/avatar.webp" # R2上のパス
interests:
  - "Web Frontend / Backend"
  - "Cloud Infrastructure"
---
ここに自己紹介の本文を **Markdown** で記述します。
```

#### `src/content/skills.md`
```yaml
---
categories:
  - name: "Languages"
    items:
      - name: "TypeScript"
        years: 3
        description: "Webアプリケーション開発で日常的に使用"
      - name: "Go"
        years: 2
        description: "REST APIサーバー・CLIツールの開発"
  - name: "Frameworks & Libraries"
    items:
      - name: "Svelte / SvelteKit"
        description: "ポートフォリオや個人開発プロジェクトで使用"
  - name: "Infrastructure & Tools"
    items:
      - name: "Cloudflare (Workers / R2)"
        description: "エッジサーバーレス構成でのホスティング"
---
```

#### `src/content/experience.md`
```yaml
---
items:
  - period: "2025.08 - 2025.09"
    title: "株式会社〇〇 サマーインターンシップ"
    role: "Backend Engineer Intern"
    description: "マイクロサービスの一部API設計・実装を担当。"
    url: "https://example.com"
  - period: "2023.04 - Present"
    title: "〇〇大学 情報工学部"
    role: "学部生"
    description: "コンピュータサイエンス・分散システムを専攻。"
---
```

#### `src/content/works/[slug].md`
```yaml
---
title: "ポートフォリオサイト"
summary: "SvelteKitとCloudflare Workers/R2で構築した軽量ポートフォリオ"
date: "2026-11"
order: 1
published: true
thumbnail: "works/portfolio/thumb.webp" # R2上のパス
images:
  - "works/portfolio/screen-01.webp"
  - "works/portfolio/screen-02.webp"
techStack:
  - "SvelteKit"
  - "TypeScript"
  - "Cloudflare Workers"
  - "Cloudflare R2"
githubUrl: "https://github.com/example/portfolio"
demoUrl: "https://example.com"
role: "個人開発（企画・設計・実装）"
---
## 背景・目的
制作物の詳細説明を **Markdown** で記述します。

## アーキテクチャ・工夫した点
- 見出し、リスト、コードブロック、画像などを自由に記述可能。
```

#### `src/content/links.md`
```yaml
---
items:
  - label: "GitHub"
    handle: "@ricezero"
    url: "https://github.com/..."
  - label: "Qiita"
    handle: "@ricezero"
    url: "https://qiita.com/..."
  - label: "Hatena Blog"
    handle: "blog"
    url: "https://..."
  - label: "X (Twitter)"
    handle: "@..."
    url: "https://x.com/..."
---
```

#### `src/content/privacy.md`
```yaml
---
title: "プライバシーポリシー"
enactedAt: "2026-11-15"
updatedAt: "2026-11-15"
---
## アクセス解析ツールについて
当サイトでは、サイトの利用状況を把握するために **Google Analytics (GA4)** および **Cloudflare Web Analytics** を利用しています。
（以降、Cookieの利用やGoogleの規約リンク、免責事項等をMarkdownで記述）
```

---

## 6. アセット管理要件（Cloudflare R2）

### 6.1 配信方式
- Cloudflare R2 バケットを作成し、カスタムドメイン（例: `https://assets.<your-domain>`）を接続して公開アクセスを許可する。
- Cloudflare CDN によるエッジキャッシュを有効化し、オリジン（R2）へのクラスB操作（読み込みリクエスト）を最小化する。

### 6.2 アセットURL解決の仕組み
- 環境変数 `PUBLIC_ASSETS_BASE_URL`（例: `https://assets.ricezero.fun`）を定義する。
- MarkdownのFrontmatterや本文内では、R2バケット内のキー（例: `works/portfolio/thumb.webp`）のみを記述し、共通ヘルパー関数 `getAssetUrl(path)` で完全なURLに変換する（`http://` や `https://` で始まる外部URLはそのまま返す）。

### 6.3 バケット内ディレクトリ規約
```text
<r2-bucket>/
├── profile/
│   └── avatar.webp
├── ogp/
│   └── default-ogp.png
└── works/
    └── <slug>/
        ├── thumb.webp
        ├── 01.webp
        └── 02.webp
```

---

## 7. 非機能要件

### 7.1 パフォーマンス・軽量性（最重視）
- **目標指標**: Lighthouse Performance スコア 95以上、LCP 1.5秒未満、CLS 0.1未満。
- **JSバンドル削減**:
  - スライダー等の重いサードパーティライブラリは導入しない。表現は HTML と CSS のみで完結させる。
  - アイコン類は巨大なアイコンフォントを避け、必要なインラインSVGのみを使用する。
- **画像最適化**:
  - R2へ配置する画像は原則 `WebP` または `AVIF` 形式とする。
  - ファーストビュー以外の画像（Works一覧のサムネイルなど）には `loading="lazy"` および `decoding="async"` を付与する。
  - レイアウトシフト（CLS）防止のため、`width` / `height` または `aspect-ratio` を明示する。

### 7.2 SEO・OGP対応
- 各ページ（`/` および `/works/[slug]`）に適切な `<title>`, `<meta name="description">`, `canonical` URLを設定する。
- OGP（`og:title`, `og:description`, `og:type`, `og:url`, `og:image`）および Twitter Card（`summary_large_image`）を設定する。`/works/[slug]` では各制作物のサムネイル画像を `og:image` に設定する。
- セマンティックHTML（`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`）を適切に使用する。

### 7.3 アクセシビリティ（a11y）・レスポンシブ
- モバイル・タブレット・デスクトップの各画面幅で破綻なく閲覧・操作できること。
- 外部リンク・本文リンクは下線で識別でき、キーボードフォーカスが明確に見えること。
- すべての意味のある画像に適切な `alt` 属性を設定する。

### 7.4 セキュリティ・外部通信
- 外部リンクには `rel="noopener noreferrer"` を付与する。
- 外部フィード（Qiita / はてなブログ）の取得はサーバーサイド（Workers）で行い、CORS問題を回避するとともに、タイムアウト制御（`AbortSignal.timeout`）を必ず設ける。
- Markdownから変換されたHTMLはビルド時にリポジトリ内の信頼されたファイルのみを対象とする。

### 7.5 アクセス解析（Analytics）要件
- **Google Analytics 4 (GA4)**:
  - 環境変数 `PUBLIC_GA_MEASUREMENT_ID` が設定されている場合のみ `gtag.js` を非同期（`async`）で読み込む（ローカル開発時等の不要な計測を防止）。
  - SvelteKit のクライアントサイドルーティング（`/` ⇄ `/works/[slug]` ⇄ `/privacy`）に対応するため、`afterNavigate` フック等でページビュー計測が正しく送られるようにする。
  - 初期描画パフォーマンス（LCP/INP）への影響を最小化する実装とする。
- **Cloudflare Web Analytics**:
  - Cloudflare ダッシュボードからの自動挿入、または環境変数 `PUBLIC_CF_BEACON_TOKEN` が設定されている場合に軽量ビーコンスクリプト（`defer`）を読み込む。

### 7.6 環境変数・設定管理
`wrangler.jsonc`（または `wrangler.toml` / `.env`）で以下の設定値を管理する。
- `PUBLIC_SITE_URL`: サイトのベースURL（OGP・サイトマップ生成用）
- `PUBLIC_ASSETS_BASE_URL`: R2カスタムドメインのベースURL
- `PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 の測定ID（例: `G-XXXXXXXXXX`）
- `PUBLIC_CF_BEACON_TOKEN`: Cloudflare Web Analytics のビーコントークン（手動埋め込み時・任意）
- `QIITA_FEED_URL`: QiitaのAtomフィードURL（例: `https://qiita.com/<id>/feed`）
- `HATENA_FEED_URL`: はてなブログのRSS/AtomフィードURL（例: `https://<domain>/rss`）

---

## 8. 進捗と今後の進め方

| Phase | 内容 | 状態 |
| :--- | :--- | :--- |
| 1 | 要件定義（本ドキュメント） | 完了 |
| 2 | デザイン・UI設計（[design.md](./design.md) / [mockup](../mockup/index.html)） | 完了 |
| 3 | 実装準備（[architecture.md](./architecture.md) / [implementation-plan.md](./implementation-plan.md)） | 完了 |
| 4 | プロジェクト初期構築・基盤実装 | 完了 |
| 5 | UI実装・R2連携・デプロイ検証 | 実装完了（R2実画像・本番デプロイ待ち） |

### 8.1 実装準備で確定した事項
- コンテンツは `mdsvex` でビルド時に Svelte コンポーネントへ変換する（実行時パースなし）。
- Frontmatter は `zod` でビルド時に検証する。
- フィードは Workers 上で取得し、`fast-xml-parser` でパース、Cache API に 1 時間キャッシュする。
- `/` は SSR、`/works/[slug]` と `/privacy` は prerender。
- クライアント JS はハイドレーション無効（`csr = false`）とし、アナリティクス以外を読み込まない。
- 詳細は [architecture.md](./architecture.md)、タスク分解は [implementation-plan.md](./implementation-plan.md) を参照。
