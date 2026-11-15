---
title: "軽量ポートフォリオサイト"
summary: "SvelteKit と Cloudflare Workers / R2 で構築した1ページ完結のサイト。初期 JS は 20KB 台。"
date: "2026-11"
order: 1
published: true
thumbnail: "works/portfolio/thumb.webp"
images:
  - "works/portfolio/screen-01.webp"
  - "works/portfolio/screen-02.webp"
techStack:
  - "SvelteKit"
  - "Cloudflare"
githubUrl: "https://github.com/ricezero/portfolio-2611"
demoUrl: "https://ricezero.fun"
role: "個人開発（要件定義・デザイン・実装）"
---

## 背景・目的

採用担当者やエンジニアが短時間でプロフィール・経歴・制作物・技術記事を把握できるよう、1 ページに主要情報を集約しつつ制作物の詳細を深掘りできるポートフォリオサイトを構築しました。

「Markdown ドキュメントをそのまま読む」体験をコンセプトに据え、過剰な装飾やサードパーティのスクリプトを排した設計としています。

## アーキテクチャ・工夫した点

- **ビルド時 Markdown 変換とスキーマ検証**: コンテンツを `src/content/` 配下の Markdown に分離し、`mdsvex` と `zod` でビルド時に型検証・コンポーネント化することで実行時のパースコストをゼロにしています。
- **ハイドレーション無効化 (`csr = false`)**: アンカー移動と通常のページ遷移のみで完結する設計とし、クライアントサイドの JavaScript バンドルを排除しました。
- **エッジでの外部フィード集約**: Qiita・はてなブログのフィードを Cloudflare Workers 上で並列取得し、Cache API で 1 時間キャッシュするとともに、片方がタイムアウトしてもページ描画を止めない耐障害性を確保しています。
