import glob from 'fast-glob';
import path from 'path';

import { ModuleRevision } from '../types';

/**
 * Resolves module search result with additional details required for iOS platform.
 */
export async function resolveModuleAsync(
  moduleName: string,
  revision: ModuleRevision
): Promise<any> {
  const [podspecFile] = await glob('*/*.podspec', {
    cwd: revision.path,
    ignore: ['**/node_modules/**'],
  });

  if (!podspecFile) {
    return null;
  }
  const podspecName = path.basename(podspecFile, path.extname(podspecFile));
  const podspecDir = path.dirname(path.join(revision.path, podspecFile));

  return {
    name: moduleName,
    podName: podspecName,
    path: podspecDir,
  };
}
