/* eslint-env browser */
import { Platform } from '@unimodules/core';
import * as rtlDetect from 'rtl-detect';

import { Localization, LocalizationLanguage } from './Localization.types';

function getLanguage(languageId: string): LocalizationLanguage {
  if (!languageId || typeof languageId !== 'string') {
    languageId = 'en';
  }
  const [prefix, suffix] = languageId.split('-');
  const code = prefix.toLowerCase();
  const region = suffix && suffix.length === 2 ? suffix.toUpperCase() : null;
  const script = suffix && suffix.length === 4 ? suffix : null;
  return {
    code,
    region,
    script,
    isRTL: rtlDetect.isRtlLang(languageId),
  };
}

export default {
  get currency(): string | null {
    // TODO(Hein)
    return null;
  },
  get decimalSeparator(): string {
    return (1.1).toLocaleString().substring(1, 2);
  },
  get groupingSeparator(): string {
    const value = (1000).toLocaleString();
    return value.length === 5 ? value.substring(1, 2) : '';
  },
  get isRTL(): boolean {
    return rtlDetect.isRtlLang(this.locale) ?? false;
  },
  get isMetric(): boolean {
    const { region } = this;
    switch (region) {
      case 'US': // USA
      case 'LR': // Liberia
      case 'MM': // Myanmar
        return false;
    }
    return true;
  },
  get language(): LocalizationLanguage {
    return getLanguage(this.locale);
  },
  get languages(): LocalizationLanguage[] {
    return this.locales.map(getLanguage);
  },
  get locale(): string {
    if (!Platform.isDOMAvailable) {
      return '';
    }
    const locale =
      navigator.language ||
      navigator['systemLanguage'] ||
      navigator['browserLanguage'] ||
      navigator['userLanguage'] ||
      this.locales[0];
    return locale;
  },
  get locales(): string[] {
    if (!Platform.isDOMAvailable) {
      return [];
    }
    const { languages = [] } = navigator;
    return Array.from(languages);
  },
  get timezone(): string {
    const defaultTimeZone = 'Etc/UTC';
    if (typeof Intl === 'undefined') {
      return defaultTimeZone;
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone || defaultTimeZone;
  },
  get isoCurrencyCodes(): string[] {
    // TODO(Bacon): Add this - very low priority
    return [];
  },
  get region(): string | null {
    return getLanguage(this.locale).region;
  },
  async getLocalizationAsync(): Promise<Localization> {
    const {
      currency,
      decimalSeparator,
      groupingSeparator,
      isoCurrencyCodes,
      isMetric,
      isRTL,
      language,
      languages,
      locale,
      locales,
      region,
      timezone,
    } = this;
    return {
      currency,
      decimalSeparator,
      groupingSeparator,
      isoCurrencyCodes,
      isMetric,
      isRTL,
      language,
      languages,
      locale,
      locales,
      region,
      timezone,
    };
  },
};
