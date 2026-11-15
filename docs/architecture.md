# 実装アーキテクチャ

> 要件は [requirements.md](./requirements.md)、見た目は [design.md](./design.md)、作業順は [implementation-plan.md](./implementation-plan.md)。

---

## 1. 全体像

```text
Browser
  │
  ├─ GET /                ──► Workers (SSR)
  │                           ├─ src/content/*.md をビルド時に取り込み済み
  │                           ├─ Cache API: feeds キャッシュ (TTL 1h)
  │                           │    ├─ hit  → キャッシュから返す
  │                           │    └─ miss → Qiita / はてな RSS 取得 → 正規化 → 保存
  │                           └─ HTML + Cache-Control: s-maxage=3600
  │
  ├─ GET /works/[slug]    ──► prerender 済み HTML（Workers から配信）
  ├─ GET /privacy         ──► prerender 済み HTML
  ├─ GET /sitemap.xml     ──► prerender
  │
  └─ GET 画像             ──► R2 カスタムドメイン (assets.<domain>) + CDN
```

- コンテンツ（Markdown）は**ビルド時**に Svelte コンポーネントへ変換する。実行時の Markdown パースは行わない。
- 外部フィードのみ**実行時**に取得する。失敗してもページは表示する。
- クライアント JS は原則読み込まない（`csr = false`）。例外はアナリティクスのみ。

---

## 2. 技術スタック

| 種別 | 採用 | 備考 |
| :--- | :--- | :--- |
| フレームワーク | SvelteKit (Svelte 5) + TypeScript | `strict` |
| アダプタ | `@sveltejs/adapter-cloudflare` | Workers + Assets |
| ビルド | Vite | 既定設定 |
| Markdown | `mdsvex` | `.md` → Svelte コンポーネント。frontmatter は `metadata` |
| スキーマ検証 | `zod` | ビルド時に frontmatter を検証し、不正なら fail |
| フィード解析 | `fast-xml-parser` | サーバー専用。クライアントバンドルに含めない |
| スタイル | 素の CSS（`src/app.css` + スコープ付き `<style>`） | CSS フレームワークなし |
| 解析 | GA4 / Cloudflare Web Analytics | 環境変数がある場合のみ出力 |

追加しないもの: CSS フレームワーク、アイコンライブラリ、カルーセル/アニメーションライブラリ、Web フォント、状態管理ライブラリ。

---

## 3. ディレクトリ構成

```text
portfolio-2611/
├── docs/
├── mockup/                      # デザイン確認用（ビルド対象外）
├── src/
│   ├── app.html
│   ├── app.css                  # トークン・ベース・背景・.prose
│   ├── content/
│   │   ├── about.md
│   │   ├── skills.md
│   │   ├── experience.md
│   │   ├── links.md
│   │   ├── privacy.md
│   │   └── works/
│   │       ├── portfolio.md
│   │       └── ...
│   ├── lib/
│   │   ├── content/
│   │   │   ├── schemas.ts       # zod スキーマ
│   │   │   └── load.ts          # import.meta.glob ローダー
│   │   ├── feeds/
│   │   │   ├── index.ts         # 取得・マージ・キャッシュ
│   │   │   ├── qiita.ts
│   │   │   └── hatena.ts
│   │   ├── assets.ts            # getAssetUrl()
│   │   └── components/
│   │       ├── SiteHeader.svelte
│   │       ├── SectionHeading.svelte
│   │       ├── Prose.svelte
│   │       ├── WorkItem.svelte
│   │       ├── ArticleList.svelte
│   │       ├── Analytics.svelte
│   │       └── SiteFooter.svelte
│   └── routes/
│       ├── +layout.svelte
│       ├── +layout.ts           # csr = false
│       ├── +page.svelte
│       ├── +page.server.ts      # コンテンツ + フィード
│       ├── works/[slug]/
│       │   ├── +page.svelte
│       │   └── +page.server.ts  # entries / 404
│       ├── privacy/+page.svelte
│       ├── sitemap.xml/+server.ts
│       ├── robots.txt/+server.ts
│       └── +error.svelte
├── static/
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
├── .env.example
└── package.json
```

---

## 4. コンテンツパイプライン

### 4.1 mdsvex 設定

```js
// svelte.config.js
import { mdsvex } from 'mdsvex';

export default {
  preprocess: [vitePreprocess(), mdsvex()],
  extensions: ['.svelte', '.md'],
  kit: { adapter: cloudflare() }
};
```

- `import.meta.glob('/src/content/works/*.md')` でモジュールを列挙する。
- 各モジュールは `{ metadata, default: Component }` を返す。
- 本文は `<Prose><Content /></Prose>` として描画する（`Prose` は `.prose` クラスのラッパー）。

