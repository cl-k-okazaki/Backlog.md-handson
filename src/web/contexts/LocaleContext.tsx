import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
	DEFAULT_LOCALE,
	type Locale,
	type MessageKey,
	resolveLocale,
	t,
	translateStatus,
} from '../../i18n/index.ts';

interface LocaleContextValue {
	locale: Locale;
	/** A message in the display language. */
	text: (key: MessageKey, params?: Record<string, string | number>) => string;
	/** The display name of a status. Filters, moves and API calls keep using the configured status. */
	statusLabel: (status: string) => string;
}

function createLocaleValue(locale: Locale): LocaleContextValue {
	return {
		locale,
		text: (key, params) => t(key, locale, params),
		statusLabel: (status) => translateStatus(status, locale),
	};
}

// Components rendered without the provider, as in component tests, keep the English text.
const LocaleContext = createContext<LocaleContextValue>(createLocaleValue(DEFAULT_LOCALE));

export const useLocale = () => useContext(LocaleContext);

// The last language the server reported, so the next page load starts in it instead of flashing
// English until /api/locale answers. Only a per-browser convenience: the server stays the source.
const LOCALE_STORAGE_KEY = 'backlog-locale';

function readStoredLocale(): Locale {
	try {
		return resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
	} catch {
		return DEFAULT_LOCALE;
	}
}

function storeLocale(locale: Locale): void {
	try {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	} catch {
		// Storage can be unavailable (private mode, blocked site data); the page still works.
	}
}

interface LocaleProviderProps {
	children: React.ReactNode;
}

/**
 * Reads the display language the server was started with (BACKLOG_LANG) and hands it to the
 * components. Until the server answers, the page uses the language it reported last time; when it
 * cannot be asked, the page keeps that language (English on a first visit).
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
	const [locale, setLocale] = useState<Locale>(readStoredLocale);

	useEffect(() => {
		let cancelled = false;
		fetch('/api/locale')
			.then((response) => (response.ok ? response.json() : null))
			.then((body: { locale?: unknown } | null) => {
				if (cancelled || !body) return;
				const reported = resolveLocale(body.locale);
				storeLocale(reported);
				setLocale(reported);
			})
			.catch(() => {
				// An unreachable or older server leaves the current language in place.
			});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const value = useMemo(() => createLocaleValue(locale), [locale]);
	return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
