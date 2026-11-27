import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { $ } from "bun";
import { enMessages, type MessageKey } from "../i18n/en.ts";
import { getLocale } from "../i18n/env.ts";
import {
	resolveLocale,
	SUPPORTED_LOCALES,
	t,
	translateCommandDescription,
	translateHelpTitle,
	translateStatus,
} from "../i18n/index.ts";
import { ja } from "../i18n/ja.ts";
import { Core } from "../index.ts";
import { getTestCliPath } from "./test-cli.ts";
import { createUniqueTestDir, initializeTestProject, safeCleanup } from "./test-utils.ts";

const CLI_PATH = getTestCliPath();
const JAPANESE_TEXT = /[぀-ヿ一-鿿]/;

/** The test runner's environment without BACKLOG_LANG, so English runs do not depend on the shell. */
function envWithLang(lang?: string): Record<string, string | undefined> {
	const { BACKLOG_LANG: _inherited, ...rest } = process.env;
	return lang === undefined ? rest : { ...rest, BACKLOG_LANG: lang };
}

async function runCliResult(args: string[], cwd: string, lang?: string) {
	const result = await $`bun ${[CLI_PATH, ...args]}`.cwd(cwd).env(envWithLang(lang)).quiet().nothrow();
	return { exitCode: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
}

async function runCli(args: string[], cwd: string, lang?: string): Promise<string> {
	const result = await runCliResult(args, cwd, lang);
	expect(result.exitCode).toBe(0);
	return result.stdout;
}

/** The rows of the `Commands:` section, without the wrapped continuation lines. */
function commandRows(help: string, title: string): string[] {
	const section = help.slice(help.indexOf(`${title}\n`) + title.length + 1);
	return section.split("\n").filter((line) => /^ {2}\S/.test(line));
}

describe("i18n", () => {
	describe("resolveLocale", () => {
		it("defaults to English when the value is unset, empty or not a string", () => {
			expect(resolveLocale(undefined)).toBe("en");
			expect(resolveLocale("")).toBe("en");
			expect(resolveLocale(42)).toBe("en");
		});

		it("selects Japanese from the language part of the value", () => {
			expect(resolveLocale("ja")).toBe("ja");
			expect(resolveLocale(" JA ")).toBe("ja");
			expect(resolveLocale("ja-JP")).toBe("ja");
			expect(resolveLocale("ja_JP.UTF-8")).toBe("ja");
		});

		it("falls back to English for unsupported languages", () => {
			expect(resolveLocale("fr")).toBe("en");
			expect(resolveLocale("japanese")).toBe("en");
		});

		it("lists every catalog as a supported locale", () => {
			expect([...SUPPORTED_LOCALES].sort()).toEqual(["en", "ja"]);
		});

		it("reads BACKLOG_LANG from the given environment", () => {
			expect(getLocale({ BACKLOG_LANG: "ja" })).toBe("ja");
			expect(getLocale({})).toBe("en");
		});
	});

	describe("messages", () => {
		it("translates every English message into Japanese", () => {
			const keys = Object.keys(enMessages) as MessageKey[];
			expect(Object.keys(ja.messages).sort()).toEqual([...keys].sort());
			for (const key of keys) {
				expect(ja.messages[key].length).toBeGreaterThan(0);
			}
		});

		it("fills placeholders in the selected language", () => {
			expect(t("taskList.noChildTasks", "en", { parentId: "TASK-1" })).toBe(
				"No child tasks found for parent task TASK-1.",
			);
			expect(t("taskList.noChildTasks", "ja", { parentId: "TASK-1" })).toBe(
				"親タスク TASK-1 の子タスクが見つかりません。",
			);
		});

		it("leaves unknown placeholders as written", () => {
			expect(t("taskList.noChildTasks", "en")).toBe("No child tasks found for parent task {parentId}.");
		});
	});

	describe("display helpers", () => {
		it("translates the default statuses only in Japanese", () => {
			expect(translateStatus("To Do", "ja")).toBe("未着手");
			expect(translateStatus("In Progress", "ja")).toBe("進行中");
			expect(translateStatus("done", "ja")).toBe("完了");
			expect(translateStatus("Done", "en")).toBe("Done");
		});

		it("keeps statuses a project defines itself", () => {
			expect(translateStatus("Review", "ja")).toBe("Review");
		});

		it("never reads translations from Object.prototype", () => {
			expect(translateStatus("constructor", "ja")).toBe("constructor");
			expect(translateCommandDescription("toString", "ja")).toBeUndefined();
		});

		it("translates help titles and keeps unknown titles", () => {
			expect(translateHelpTitle("Usage:", "ja")).toBe("使い方:");
			expect(translateHelpTitle("Usage:", "en")).toBe("Usage:");
			expect(translateHelpTitle("Something:", "ja")).toBe("Something:");
		});

		it("keeps the English command descriptions written in cli.ts", () => {
			expect(translateCommandDescription("task", "en")).toBeUndefined();
			expect(translateCommandDescription("task", "ja")).toBe(ja.commandDescriptions.task);
		});
	});

	describe("CLI", () => {
		let TEST_DIR: string;

		beforeEach(async () => {
			TEST_DIR = createUniqueTestDir("test-i18n");
			await mkdir(TEST_DIR, { recursive: true });
		});

		afterEach(async () => {
			await safeCleanup(TEST_DIR);
		});

		it("keeps the English help when BACKLOG_LANG is unset", async () => {
			const help = await runCli(["--help"], TEST_DIR);
			expect(help).toContain("Usage: backlog");
			expect(help).toContain("Backlog.md - Project management CLI");
			expect(help).toContain("display tasks in a Kanban board");
			expect(help).not.toMatch(JAPANESE_TEXT);
		});

		it("shows the help in Japanese with BACKLOG_LANG=ja", async () => {
			const help = await runCli(["--help"], TEST_DIR, "ja");
			expect(help).toContain("使い方: backlog");
			expect(help).toContain("オプション:");
			expect(help).toContain(ja.messages["help.programDescription"]);
			expect(help).toContain(ja.commandDescriptions.board);
			expect(help).toContain(ja.messages["help.helpCommand"]);
			expect(help).not.toContain("Usage:");
			expect(help).not.toContain("display tasks in a Kanban board");
		});

		it("describes every top-level command in Japanese, including commands added later", async () => {
			const help = await runCli(["--help"], TEST_DIR, "ja");
			const rows = commandRows(help, "コマンド:");
			expect(rows.length).toBeGreaterThan(10);
			for (const row of rows) {
				expect(row).toMatch(JAPANESE_TEXT);
			}
		});

		it("adds no help subcommand that English does not have", async () => {
			// task, draft and board run their own action, so Commander gives them no implicit help command.
			for (const command of ["task", "draft", "board"]) {
				const english = await runCli([command, "--help"], TEST_DIR);
				const japanese = await runCli([command, "--help"], TEST_DIR, "ja");
				expect(english).not.toContain("help [command]");
				expect(japanese).not.toContain("help [command]");
			}
		});

		it("parses `task help` the same way in both languages", async () => {
			const english = await runCliResult(["task", "help"], TEST_DIR);
			const japanese = await runCliResult(["task", "help"], TEST_DIR, "ja");
			expect(japanese.exitCode).toBe(english.exitCode);
			expect(japanese.stdout).not.toContain("使い方:");
		});

		describe("task list", () => {
			beforeEach(async () => {
				await $`git init -b main`.cwd(TEST_DIR).quiet();
				const core = new Core(TEST_DIR);
				await initializeTestProject(core, "I18n Test Project", false);
				const base = { assignee: [], createdDate: "2026-11-27", labels: [], dependencies: [], rawContent: "" };
				await core.createTask({ ...base, id: "task-1", title: "First Task", status: "To Do" }, false);
				await core.createTask({ ...base, id: "task-2", title: "Second Task", status: "Done" }, false);
			});

			it("keeps the English headings when BACKLOG_LANG is unset", async () => {
				const output = await runCli(["task", "list", "--plain"], TEST_DIR);
				expect(output).toContain("To Do:");
				expect(output).toContain("Done:");
				expect(output).not.toMatch(JAPANESE_TEXT);
			});

			it("shows status headings in Japanese with BACKLOG_LANG=ja", async () => {
				const output = await runCli(["task", "list", "--plain"], TEST_DIR, "ja");
				expect(output).toContain("未着手:");
				expect(output).toContain("完了:");
				expect(output).not.toContain("To Do:");
				expect(output).toContain("First Task");
			});

			it("shows the priority heading and row statuses in Japanese", async () => {
				const output = await runCli(["task", "list", "--plain", "--sort", "priority"], TEST_DIR, "ja");
				expect(output).toContain("タスク (優先度順):");
				expect(output).toContain("(未着手)");
				expect(output).toContain("(完了)");
			});

			it("keeps the configured statuses in JSON output", async () => {
				const output = await runCli(["task", "list", "--json"], TEST_DIR, "ja");
				expect(output).toContain('"status": "To Do"');
				expect(output).not.toContain("未着手");
			});

			it("shows the empty-list message in Japanese", async () => {
				const output = await runCli(["task", "list", "--plain", "--status", "In Progress"], TEST_DIR, "ja");
				expect(output).toContain("タスクが見つかりません。");
			});
		});
	});
});
