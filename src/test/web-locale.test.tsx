import { afterEach, describe, expect, it } from "bun:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import type { Task } from "../types/index.ts";
import BoardPage from "../web/components/BoardPage.tsx";
import { LocaleProvider } from "../web/contexts/LocaleContext.tsx";

const JAPANESE_TEXT = /[぀-ヿ一-鿿]/;

const tasks: Task[] = [
	{ id: "task-1", title: "First Task", status: "To Do", assignee: [], labels: [], dependencies: [], createdDate: "2026-11-27" },
	{ id: "task-2", title: "Second Task", status: "Done", assignee: [], labels: [], dependencies: [], createdDate: "2026-11-27" },
];

let activeRoot: Root | null = null;
const originalFetch = globalThis.fetch;

const setupDom = () => {
	const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
		url: "http://localhost/board",
	});
	(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
	globalThis.window = dom.window as unknown as Window & typeof globalThis;
	globalThis.document = dom.window.document as unknown as Document;
	globalThis.navigator = dom.window.navigator as unknown as Navigator;
	globalThis.localStorage = dom.window.localStorage as unknown as Storage;
	window.matchMedia = () =>
		({
			matches: false,
			media: "",
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as MediaQueryList;
};

/**
 * Answer /api/locale with `locale`, or fail it when `locale` is null as if the server were away.
 * The returned promise settles once the page has received the answer or the failure.
 */
const mockLocaleEndpoint = (locale: string | null): Promise<void> => {
	let settle: () => void = () => {};
	const settled = new Promise<void>((resolve) => {
		settle = resolve;
	});
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		if (String(input) !== "/api/locale") throw new Error(`Unexpected request: ${String(input)}`);
		queueMicrotask(settle);
		if (locale === null) throw new Error("Server unreachable");
		return Response.json({ locale });
	}) as typeof fetch;
	return settled;
};

/** Run React updates until `condition` holds, for at most about a second. */
const waitFor = async (condition: () => boolean) => {
	for (let attempt = 0; attempt < 50 && !condition(); attempt++) {
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 20));
		});
	}
	expect(condition()).toBe(true);
};

const renderBoard = async (
	serverLocale: string | null,
	storedLocale?: string,
): Promise<{ container: HTMLElement; requestSettled: Promise<void> }> => {
	setupDom();
	if (storedLocale) localStorage.setItem("backlog-locale", storedLocale);
	const requestSettled = mockLocaleEndpoint(serverLocale);
	const container = document.getElementById("root") as HTMLElement;
	activeRoot = createRoot(container);
	await act(async () => {
		activeRoot?.render(
			<LocaleProvider>
				<BrowserRouter>
					<BoardPage
						tasks={tasks}
						statuses={["To Do", "In Progress", "Done"]}
						milestones={[]}
						availableLabels={[]}
						milestoneEntities={[]}
						archivedMilestones={[]}
						isLoading={false}
						onEditTask={() => {}}
						onNewTask={() => {}}
					/>
				</BrowserRouter>
			</LocaleProvider>,
		);
	});
	return { container, requestSettled };
};

const heading = (container: HTMLElement) => container.querySelector("h2")?.textContent;

const columnHeadings = (container: HTMLElement) =>
	Array.from(container.querySelectorAll("h3")).map((element) => element.textContent?.trim());

afterEach(() => {
	act(() => {
		activeRoot?.unmount();
	});
	activeRoot = null;
	globalThis.fetch = originalFetch;
});

describe("Web locale", () => {
	it("shows the board in Japanese when the server answers ja", async () => {
		const { container } = await renderBoard("ja");
		await waitFor(() => heading(container) === "かんばん");
		expect(container.textContent).toContain("+ 新しいタスク");
		expect(columnHeadings(container)).toEqual(expect.arrayContaining(["未着手", "完了"]));
		const firstOptions = Array.from(container.querySelectorAll("select")).map(
			(select) => select.options[0]?.textContent,
		);
		expect(firstOptions).toContain("すべての担当者");
		expect(document.documentElement.lang).toBe("ja");
		expect(localStorage.getItem("backlog-locale")).toBe("ja");
	});

	it("keeps the whole board in English when the server answers en", async () => {
		const { container, requestSettled } = await renderBoard("en");
		await act(async () => {
			await requestSettled;
		});
		expect(heading(container)).toBe("Kanban Board");
		expect(columnHeadings(container)).toEqual(expect.arrayContaining(["To Do", "Done"]));
		expect(container.textContent).not.toMatch(JAPANESE_TEXT);
	});

	it("starts in the language the server reported last time", async () => {
		const { container, requestSettled } = await renderBoard(null, "ja");
		// Japanese from the first render, without waiting for the server.
		expect(heading(container)).toBe("かんばん");
		await act(async () => {
			await requestSettled;
		});
		// An unreachable server leaves the remembered language in place.
		expect(heading(container)).toBe("かんばん");
	});

	it("follows the server when its language changed since the last visit", async () => {
		const { container } = await renderBoard("en", "ja");
		await waitFor(() => heading(container) === "Kanban Board");
		expect(localStorage.getItem("backlog-locale")).toBe("en");
	});
});
