import type { MessageKey } from "./en.ts";

/** Japanese translations of every English message. The type makes a missing key a compile error. */
export const jaMessages: Record<MessageKey, string> = {
	"help.programDescription": "Backlog.md - プロジェクト管理 CLI",
	"help.versionOption": "バージョン番号を表示する",
	"help.helpOption": "コマンドのヘルプを表示する",
	"help.helpCommand": "コマンドのヘルプを表示する",
	"taskList.sortedByPriority": "タスク（優先度順）:",
	"taskList.noStatus": "状態なし",
	"taskList.noTasks": "タスクが見つかりません。",
	"taskList.noChildTasks": "親タスク {parentId} の子タスクが見つかりません。",
	"web.nav.tasks": "タスク",
	"web.nav.kanbanBoard": "かんばん",
	"web.nav.allTasks": "すべてのタスク",
	"web.nav.milestones": "マイルストーン",
	"web.nav.drafts": "下書き",
	"web.nav.statistics": "統計",
	"web.nav.documents": "ドキュメント",
	"web.nav.documentation": "ドキュメント",
	"web.nav.decisions": "決定記録",
	"web.nav.settings": "設定",
	"web.nav.searchPlaceholder": "検索 (⌘K)...",
	"web.board.heading": "かんばん",
	"web.board.newTask": "+ 新しいタスク",
	"web.board.laneAllTasks": "すべてのタスク",
	"web.board.laneMilestone": "マイルストーン別",
	"web.board.allAssignees": "すべての担当者",
	"web.board.unassigned": "担当者なし",
	"web.board.allTypes": "すべての種別",
	"web.board.allProjects": "すべてのプロジェクト",
	"web.board.allPriorities": "すべての優先度",
	"web.board.clearFilters": "絞り込みを解除",
};

/** Section titles that Commander passes to `styleTitle` when it renders help. */
export const jaHelpTitles: Record<string, string> = {
	"Usage:": "使い方:",
	"Arguments:": "引数:",
	"Options:": "オプション:",
	"Global Options:": "グローバルオプション:",
	"Commands:": "コマンド:",
};

/**
 * Descriptions of the top-level commands, keyed by command name. English keeps the descriptions
 * written next to each command in cli.ts.
 */
export const jaCommandDescriptions = {
	init: "現在のディレクトリ（BACKLOG_CWD を設定していればそのディレクトリ）に backlog プロジェクトを初期化する",
	task: "タスクを作成、一覧、表示、編集、アーカイブする",
	search: "タスク、ドキュメント、決定記録を共通の索引で検索する",
	draft: "下書きを作成、一覧、表示、編集し、タスクに昇格する",
	milestone: "マイルストーンを一覧、追加、改名、除去、アーカイブする",
	board: "タスクをかんばんで表示する",
	doc: "ドキュメントを作成、一覧、表示、更新、アーカイブする",
	decision: "決定記録を作成、一覧、表示、編集、アーカイブする",
	agents: "エージェント向け指示ファイルにある Backlog.md CLI の短い案内を管理する",
	config: "backlog の設定を管理する",
	doctor:
		"タスク、ドキュメント、決定記録の ID の重複を診断し、自己参照や循環する依存を報告し、タスク ID の重複を安全に修復し、アーカイブ済みのタスクをアーカイブフォルダへ移す",
	cleanup: "最終状態のまま、選んだ日数より古いタスクをアーカイブする",
	browser: "このマシンの 127.0.0.1 だけでブラウザ画面を開く（停止は Ctrl+C または Cmd+C）",
	overview: "プロジェクトの統計と指標を表示する",
	completion: "シェルの補完スクリプトを管理する",
	instructions: "Backlog.md のワークフローの手引きを表示する",
	mcp: "AI エージェント向けの MCP サーバーを扱う",
} satisfies Record<string, string>;

/**
 * Display names for the default statuses, keyed by lowercase status. Statuses a project defines
 * itself have no entry and are shown as written in its config.
 */
export const jaStatuses: Record<string, string> = {
	"to do": "未着手",
	"in progress": "進行中",
	done: "完了",
	draft: "下書き",
};
