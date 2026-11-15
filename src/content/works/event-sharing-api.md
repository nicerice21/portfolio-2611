---
title: "イベント情報共有 API"
summary: "ハッカソンで開発。重複登録を DB 制約で防ぎ、読み取りはキャッシュに逃がす構成。"
date: "2026-03"
order: 2
published: true
thumbnail: "works/event-sharing-api/thumb.webp"
images:
  - "works/event-sharing-api/screen-01.webp"
techStack:
  - "Go"
  - "PostgreSQL"
githubUrl: "https://github.com/ricezero/event-sharing-api"
role: "チーム開発（4名 / バックエンド・インフラ担当）"
---

## 背景・目的

24 時間ハッカソンにて、地域イベントの開催情報を集約・共有する Web アプリケーションのバックエンド API を開発しました。短時間で安定したレスポンスとデータ整合性を両立させることを目標としました。

## アーキテクチャ・工夫した点

- **DB 制約による重複防止**: アプリケーション層のロックだけに頼らず、PostgreSQL の複合ユニーク制約と `ON CONFLICT` を活用して同時リクエスト時の重複登録を防止しました。
- **読み取り負荷の軽減**: 参照頻度の高いイベント一覧エンドポイントにキャッシュ層を設け、DB へのクエリ集中を回避しました。
- **スキーマ駆動の並列開発**: OpenAPI スキーマを最初にチームで合意し、フロントエンドとバックエンドを並行して実装できる体制を整えました。
