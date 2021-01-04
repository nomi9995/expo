"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModulesAsync = exports.printDuplicates = exports.searchForModulesAsync = exports.findDefaultPathsAsync = exports.resolveLookupPathsAsync = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const find_up_1 = __importDefault(require("find-up"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
async function resolveLookupPathsAsync(lookupPaths, cwd) {
    return lookupPaths.length > 0
        ? lookupPaths.map(lookupPath => path_1.default.resolve(cwd, lookupPath))
        : await findDefaultPathsAsync(cwd);
}
exports.resolveLookupPathsAsync = resolveLookupPathsAsync;
/**
 * Looks up for workspace's `node_modules` paths.
 */
async function findDefaultPathsAsync(cwd) {
    const paths = [];
    let dir = cwd;
    let pkgJsonPath;
    while ((pkgJsonPath = await find_up_1.default('package.json', { cwd: dir }))) {
        dir = path_1.default.dirname(path_1.default.dirname(pkgJsonPath));
        paths.push(path_1.default.join(pkgJsonPath, '..', 'node_modules'));
    }
    return paths;
}
exports.findDefaultPathsAsync = findDefaultPathsAsync;
async function searchForModulesAsync(config) {
    const modulesRevisions = {};
    const results = {};
    for (const searchPath of config.paths) {
        const paths = await fast_glob_1.default('**/unimodule.json', {
            cwd: searchPath,
        });
        for (const moduleConfigPath of paths) {
            const modulePath = fs_1.default.realpathSync(path_1.default.join(searchPath, path_1.default.dirname(moduleConfigPath)));
            // const moduleConfig = require(path.join(modulePath, 'unimodule.json'));
            const { name, version } = require(path_1.default.join(modulePath, 'package.json'));
            const moduleRevision = {
                path: modulePath,
                version,
            };
            if (!modulesRevisions[name]) {
                modulesRevisions[name] = [moduleRevision];
            }
            else if (modulesRevisions[name].every(revision => revision.path !== modulePath)) {
                modulesRevisions[name].push(moduleRevision);
            }
        }
    }
    // Resolve revisions to the main one (greatest version number) and duplicates.
    Object.entries(modulesRevisions).reduce((acc, [moduleName, revisions]) => {
        // Sort in place from greatest to least and pull the greatest one.
        revisions.sort((a, b) => semver_1.default.rcompare(a.version, b.version));
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
exports.searchForModulesAsync = searchForModulesAsync;
function printDuplicates(searchResults) {
    const cwd = process.cwd();
    const relativePath = m => path_1.default.relative(cwd, m.path);
    const tables = [];
    for (const moduleName in searchResults) {
        const moduleResult = searchResults[moduleName];
        if (moduleResult.duplicates.length > 0) {
            const table = new cli_table3_1.default();
            table.push([{ colSpan: 2, content: `📦 ${chalk_1.default.green(moduleName)}` }], [chalk_1.default.magenta(relativePath(moduleResult)), chalk_1.default.cyan(moduleResult.version)], ...moduleResult.duplicates.map(duplicate => [
                chalk_1.default.gray(relativePath(duplicate)),
                chalk_1.default.gray(duplicate.version),
            ]));
            tables.push(table);
        }
    }
    if (tables.length > 0) {
        return [
            ...tables.map(table => table.toString()),
            chalk_1.default.yellow(`⚠️  Found ${tables.length} duplicated modules, but only the greatest versions will be autolinked.`),
            chalk_1.default.yellow('Make sure to get rid of unnecessary versions as it may introduce side effects, especially on the JavaScript side.'),
        ].join(os_1.default.EOL);
    }
    return '';
}
exports.printDuplicates = printDuplicates;
async function resolveModulesAsync(platform, searchResults) {
    const platformLinking = require(`./resolvers/${platform}`);
    return (await Promise.all(Object.entries(searchResults).map(([moduleName, revision]) => platformLinking.resolveModuleAsync(moduleName, revision)))).filter(Boolean);
}
exports.resolveModulesAsync = resolveModulesAsync;
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
//# sourceMappingURL=index.js.map