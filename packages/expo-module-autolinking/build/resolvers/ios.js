"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModuleAsync = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const path_1 = __importDefault(require("path"));
/**
 * Resolves module search result with additional details required for iOS platform.
 */
async function resolveModuleAsync(moduleName, revision) {
    const [podspecFile] = await fast_glob_1.default('*/*.podspec', {
        cwd: revision.path,
        ignore: ['**/node_modules/**'],
    });
    if (!podspecFile) {
        return null;
    }
    const podspecName = path_1.default.basename(podspecFile, path_1.default.extname(podspecFile));
    const podspecDir = path_1.default.dirname(path_1.default.join(revision.path, podspecFile));
    return {
        name: moduleName,
        podName: podspecName,
        path: podspecDir,
    };
}
exports.resolveModuleAsync = resolveModuleAsync;
//# sourceMappingURL=ios.js.map