### 4.2 スキーマ（`src/lib/content/schemas.ts`）

```ts
import { z } from 'zod';

export const aboutSchema = z.object({
  name: z.string(),
  handle: z.string(),
  role: z.string(),
  affiliation: z.string(),
  location: z.string().optional(),
  status: z.string().optional(),
  avatar: z.string().optional(),
  interests: z.array(z.string()).default([])
});

export const skillsSchema = z.object({
  categories: z.array(z.object({
    name: z.string(),
    items: z.array(z.object({
      name: z.string(),
      years: z.number().optional(),
      description: z.string()
    }))
  }))
});

export const experienceSchema = z.object({
  items: z.array(z.object({
    period: z.string(),
    title: z.string(),
    role: z.string(),
    description: z.string(),
    url: z.string().url().optional()
  }))
});

export const linksSchema = z.object({
  items: z.array(z.object({
    label: z.string(),
    handle: z.string(),
    url: z.string().url()
  }))
});

export const privacySchema = z.object({
  title: z.string(),
  enactedAt: z.string(),
  updatedAt: z.string()
});

export const workSchema = z.object({
  title: z.string(),
  summary: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}$/),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
  thumbnail: z.string(),
  images: z.array(z.string()).default([]),
  techStack: z.array(z.string()).default([]),
  role: z.string(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional()
});

export type Work = z.infer<typeof workSchema> & { slug: string };
```

- 検証はローダー内で行い、失敗時は `throw`（ビルドが落ちる＝公開前に気づける）。
- 任意項目は表示側で `{#if}` する。

### 4.3 ローダー（`src/lib/content/load.ts`）

```ts
const workModules = import.meta.glob('/src/content/works/*.md');

export async function getWorks(): Promise<Work[]> {
  const list = await Promise.all(
    Object.entries(workModules).map(async ([path, load]) => {
      const mod = (await load()) as { metadata: unknown; default: unknown };
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      return { slug, ...workSchema.parse(mod.metadata), component: mod.default };
    })
  );
  return list
    .filter((w) => w.published)
    .sort((a, b) => b.order - a.order || a.title.localeCompare(b.title, 'ja'));
}
```

- 単一ファイルのコンテンツ（about 等）も同じ要領で `getAbout()` などを用意する。
- 一覧は `order` 昇順/降順のどちらかに統一する（実装では `order` の小さい順を推奨）。

---

## 5. ルーティングとレンダリング

| ルート | 方式 | データ | キャッシュ |
| :--- | :--- | :--- | :--- |
| `/` | SSR | コンテンツ（ビルド時） + 記事（実行時） | `Cache-Control: public, max-age=0, s-maxage=3600` |
| `/works/[slug]` | prerender | `getWorks()` から `entries` 生成 | 静的 |
| `/privacy` | prerender | `privacy.md` | 静的 |
| `/sitemap.xml` | prerender | works + 固定ページ | 静的 |
| `/robots.txt` | prerender | 固定 | 静的 |
| 404 | `+error.svelte` | — | — |

```ts
// src/routes/+layout.ts
export const csr = false;
```

```ts
// src/routes/works/[slug]/+page.server.ts
export const prerender = true;

export async function entries() {
  return (await getWorks()).map((w) => ({ slug: w.slug }));
}
```

- `csr = false` によりハイドレーションを行わない。アンカーリンクと通常の遷移のみで成立する。
- 記事一覧の取得に失敗した場合も `/` は 200 を返す（セクション内でフォールバック表示）。

---

## 6. フィード取得

### 6.1 型と正規化

```ts
export type Article = {
  title: string;
  url: string;
  publishedAt: string; // YYYY-MM-DD
  source: 'qiita' | 'hatena';
};
```

- Qiita: Atom（`entry` 配列）。`title` / `link[href]` / `published` を読む。
- はてな: RSS 2.0（`item` 配列）。`title` / `link` / `pubDate` を読む。
- パーサは配列・単一要素の両方を許容する（`fast-xml-parser` の `isArray` 設定に依存しない実装にする）。

### 6.2 取得とキャッシュ

```ts
const TTL_SECONDS = 3600;

async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cache = (globalThis as any).caches?.default as Cache | undefined;
  const cacheKey = new Request(`https://internal.invalid/${key}`);

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return (await hit.json()) as T;
  }

  const data = await fetcher();

  if (cache) {
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(data), {
        headers: { 'content-type': 'application/json', 'cache-control': `max-age=${TTL_SECONDS}` }
      })
    );
  }
  return data;
}
```

- `fetch(url, { signal: AbortSignal.timeout(3000), headers: { 'user-agent': 'portfolio-bot/1.0' } })`。
- 取得は `Promise.allSettled` で並列化し、成功分のみ採用する。
- 片方でも成功すれば表示。両方失敗時は `articles: []` とし、`Qiita` / `Hatena` への直接リンクを表示する。
- キャッシュには**成功した結果のみ**保存する（エラーをキャッシュしない）。
- 開発時（`caches` が無い環境）はモジュールスコープの `Map` にフォールバックする。

### 6.3 表示

- `publishedAt` 降順でマージし、上位 8 件を表示する。
- 日付は `YYYY-MM-DD`、媒体名はテキスト、リンクは `target="_blank" rel="noopener noreferrer"`。

---

## 7. アセット（R2）

```ts
// src/lib/assets.ts
import { PUBLIC_ASSETS_BASE_URL } from '$env/static/public';

