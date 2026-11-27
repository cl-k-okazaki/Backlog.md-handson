---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# TypeScript を編集するときのルール

`src/` 配下の TypeScript を書くときは、次の2つを必ず守る。

## 型を明示し、any を使わない

- 関数の戻り値と、既定値の無い引数には型を書く。
- `any` を使わない。型が決まらない値は `unknown` で受け、型ガードで絞り込む。

## ファイル操作は FileSystem を通して行う

- タスク、下書き、文書、決定、マイルストーン、設定の読み書きは、`src/file-system/operations.ts` の `FileSystem` クラスのメソッドで行う。`Core` からは `core.fs` で使える。
- これらのファイルを `node:fs` や `node:fs/promises` で直接読み書きしない。
- これらのファイルを扱うメソッドが `FileSystem` に無いときは、呼び出し側で `node:fs` を使わず、`FileSystem` にメソッドを足す。
- `src/test/` のテストが一時ディレクトリにフィクスチャを用意するときは、この項目の対象外とする。
