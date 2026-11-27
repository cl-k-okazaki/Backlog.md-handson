import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { $ } from "bun";
import { enMessages, type MessageKey } from "../i18n/en.ts";
import {
	getLocale,
	resolveLocale,
	t,
	translateCommandDescription,
	translateHelpTitle,
	translateStatus,
} from "../i18n/index.ts";
import { jaCommandDescriptions, jaMessages } from "../i18n/ja.ts";
import { Core } from "../index.ts";
import { getTestCliPath } from "./test-cli.ts";
import { createUniqueTestDir, initializeTestProject, safeCleanup } from "./test-utils.ts";

const CLI_PATH = getTestCliPath();

/** The test runner's environment without BACKLOG_LANG, so English runs do not depend on the shell. */
function envWithLang(lang?: string): Record<string, string | undefined> {
	const { BACKLOG_LANG: _inherited, ...rest } = process.env;
	return lang === undefined ? rest : { ...rest, BACKLOG_LANG: lang };
}

async function runCli(args: string[], cwd: string, lang?: string): Promise<string> {
	const result = await $`bun ${[CLI_PATH, ...args]}`.cwd(cwd).env(envWithLang(lang)).quiet().nothrow();
	expect(result.exitCode).toBe(0);
	return result.stdout.toString();
}

describe("i18n", () => {
	describe("resolveLocale", () => {
		it("defaults to English when BACKLOG_LANG is unset or empty", () => {
			expect(resolveLocale(undefined)).toBe("en");
			expect(resolveLocale("")).toBe("en");
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

		it("reads BACKLOG_LANG from the given environment", () => {
			expect(getLocale({ BACKLOG_LANG: "ja" })).toBe("ja");
			expect(getLocale({})).toBe("en");
		});
	});

	describe("messages", () => {
		it("translates every English message into Japanese", () => {
			const keys = Object.keys(enMessages) as MessageKey[];
			for (const key of keys) {
				expect(jaMessages[key]?.length ?? 0).toBeGreaterThan(0);
			}
			expect(Object.keys(jaMessages).sort()).toEqual([...keys].sort());
		});

		it("fills placeholders in the selected language", () => {
			expect(t("taskList.noChildTasks", { parentId: "TASK-1" }, "en")).toBe(
				"No child tasks found for parent task TASK-1.",
			);
			expect(t("taskList.noChildTasks", { parentId: "TASK-1" }, "ja")).toBe(
				"親タスク TASK-1 の子タスクが見つかりません。",
			);
		});

		it("leaves unknown placeholders as written", () => {
			expect(t("taskList.noChildTasks", {}, "en")).toBe("No child tasks found for parent task {parentId}.");
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

		it("translates help titles and keeps unknown titles", () => {
			expect(translateHelpTitle("Usage:", "ja")).toBe("使い方:");
			expect(translateHelpTitle("Usage:", "en")).toBe("Usage:");
			expect(translateHelpTitle("Something:", "ja")).toBe("Something:");
		});

		it("keeps the English command descriptions written in cli.ts", () => {
			expect(translateCommandDescription("task", "en")).toBeUndefined();
			expect(translateCommandDescription("task", "ja")).toBe(jaCommandDescriptions.task);
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
			expect(help).not.toContain("使い方:");
		});

		it("shows the help in Japanese with BACKLOG_LANG=ja", async () => {
			const help = await runCli(["--help"], TEST_DIR, "ja");
			expect(help).toContain("使い方: backlog");
			expect(help).toContain("オプション:");
			expect(help).toContain("コマンド:");
			expect(help).toContain(jaMessages["help.programDescription"]);
			expect(help).toContain(jaCommandDescriptions.board);
			expect(help).toContain(jaMessages["help.helpCommand"]);
			expect(help).not.toContain("Usage:");
			expect(help).not.toContain("display tasks in a Kanban board");
		});

		it("gives every top-level command a Japanese description", async () => {
			const help = await runCli(["--help"], TEST_DIR, "ja");
			for (const description of Object.values(jaCommandDescriptions)) {
				// Commander wraps long descriptions, so compare without line breaks and indentation.
				expect(help.replace(/\s+/g, "")).toContain(description.replace(/\s+/g, ""));
			}
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
				expect(output).toContain("タスク（優先度順）:");
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
