// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXLocalization/EXLocalization.h>

@implementation EXLocalization

UM_EXPORT_MODULE(ExpoLocalization)

/* 
 * Thanks to RNLocalize
 * https://github.com/react-native-community/react-native-localize
 */

UM_EXPORT_METHOD_AS(getLocalizationAsync,
                    getLocalizationAsync:(UMPromiseResolveBlock)resolve
                    rejecter:(UMPromiseRejectBlock)reject)
{
  resolve([self constantsToExport]);
}

- (NSDictionary *)constantsToExport
{
  NSLocale *locale = [NSLocale currentLocale];
  NSString *languageCode = [EXLocalization languageCodeForLocale:locale];
  
  NSArray<NSString *> *languageIds = [NSLocale preferredLanguages];
  if (![languageIds count]) {
    languageIds = @[@"en-US"];
  }
  NSMutableArray<NSDictionary *> *languages = [NSMutableArray array];
  for (NSString *languageId in languageIds) {
    NSLocale *locale = [NSLocale localeWithLocaleIdentifier:languageId];
    [languages addObject:[EXLocalization languageForLocale:locale]];
  }
  
  return @{
    @"currency": [EXLocalization currencyCodeForLocale:locale] ?: @"USD",
    @"decimalSeparator": [locale objectForKey:NSLocaleDecimalSeparator] ?: @".",
    @"groupingSeparator": [locale objectForKey:NSLocaleGroupingSeparator] ?: @",",
    @"isoCurrencyCodes": [NSLocale ISOCurrencyCodes],
    @"isMetric": @([[locale objectForKey:NSLocaleUsesMetricSystem] boolValue]),
    @"isRTL": @([NSLocale characterDirectionForLanguage:languageCode] == NSLocaleLanguageDirectionRightToLeft),
    @"language": [EXLocalization languageForLocale:locale],
    @"languages": languages,
    @"locale": [languageIds objectAtIndex:0], // @deprecated, use localeId (returns language-ids on native & locale-id on web)
    @"locales": languageIds, // deprecated, use languages instead (returns language-ids on native & locale-ids on web)
    @"region": [EXLocalization countryCodeForLocale:locale] ?: @"US",
    @"timezone": [NSTimeZone localTimeZone].name,
  };
}

+ (NSString * _Nullable)countryCodeForLocale:(NSLocale * _Nonnull)locale
{
  NSString *countryCode = [locale objectForKey:NSLocaleCountryCode];
  if (countryCode == nil) {
    return nil;
  }
  if ([countryCode isEqualToString:@"419"]) {
    return @"UN";
  }
  return [countryCode uppercaseString];
}

+ (NSString * _Nullable)currencyCodeForLocale:(NSLocale * _Nonnull)locale
{
  NSString *currencyCode = [locale objectForKey:NSLocaleCurrencyCode];
  return currencyCode != nil ? [currencyCode uppercaseString] : nil;
}

+ (NSString * _Nonnull)languageCodeForLocale:(NSLocale * _Nonnull)locale
{
  NSString *languageCode = [locale objectForKey:NSLocaleLanguageCode];
  return languageCode != nil ? [languageCode lowercaseString] : @"en";
}

+ (NSDictionary * _Nonnull)languageForLocale:(NSLocale * _Nonnull)locale
{
  NSString *languageCode = [EXLocalization languageCodeForLocale:locale];
  return @{
    @"code": languageCode,
    @"isRTL": @([NSLocale characterDirectionForLanguage:languageCode] == NSLocaleLanguageDirectionRightToLeft),
    @"region": UMNullIfNil([EXLocalization countryCodeForLocale:locale]),
    @"script": UMNullIfNil([locale objectForKey:NSLocaleScriptCode]),
    @"variant": UMNullIfNil([locale objectForKey:NSLocaleVariantCode]),
  };
}

@end
