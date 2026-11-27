import type { MessageKey } from "./en.ts";

/** Everything one display language provides. Lookups fall back to English when an entry is missing. */
export interface Catalog {
	/** Messages by key. Every language translates every English key. */
	messages: Readonly<Record<MessageKey, string>>;
	/** Section titles Commander passes to `styleTitle`, such as `Usage:`. */
	helpTitles: Readonly<Record<string, string>>;
	/** Descriptions of the top-level CLI commands, by command name. */
	commandDescriptions: Readonly<Record<string, string>>;
	/** Display names of the default statuses, by lowercase status. */
	statuses: Readonly<Record<string, string>>;
}
