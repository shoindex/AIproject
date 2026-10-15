# 技術スタック

## フロントエンド

| 項目 | 候補 |
| --- | --- |
| 言語 | JavaScript |
| フレームワーク | React |
| ビルドツール | Vite |
| パッケージ管理 | npm |
| ランタイム | Node.js |

## バックエンド

| 項目 | 候補 |
| --- | --- |
| 言語 | Java 21 |
| フレームワーク | Spring Boot |
| ビルドツール | Maven |
| Web API | Spring Web（spring-boot-starter-web） |
| 永続化（ORM） | Spring Data JPA（Hibernate） |

## データベース

| 項目 | 候補 |
| --- | --- |
| DBMS | PostgreSQL |
| 実行環境 | Docker / Docker Compose |
| スキーマ管理 | Hibernateの `ddl-auto=update`（学習用途のため。将来的にFlyway等への変更も検討可） |

## 開発ツール

| 項目 | 候補 |
| --- | --- |
| コンテナ | Docker Desktop（WSL2バックエンド） |
| バージョン管理 | Git / GitHub |

## 選定理由・補足

- バックエンドはJava + Spring Boot、フロントエンドはReact（Next.jsは対象外）、データベースはPostgreSQLという指定に基づき、周辺ツールは各フレームワークの標準的な組み合わせ（Maven, Vite, Spring Data JPA等）を選定した
- データベースはDocker Composeでローカルに起動し、本番環境へのデプロイは対象外とする（非機能要件を参照）
- スキーマ管理は学習段階のため `ddl-auto=update` を採用し、Flyway/Liquibaseのような migration 管理は今回は導入しない

システム構成・データ構造の詳細は [データベース設計](./database-design.md) を参照。
