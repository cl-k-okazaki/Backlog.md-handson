import { type Locale, resolveLocale } from "./index.ts";

/** Environment variable that selects the display language, for example `BACKLOG_LANG=ja`. */
export const LOCALE_ENV_VAR = "BACKLOG_LANG";

/**
 * The locale selected by the environment of the running process. For the CLI and the server only:
 * the Web UI asks the server instead, because the browser has no process environment.
 */
export function getLocale(env: Record<string, string | undefined> = process.env): Locale {
	return resolveLocale(env[LOCALE_ENV_VAR]);
}
