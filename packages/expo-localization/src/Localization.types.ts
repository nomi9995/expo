export type LocalizationLanguage = {
  /**
   * Two character ISO 639-1 language code.
   *
   * @example `en`, `nl`, `az`
   */
  code: string;
  /**
   * Returns if the language is written from Right-to-Left.
   * This can be used to build features like [bidirectional icons](https://material.io/design/usability/bidirectionality.html).
   */
  isRTL: boolean;
  /**
   * Optional two character ISO 3166-1 country code.
   *
   * @example `US`, `NL`, `AU`
   */
  region: string | null;
  /**
   * Optional four character script code.
   *
   * @example `Latn`, `Cyrl`, `Hans`
   */
  script: string | null;
  /**
   * Optional language variant.
   *
   * @example `Latn`, `Cyrl`, `Hans`
   */
  variant: string | null;
};

export type Localization = {
  /**
   * Three character ISO 4217 currency code.
   *
   * @example `USD`, `EUR`, `CNY`
   */
  currency: string | null;
  /**
   * The decimal separator used for formatting numbers.
   *
   * @example `,`, '.'
   */
  decimalSeparator: string;
  /**
   * The grouping separator used for formatting numbers larger than 1000.
   *
   * @example `.`, '', ','
   */
  groupingSeparator: string;
  /**
   * A list of all the supported language ISO codes.
   */
  isoCurrencyCodes: string[];
  /**
   * Boolean value that indicates whether the system uses the metric system.
   */
  isMetric: boolean;
  /**
   * Returns if the system's language is written from Right-to-Left.
   * This can be used to build features like [bidirectional icons](https://material.io/design/usability/bidirectionality.html).
   *
   * Returns `false` in SSR environments.
   */
  isRTL: boolean;
  /**
   * Current device language object.
   */
  language: LocalizationLanguage;
  /**
   * Current device language object.
   */
  languages: LocalizationLanguage[];
  /**
   * Device language identifier, returned in standard format.
   *
   * @example `en`, `en-US`, `nl-NL`, `zh-Hans`
   */
  locale: string;
  /**
   * List of all the languages provided by the user settings.
   * These are returned in the order the user defines in their native settings.
   *
   * @example [`en`,`en-US`,`nl-NL`, `zh-Hans`]
   */
  locales: string[];
  /**
   * **Available on iOS and web**: Region code for your device which came from Region setting in Language & Region.
   *
   * @example `US`, `NZ`
   */
  region: string | null;
  /**
   * The current timezone in display format.
   * On Web timezone is calculated with Intl.DateTimeFormat().resolvedOptions().timeZone. For a better estimation you could use the moment-timezone package but it will add significant bloat to your website's bundle size.
   *
   * @example `America/Los_Angeles`
   */
  timezone: string;
};
