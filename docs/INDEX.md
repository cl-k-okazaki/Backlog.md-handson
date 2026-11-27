# ドキュメント一覧

## ルート直下

| パス | 説明 | いつ読むか |
| --- | --- | --- |
| [README.md](../README.md) | Backlog.md の概要、導入、日本語のクイックスタート、Web 画面と MCP の使い方 | 初めて触るとき、導入や基本の使い方を確かめたいとき |
| [MANIFESTO.md](../MANIFESTO.md) | 誰のための製品か、コアループ、情報の正本、画面の優先順位、設計原則と境界をまとめた方針 | 設計や仕様を決める前、変更が製品の方針に合うか迷ったとき |
| [AGENTS.md](../AGENTS.md) | エージェントと開発者向けの作業規約（スコープ、テスト、レビュー、Git の運用、Backlog の使い方） | 作業を始める前、コミットや PR、レビューの決まりを確かめたいとき |
| [CLAUDE.md](../CLAUDE.md) | Claude Code が読み込む入口で、AGENTS.md へのシンボリックリンク | Claude Code が読む規約を確かめたいとき（中身は AGENTS.md を読む） |
| [CLI-INSTRUCTIONS.md](../CLI-INSTRUCTIONS.md) | `backlog` コマンドの全リファレンス（タスク、マイルストーン、検索、文書、決定事項など） | コマンドの書き方やオプションを調べたいとき |
| [ADVANCED-CONFIG.md](../ADVANCED-CONFIG.md) | `backlog config` の設定項目と既定値の一覧、各設定の詳しい注意 | 設定を変えたいとき、設定項目の意味や既定値を知りたいとき |
| [DEVELOPMENT.md](../DEVELOPMENT.md) | このリポジトリの開発環境、テストと型チェック、単体ビルド、Nix、MCP の開発、リリースの手順 | ソースから動かすとき、テストやビルド、リリースの手順を確かめたいとき |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Issue と PR の出し方、ブランチ名、テストと lint の流れ | Issue や PR を出す前 |

## backlog/docs/

| パス | 説明 | いつ読むか |
| --- | --- | --- |
| [backlog/docs/readme.md](../backlog/docs/readme.md) | このフォルダの役割、`backlog doc` コマンド、config.yml の主な設定 | 文書を追加するとき、このフォルダに何を置くか確かめたいとき |
| [backlog/docs/doc-001 - Testing-Style-Guide.md](../backlog/docs/doc-001%20-%20Testing-Style-Guide.md) | テストの書き方の規約（分離、後片付け、タイマー、アサーション、対象プラットフォーム） | テストを書く前、直す前 |
| [backlog/docs/doc-002 - Configuring-VIM-and-Neovim-as-Default-Editor.md](../backlog/docs/doc-002%20-%20Configuring-VIM-and-Neovim-as-Default-Editor.md) | VIM や Neovim を既定のエディタにする設定と、うまく動かないときの対処 | タスクを VIM や Neovim で編集したいとき、エディタが正しく開かないとき |
| [backlog/docs/doc-003 - Running-Backlog-Browser-as-a-Service.md](../backlog/docs/doc-003%20-%20Running-Backlog-Browser-as-a-Service.md) | `backlog browser` を常駐サービスとして動かす手順（Linux と WSL2、macOS、Windows） | Web 画面を起動時に立ち上げ、落ちても再起動させたいとき |

## backlog/decisions/

| パス | 説明 | いつ読むか |
| --- | --- | --- |
| [backlog/decisions/readme.md](../backlog/decisions/readme.md) | 決定事項のフォルダの役割と `backlog decision` コマンド | 決定事項を追加するとき、このフォルダの役割を確かめたいとき |
| [backlog/decisions/decision-1 - Use-Tailwind-CSS-v4-for-web-UI-development.md](../backlog/decisions/decision-1%20-%20Use-Tailwind-CSS-v4-for-web-UI-development.md) | Web 画面に Tailwind CSS v4 を使うという決定（状態は proposed）と、v3 との書き方の違い | Web 画面のスタイルや Tailwind の設定を変える前 |
