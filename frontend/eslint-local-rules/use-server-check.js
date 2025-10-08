module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: `Ensure *.action.ts files have 'use server' as the first line`,
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // Only check *.action.ts files
    if (!filename.endsWith(".action.ts")) {
      return {};
    }

    return {
      "Program:exit"(node) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();

        // Check if file starts with 'use server' directive
        const trimmedText = text.trim();
        const startsWithUseServer = trimmedText.startsWith("'use server'");

        if (!startsWithUseServer) {
          context.report({
            node: node,
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 0 },
            },
            message: `*.action.ts files must start with 'use server' directive`,
            fix(fixer) {
              return fixer.insertTextBeforeRange([0, 0], "'use server'\n\n");
            },
          });
        }
      },
    };
  },
};