export function getAssetUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${PUBLIC_ASSETS_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
```

- Frontmatter には R2 のキー（`works/portfolio/thumb.webp`）のみを書く。
- `<img>` には `width` / `height` または `aspect-ratio`、`loading="lazy"`、`decoding="async"`、`alt` を必ず付与する。
- サムネイルは 4:3、詳細のメイン画像は 16:9 を基本とする。

---

## 8. アナリティクス

```svelte
<!-- src/lib/components/Analytics.svelte -->
<script lang="ts">
  import { PUBLIC_GA_MEASUREMENT_ID, PUBLIC_CF_BEACON_TOKEN } from '$env/static/public';
</script>

{#if PUBLIC_GA_MEASUREMENT_ID}
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_MEASUREMENT_ID}`}></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{PUBLIC_GA_MEASUREMENT_ID}');
  </script>
{/if}

{#if PUBLIC_CF_BEACON_TOKEN}
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token":"${PUBLIC_CF_BEACON_TOKEN}"}`}></script>
{/if}
```

- `csr = false` のため SPA 遷移はなく、`afterNavigate` は不要。通常のページビューで計測される。
- 環境変数が未設定なら何も出力しない（ローカル開発で計測しない）。
- 実際の実装では `svelte:head` 内に配置し、`{PUBLIC_GA_MEASUREMENT_ID}` は式展開で埋め込む。

---

## 9. 環境変数

| 変数 | スコープ | 必須 | 用途 |
| :--- | :--- | :--- | :--- |
| `PUBLIC_SITE_URL` | ビルド / クライアント | ○ | canonical・OGP・sitemap |
| `PUBLIC_ASSETS_BASE_URL` | ビルド / クライアント | ○ | R2 カスタムドメイン |
| `QIITA_FEED_URL` | サーバー | ○ | Qiita Atom フィード |
| `HATENA_FEED_URL` | サーバー | ○ | はてな RSS |
| `PUBLIC_GA_MEASUREMENT_ID` | ビルド / クライアント | — | GA4 |
| `PUBLIC_CF_BEACON_TOKEN` | ビルド / クライアント | — | Cloudflare Web Analytics |

- ローカルは `.env`（git 管理外）、本番は `wrangler.jsonc` の `vars` または Secrets。
- `.env.example` にキーのみ記載する（値は空）。

---

## 10. エラー処理・フォールバック

| 事象 | 挙動 |
| :--- | :--- |
| frontmatter 不正 | ビルド失敗（公開しない） |
| Work の slug 重複 | ビルド時に検出して失敗 |
| フィード取得失敗（片方） | 成功分のみ表示。失敗媒体へのリンクは常に表示 |
| フィード全滅 | 記事リストの代わりに「Qiita / はてなで読む」リンクを表示 |
| 画像 404 | `alt` テキストが表示される。レイアウトは崩れない |
| 存在しない `/works/*` | 404（`+error.svelte`） |

---

## 11. 検証

```bash
npm run check      # svelte-check + tsc
npm run build      # 本番ビルド（frontmatter 検証を含む）
npm run preview    # wrangler dev で Workers 相当を確認
```

- Lighthouse（モバイル）: Performance 95+ / Accessibility 100 / Best Practices 95+ / SEO 100。
- 320 / 390 / 768 / 1280 / 1440px で表示確認。
- キーボードのみでナビ・リンク・戻る導線を操作できること。
- フィード失敗を再現するため、環境変数に不正 URL を入れて表示を確認する。

---

## 12. 未確定事項

| 項目 | 決定が必要な内容 |
| :--- | :--- |
| ドメイン | 本番 URL（`PUBLIC_SITE_URL`） |
| Qiita | ユーザー ID（フィード URL） |
| はてなブログ | ブログドメイン（フィード URL） |
| アナリティクス | GA4 測定 ID / Cloudflare ビーコントークン |
| R2 | バケット名・カスタムドメイン |
| 連絡先 | 公開メールアドレス・X アカウント |
| コンテンツ | Works 3 件・経歴・スキルの実データ |
| OGP | デフォルト画像の用意（1200×630） |
