import { afterEach, describe, expect, it } from "bun:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import type { Task } from "../types/index.ts";
import BoardPage from "../web/components/BoardPage.tsx";
import { LocaleProvider } from "../web/contexts/LocaleContext.tsx";

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

/** Answer /api/locale with the given locale; any other request fails as if the server were away. */
const mockLocaleEndpoint = (locale: string) => {
	globalThis.fetch = (async (input: RequestInfo | URL) => {
		if (String(input) === "/api/locale") return Response.json({ locale });
		throw new Error(`Unexpected request: ${String(input)}`);
	}) as typeof fetch;
};

const renderBoard = async (locale: string): Promise<HTMLElement> => {
	setupDom();
	mockLocaleEndpoint(locale);
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
	// Let the locale request resolve and the page render again in the answered language.
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
	return container;
};

const columnHeadings = (container: HTMLElement) =>
	Array.from(container.querySelectorAll("h3")).map((heading) => heading.textContent?.trim());

afterEach(() => {
	act(() => {
		activeRoot?.unmount();
	});
	activeRoot = null;
	globalThis.fetch = originalFetch;
});

describe("Web locale", () => {
	it("shows the board in Japanese when the server answers ja", async () => {
		const container = await renderBoard("ja");
		expect(container.querySelector("h2")?.textContent).toBe("かんばん");
		expect(container.textContent).toContain("+ 新しいタスク");
		expect(columnHeadings(container)).toEqual(expect.arrayContaining(["未着手", "完了"]));
		const firstOptions = Array.from(container.querySelectorAll("select")).map(
			(select) => select.options[0]?.textContent,
		);
		expect(firstOptions).toContain("すべての担当者");
		expect(document.documentElement.lang).toBe("ja");
	});

	it("keeps the board in English when the server answers en", async () => {
		const container = await renderBoard("en");
		expect(container.querySelector("h2")?.textContent).toBe("Kanban Board");
		expect(columnHeadings(container)).toEqual(expect.arrayContaining(["To Do", "Done"]));
	});
});
