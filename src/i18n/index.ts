import { enMessages, type MessageKey } from "./en.ts";
import { jaCommandDescriptions, jaHelpTitles, jaMessages, jaStatuses } from "./ja.ts";

export type { MessageKey } from "./en.ts";

/** Languages the CLI can display. */
export type Locale = "en" | "ja";

export const DEFAULT_LOCALE: Locale = "en";

/** Environment variable that selects the display language, for example `BACKLOG_LANG=ja`. */
export const LOCALE_ENV_VAR = "BACKLOG_LANG";

/**
 * Map a BACKLOG_LANG value to a supported locale. Only the language part is read, so `ja`,
 * `ja-JP` and `ja_JP.UTF-8` all select Japanese. Anything unset or unsupported falls back to
 * English, so a typo never breaks the CLI.
 */
export function resolveLocale(value: string | undefined): Locale {
	const language = (value ?? "")
		.trim()
		.toLowerCase()
		.split(/[-_.@]/)[0];
	return language === "ja" ? "ja" : DEFAULT_LOCALE;
}

/** The locale selected by the environment of the running process. */
export function getLocale(env: Record<string, string | undefined> = process.env): Locale {
	return resolveLocale(env[LOCALE_ENV_VAR]);
}

/** Look up a message and fill its `{name}` placeholders. Unknown placeholders are left as written. */
export function t(key: MessageKey, params: Record<string, string | number> = {}, locale: Locale = getLocale()): string {
	const template = locale === "ja" ? jaMessages[key] : enMessages[key];
	return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		Object.hasOwn(params, name) ? String(params[name]) : placeholder,
	);
}

/** Translate a help section title such as `Usage:`. Titles without a translation are kept. */
export function translateHelpTitle(title: string, locale: Locale = getLocale()): string {
	return locale === "ja" ? (jaHelpTitles[title] ?? title) : title;
}

/**
 * The translated description of a top-level command, or undefined when the command keeps the
 * English description written in cli.ts.
 */
export function translateCommandDescription(commandName: string, locale: Locale = getLocale()): string | undefined {
	if (locale !== "ja") return undefined;
	const descriptions: Readonly<Record<string, string | undefined>> = jaCommandDescriptions;
	return Object.hasOwn(descriptions, commandName) ? descriptions[commandName] : undefined;
}

/**
 * The display name of a status. Only the default statuses are translated; a status a project
 * defines itself is shown as written. Use this for display only: filters, config and JSON output
 * keep the configured status.
 */
export function translateStatus(status: string, locale: Locale = getLocale()): string {
	if (locale !== "ja") return status;
	return jaStatuses[status.trim().toLowerCase()] ?? status;
}
