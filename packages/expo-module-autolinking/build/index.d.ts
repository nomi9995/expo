import { AutolinkingSearchConfig, AutolinkingSearchResults } from './types';
export declare function resolveLookupPathsAsync(lookupPaths: string[], cwd: string): Promise<string[]>;
/**
 * Looks up for workspace's `node_modules` paths.
 */
export declare function findDefaultPathsAsync(cwd: string): Promise<string[]>;
export declare function searchForModulesAsync(config: AutolinkingSearchConfig): Promise<AutolinkingSearchResults>;
export declare function printDuplicates(searchResults: AutolinkingSearchResults): string;
export declare function resolveModulesAsync(platform: string, searchResults: AutolinkingSearchResults): Promise<any[]>;
