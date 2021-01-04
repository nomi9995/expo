#!/usr/bin/env node
'use strict';

const commander = require('commander');
const process = require('process');

// Have to force color support — logs wouldn't have colors when spawned by another process.
// It must be set before `supports-color` (`chalk` dependency) module is imported.
process.env.FORCE_COLOR = 'true';

const autolinking = require('../build/index');
const cwd = process.cwd();

registerLookupCommand('search', async (paths, options) => {
  const search = await autolinking.searchForModulesAsync({ paths });
  const logs = autolinking.printDuplicates(search);
  const modules = await autolinking.resolveModulesAsync(options.platform, search);

  if (process.stdout.isTTY) {
    console.log(modules);
  } else {
    console.log(JSON.stringify({ logs, modules }));
  }
}).option(
  '-p, --platform <platform>',
  'The platform that the resulted modules must support. Available options: "ios", "android"',
  'ios'
);

registerLookupCommand('list', async paths => {
  const search = await autolinking.searchForModulesAsync({ paths });
  console.log(require('util').inspect(search, false, null, true));
});

registerLookupCommand('list-duplicates', async paths => {
  const search = await autolinking.searchForModulesAsync({ paths });
  const logs = autolinking.printDuplicates(search);

  if (logs) {
    console.log(logs);
  } else {
    console.log('Duplicated modules at the following search paths not found:', paths);
  }
});

commander.version(require('expo-module-autolinking/package.json').version).parseAsync(process.argv);

function registerLookupCommand(commandName, fn) {
  return commander.command(`${commandName} [paths...]`).action(async (lookupPaths, command) => {
    const resolvedPaths = await autolinking.resolveLookupPathsAsync(lookupPaths, cwd);
    return await fn(resolvedPaths, command);
  });
}
