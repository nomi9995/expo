import chalk from 'chalk';
import Table from 'cli-table3';
import glob from 'fast-glob';
import findUp from 'find-up';
import fs from 'fs';
import os from 'os';
import path from 'path';
import semver from 'semver';

import { AutolinkingSearchConfig, AutolinkingSearchResults, ModuleRevision } from './types';

export async function resolveLookupPathsAsync(
  lookupPaths: string[],
  cwd: string
): Promise<string[]> {
  return lookupPaths.length > 0
    ? lookupPaths.map(lookupPath => path.resolve(cwd, lookupPath))
    : await findDefaultPathsAsync(cwd);
}

/**
 * Looks up for workspace's `node_modules` paths.
 */
export async function findDefaultPathsAsync(cwd: string): Promise<string[]> {
  const paths = [];
  let dir = cwd;
  let pkgJsonPath: string | undefined;

  while ((pkgJsonPath = await findUp('package.json', { cwd: dir }))) {
    dir = path.dirname(path.dirname(pkgJsonPath));
    paths.push(path.join(pkgJsonPath, '..', 'node_modules'));
  }
  return paths;
}

export async function searchForModulesAsync(
  config: AutolinkingSearchConfig
): Promise<AutolinkingSearchResults> {
  const modulesRevisions: Record<string, ModuleRevision[]> = {};
  const results: AutolinkingSearchResults = {};

  for (const searchPath of config.paths) {
    const paths = await glob('**/unimodule.json', {
      cwd: searchPath,
    });

    for (const moduleConfigPath of paths) {
      const modulePath = fs.realpathSync(path.join(searchPath, path.dirname(moduleConfigPath)));
      // const moduleConfig = require(path.join(modulePath, 'unimodule.json'));
      const { name, version } = require(path.join(modulePath, 'package.json'));

      const moduleRevision: ModuleRevision = {
        path: modulePath,
        version,
      };
      if (!modulesRevisions[name]) {
        modulesRevisions[name] = [moduleRevision];
      } else if (modulesRevisions[name].every(revision => revision.path !== modulePath)) {
        modulesRevisions[name].push(moduleRevision);
      }
    }
  }

  // Resolve revisions to the main one (greatest version number) and duplicates.
  Object.entries(modulesRevisions).reduce((acc, [moduleName, revisions]) => {
    // Sort in place from greatest to least and pull the greatest one.
    revisions.sort((a, b) => semver.rcompare(a.version, b.version));
    const mainRevision = revisions.shift();

    if (mainRevision) {
      acc[moduleName] = {
        ...mainRevision,
        duplicates: revisions,
      };
    }
    return acc;
  }, results);

  return results;
}

export function printDuplicates(searchResults: AutolinkingSearchResults): string {
  const cwd = process.cwd();
  const relativePath: (module: ModuleRevision) => string = m => path.relative(cwd, m.path);
  const tables: Table.Table[] = [];

  for (const moduleName in searchResults) {
    const moduleResult = searchResults[moduleName];

    if (moduleResult.duplicates.length > 0) {
      const table = new Table();

      table.push(
        [{ colSpan: 2, content: `📦 ${chalk.green(moduleName)}` }],
        [chalk.magenta(relativePath(moduleResult)), chalk.cyan(moduleResult.version)],
        ...moduleResult.duplicates.map(duplicate => [
          chalk.gray(relativePath(duplicate)),
          chalk.gray(duplicate.version),
        ])
      );
      tables.push(table);
    }
  }
  if (tables.length > 0) {
    return [
      ...tables.map(table => table.toString()),
      chalk.yellow(
        `⚠️  Found ${tables.length} duplicated modules, but only the greatest versions will be autolinked.`
      ),
      chalk.yellow(
        'Make sure to get rid of unnecessary versions as it may introduce side effects, especially on the JavaScript side.'
      ),
    ].join(os.EOL);
  }
  return '';
}

export async function resolveModulesAsync(
  platform: string,
  searchResults: AutolinkingSearchResults
): Promise<any[]> {
  const platformLinking = require(`./resolvers/${platform}`);

  return (
    await Promise.all(
      Object.entries(searchResults).map(([moduleName, revision]) =>
        platformLinking.resolveModuleAsync(moduleName, revision)
      )
    )
  ).filter(Boolean);
}

// modules_paths.each { |module_path|
//     canonical_module_path = Pathname.new(File.join(project_directory, module_path)).cleanpath
//     glob_pattern = File.join(canonical_module_path, '**/*/**', 'unimodule.json')

//     Dir.glob(glob_pattern) { |module_config_path|
//       unimodule_json = JSON.parse(File.read(module_config_path))
//       directory = File.dirname(module_config_path)
//       platforms = unimodule_json['platforms'] || ['ios']
//       targets = unimodule_json['targets'] || ['react-native']

//       if unimodule_supports_platform(platforms, 'ios') && unimodule_supports_target(targets, target)
//         package_json_path = File.join(directory, 'package.json')
//         package_json = JSON.parse(File.read(package_json_path))
//         package_name = unimodule_json['name'] || package_json['name']

//         if !modules_to_exclude.include?(package_name)
//           unimodule_config = { 'subdirectory' => 'ios' }.merge(unimodule_json.fetch('ios', {}))
//           unimodule_version = package_json['version']

//           if unimodules[package_name]
//             unimodules_duplicates.push(package_name)
//           end

//           if !unimodules[package_name] || Gem::Version.new(unimodule_version) >= Gem::Version.new(unimodules[package_name][:version])
//             unimodules[package_name] = {
//               name: package_name,
//               directory: directory,
//               version: unimodule_version,
//               config: unimodule_config,
//               warned: false,
//             }
//           end
//         end
//       end
//     }
//   }
