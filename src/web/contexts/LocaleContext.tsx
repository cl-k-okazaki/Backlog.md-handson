import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, type Locale, type MessageKey, t, translateStatus } from '../../i18n/index.ts';

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
		text: (key, params = {}) => t(key, params, locale),
		statusLabel: (status) => translateStatus(status, locale),
	};
}

// Components rendered without the provider, as in component tests, keep the English text.
const LocaleContext = createContext<LocaleContextValue>(createLocaleValue(DEFAULT_LOCALE));

export const useLocale = () => useContext(LocaleContext);

interface LocaleProviderProps {
	children: React.ReactNode;
}

/**
 * Reads the display language the server was started with (BACKLOG_LANG) and hands it to the
 * components. The page shows English until the answer arrives, and stays English when the server
 * cannot be asked.
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
	const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

	useEffect(() => {
		let cancelled = false;
		fetch('/api/locale')
			.then((response) => (response.ok ? response.json() : null))
			.then((body: { locale?: string } | null) => {
				if (!cancelled && body?.locale === 'ja') setLocale('ja');
			})
			.catch(() => {
				// An unreachable or older server keeps the page in English.
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
