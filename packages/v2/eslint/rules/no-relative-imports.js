import path from "path";
import { existsSync } from "fs";

class NoRelativeImportsValidator {
  static get meta() {
    return {
      type: "problem",
      docs: {
        description: "Disallow relative imports in favor of absolute imports",
      },
      fixable: "code",
      schema: [],
    };
  }

  static create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        if (NoRelativeImportsValidator.#isRelativeImport(importPath)) {
          const currentFilePath = context.getFilename();
          const absolutePath = NoRelativeImportsValidator.#convertToAbsolute(
            importPath,
            currentFilePath,
          );

          if (absolutePath) {
            context.report({
              node: node.source,
              message:
                "Relative imports are not allowed. Use absolute imports instead.",
              fix(fixer) {
                return fixer.replaceText(node.source, `"${absolutePath}"`);
              },
            });
          }
        }
      },
    };
  }

  static #isRelativeImport(importPath) {
    return importPath.startsWith("./") || importPath.startsWith("../");
  }

  static #convertToAbsolute(relativePath, currentFilePath) {
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.resolve(currentDir, relativePath);

    const projectRoot =
      NoRelativeImportsValidator.#findProjectRoot(currentFilePath);
    if (!projectRoot) return null;

    const srcRoot = path.join(projectRoot, "src");

    if (resolvedPath.startsWith(srcRoot)) {
      let absolutePath = path.relative(srcRoot, resolvedPath);
      absolutePath = absolutePath.replace(/\\/g, "/");

      if (absolutePath.endsWith(".js")) {
        absolutePath = absolutePath.slice(0, -3);
      }

      return absolutePath;
    }

    return null;
  }

  static #findProjectRoot(filePath) {
    let currentDir = path.dirname(filePath);

    while (currentDir !== path.dirname(currentDir)) {
      if (existsSync(path.join(currentDir, "package.json"))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return null;
  }
}

export default {
  meta: NoRelativeImportsValidator.meta,
  create: NoRelativeImportsValidator.create,
};
