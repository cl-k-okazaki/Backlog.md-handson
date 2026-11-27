---
name: issue-driven-flow
description: GitHub の Issue 番号を受け取り、Issue の確認、ブランチの作成、対応方針の確認と実装、/code-review によるレビュー、Closes 付きの PR 作成までを順に進める。
argument-hint: <Issue 番号>
disable-model-invocation: true
---

# Issue 起点の開発フロー

引数の Issue 番号（`$ARGUMENTS`）について、次の5つの手順を順に進める。引数が無いとき、または数字でないときは、Issue 番号を尋ねて止まる。

PR と Issue はこの clone の fork に作る。始める前に `gh repo set-default --view` で向き先を確かめ、fork 元（upstream）を指していたら止めて、利用者に伝える。

## 1. Issue の内容を確認する

```bash
gh issue view $ARGUMENTS
```

背景、やること、受け入れ条件、スコープ外を読み取る。Issue が閉じている、または見つからないときは止めて、利用者に伝える。

## 2. ブランチを作る

既定のブランチの最新から `fix/issue-<番号>` を作る。

```bash
git fetch origin
git switch -c fix/issue-$ARGUMENTS origin/main
```

作業ツリーに未コミットの変更があるときは、ブランチを作る前に利用者に伝え、どう扱うかを確かめる。同じ名前のブランチがすでにあるときも止めて確かめる。

## 3. 対応方針を立て、確認してから実装する

Issue の受け入れ条件ごとに、変えるファイルと変え方、確かめ方をまとめて利用者に示す。利用者が承認するまで、ファイルを変えない。

承認されたら実装する。受け入れ条件とスコープ外を超える変更はしない。テストが必要な変更は、このリポジトリの手順どおり Codespace で `bun run test` を流して確かめる。

## 4. /code-review でレビューし、妥当な指摘を直す

変更をコミットしてから、`/code-review` でブランチの差分をレビューする。指摘ごとに妥当かを判断し、妥当なものだけを直す。直さなかった指摘は、その理由を PR の本文に書く。

## 5. コミットして PR を作る

コミットのメッセージには `Refs #<番号>` を入れる。ブランチを push して、本文に `Closes #<番号>` を入れた PR を作る。

```bash
git push -u origin fix/issue-$ARGUMENTS
gh pr create --base main --head fix/issue-$ARGUMENTS --title "<Issue のタイトル>" --body "Closes #$ARGUMENTS ..."
```

PR の URL を利用者に伝えて終える。マージは利用者が行う。
