/**
 * Display-language lookups shared by the CLI and the Web UI. Everything here is pure: callers pass
 * the locale explicitly. Reading BACKLOG_LANG from the environment lives in ./env.ts, which only the
 * CLI and the server import, so the browser bundle never touches `process.env`.
 */
import { en, type MessageKey } from "./en.ts";
import { ja } from "./ja.ts";
import type { Catalog } from "./types.ts";

export type { MessageKey } from "./en.ts";

const CATALOGS = { en, ja } satisfies Record<string, Catalog>;

/** Languages the CLI and the Web UI can display. Adding a catalog above adds a locale. */
export type Locale = keyof typeof CATALOGS;

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES = Object.keys(CATALOGS) as Locale[];

function catalog(locale: Locale): Catalog {
	return CATALOGS[locale];
}

/** Look up `key` in a record without reaching into Object.prototype. */
function lookup(record: Readonly<Record<string, string>>, key: string): string | undefined {
	return Object.hasOwn(record, key) ? record[key] : undefined;
}

/**
 * Map a language value such as BACKLOG_LANG to a supported locale. Only the language part is
 * read, so `ja`, `ja-JP` and `ja_JP.UTF-8` all select Japanese. Anything unset or unsupported
 * falls back to English, so a typo never breaks the CLI or the page.
 */
export function resolveLocale(value: unknown): Locale {
	const language = (typeof value === "string" ? value : "")
		.trim()
		.toLowerCase()
		.split(/[-_.@]/)[0];
	return SUPPORTED_LOCALES.find((locale) => locale === language) ?? DEFAULT_LOCALE;
}

/** A message in `locale`, with its `{name}` placeholders filled. Unknown placeholders are left as written. */
export function t(key: MessageKey, locale: Locale, params: Record<string, string | number> = {}): string {
	const template = catalog(locale).messages[key];
	return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		Object.hasOwn(params, name) ? String(params[name]) : placeholder,
	);
}

/** Translate a help section title such as `Usage:`. Titles without a translation are kept. */
export function translateHelpTitle(title: string, locale: Locale): string {
	return lookup(catalog(locale).helpTitles, title) ?? title;
}

/**
 * The translated description of a top-level command, or undefined when the command keeps the
 * English description written in cli.ts.
 */
export function translateCommandDescription(commandName: string, locale: Locale): string | undefined {
	return lookup(catalog(locale).commandDescriptions, commandName);
}

/**
 * The display name of a status. Only the default statuses are translated; a status a project
 * defines itself is shown as configured. Use this for display only: filters, moves, config, API
 * calls and JSON output keep the configured status.
 */
export function translateStatus(status: string, locale: Locale): string {
	return lookup(catalog(locale).statuses, status.trim().toLowerCase()) ?? status;
}
