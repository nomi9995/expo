import { ModuleRevision } from '../types';
/**
 * Resolves module search result with additional details required for iOS platform.
 */
export declare function resolveModuleAsync(moduleName: string, revision: ModuleRevision): Promise<any>;
