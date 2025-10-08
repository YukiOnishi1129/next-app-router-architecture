const path = require("path");

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: `Ensure client components and providers have 'use client' as the first line`,
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Check if file is a .tsx file (not .stories.tsx, .test.tsx, .spec.tsx)
    if (
      !filename.endsWith(".tsx") ||
      filename.endsWith(".stories.tsx") ||
      filename.endsWith(".test.tsx") ||
      filename.endsWith(".spec.tsx")
    ) {
      return {};
    }

    // Get the directory path
    const dirname = path.dirname(filename);

    // Check if file is in a 'client' or 'providers' directory (including subdirectories)
    let shouldHaveUseClient = false;
    let dirType = "";

    if (dirname.includes("/client/") || dirname.endsWith("/client")) {
      shouldHaveUseClient = true;
      dirType = "client";
    } else if (
      dirname.includes("/providers/") ||
      dirname.endsWith("/providers")
    ) {
      shouldHaveUseClient = true;
      dirType = "providers";
    }

    // Check if file is in shared/components/ui directory (including subdirectories)
    if (!shouldHaveUseClient && dirname.includes("shared/components/ui")) {
      shouldHaveUseClient = true;
      dirType = "shared/components/ui";
    }

    // Check if file is directly under src/app directory (not in subdirectories)
    const isDirectlyUnderApp =
      dirname.endsWith("/src/app") || dirname.endsWith("\\src\\app");

    return {
      "Program:exit"(node) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();

        // Check if file starts with 'use client' directive
        const trimmedText = text.trim();
        const startsWithUseClient =
          trimmedText.startsWith("'use client'") ||
          trimmedText.startsWith('"use client"');

        // If file is directly under app directory, it should NOT have 'use client'
        if (isDirectlyUnderApp && startsWithUseClient) {
          context.report({
            node: node,
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 12 },
            },
            message: `Files directly under 'app' directory must not have 'use client' directive`,
            fix(fixer) {
              // Find the 'use client' directive and remove it with any following newlines
              const useClientMatch = text.match(/^['"]use client['"][\r\n]+/);
              if (useClientMatch) {
                return fixer.removeRange([0, useClientMatch[0].length]);
              }
            },
          });
          return;
        }

        // If file should have 'use client' but doesn't
        if (shouldHaveUseClient && !startsWithUseClient) {
          context.report({
            node: node,
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 0 },
            },
            message: `Components in '${dirType}' directory must start with 'use client' directive`,
            fix(fixer) {
              return fixer.insertTextBeforeRange([0, 0], "'use client'\n\n");
            },
          });
        }
      },
    };
  },
};
