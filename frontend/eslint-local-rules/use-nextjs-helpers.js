module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce using PageProps or LayoutProps in app directory page.tsx and layout.tsx files when props are used",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Only check files in app directory
    if (!filename.includes("/app/") && !filename.includes("\\app\\")) {
      return {};
    }

    // Only check page.tsx and layout.tsx files
    const isPageFile =
      filename.endsWith("/page.tsx") || filename.endsWith("\\page.tsx");
    const isLayoutFile =
      filename.endsWith("/layout.tsx") || filename.endsWith("\\layout.tsx");

    if (!isPageFile && !isLayoutFile) {
      return {};
    }

    return {
      ExportDefaultDeclaration(node) {
        // Skip if no function is exported
        if (
          !node.declaration ||
          (node.declaration.type !== "FunctionDeclaration" &&
            node.declaration.type !== "ArrowFunctionExpression" &&
            node.declaration.type !== "FunctionExpression")
        ) {
          return;
        }

        const functionNode =
          node.declaration.type === "FunctionDeclaration"
            ? node.declaration
            : node.declaration;

        // Check if function has parameters
        if (!functionNode.params || functionNode.params.length === 0) {
          return;
        }

        const firstParam = functionNode.params[0];

        // Skip if destructuring children only (common pattern for layouts without other props)
        if (
          firstParam.type === "ObjectPattern" &&
          firstParam.properties.length === 1 &&
          firstParam.properties[0].key &&
          firstParam.properties[0].key.name === "children" &&
          !firstParam.typeAnnotation
        ) {
          return;
        }

        // Check if the parameter has a type annotation
        if (!firstParam.typeAnnotation) {
          return;
        }

        const typeAnnotation = firstParam.typeAnnotation.typeAnnotation;

        // Check if it's using PageProps or LayoutProps
        const hasCorrectType = checkTypeAnnotation(
          typeAnnotation,
          isPageFile ? "PageProps" : "LayoutProps"
        );

        if (!hasCorrectType) {
          const helperType = isPageFile ? "PageProps" : "LayoutProps";

          context.report({
            node: firstParam,
            message: `Use ${helperType} for type-safe props in ${isPageFile ? "page.tsx" : "layout.tsx"} files`,
            fix(fixer) {
              // Replace the type annotation
              if (typeAnnotation && typeAnnotation.range) {
                // Extract the route path from the file path
                const routePath = extractRoutePath(
                  filename,
                  isPageFile,
                  isLayoutFile
                );

                const newType = `${helperType}<'${routePath}'>`;

                return fixer.replaceTextRange(typeAnnotation.range, newType);
              }
            },
          });
        }
      },
    };
  },
};

function checkTypeAnnotation(typeAnnotation, expectedType) {
  if (!typeAnnotation) return false;

  // Direct reference: PageProps or LayoutProps
  if (
    typeAnnotation.type === "TSTypeReference" &&
    typeAnnotation.typeName &&
    typeAnnotation.typeName.type === "Identifier" &&
    typeAnnotation.typeName.name === expectedType
  ) {
    return true;
  }

  // Check for type imports like: import type { PageProps } from 'next'
  // This covers cases where PageProps/LayoutProps is used with generics
  if (
    typeAnnotation.type === "TSTypeReference" &&
    typeAnnotation.typeName &&
    typeAnnotation.typeName.name === expectedType
  ) {
    return true;
  }

  return false;
}

function extractRoutePath(filename, isPageFile, isLayoutFile) {
  // Remove file extension and normalize path separators
  let path = filename.replace(/\\/g, "/");

  // Find the app directory
  const appIndex = path.indexOf("/app/");
  if (appIndex === -1) return "/";

  // Extract the path after /app/
  path = path.substring(appIndex + 5);

  // Remove the file name
  if (isPageFile) {
    path = path.replace(/\/page\.tsx?$/, "");
  } else if (isLayoutFile) {
    path = path.replace(/\/layout\.tsx?$/, "");
  }

  // Convert file system path to route path
  // Remove route groups (parentheses)
  path = path.replace(/\([^)]+\)/g, "");

  // Handle root path
  if (!path || path === "") {
    return "/";
  }

  // Ensure path starts with /
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Remove any double slashes
  path = path.replace(/\/+/g, "/");

  // Remove trailing slash unless it's the root
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
}
