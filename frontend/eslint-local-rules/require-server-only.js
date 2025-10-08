module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: 'Require import "server-only" in specific server files',
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      missingServerOnly:
        'Server files must import "server-only" at the top of the file',
    },
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.getFilename();

        // Check if file matches the patterns that require server-only
        const requiresServerOnly =
          // features/xxx/servers/直下のxxx.tsファイル
          /\/features\/[^/]+\/servers\/[^/]+\.ts$/.test(filename) ||
          // shared/servers/直下のxxx.tsファイル
          /\/shared\/servers\/[^/]+\.ts$/.test(filename) ||
          // external/handlers/xxx/xxx.query.ts
          /\/external\/handlers\/[^/]+\/[^/]+\.query\.ts$/.test(filename) ||
          // external/handlers/xxx/xxx.command.ts
          /\/external\/handlers\/[^/]+\/[^/]+\.command\.ts$/.test(filename) ||
          // external/services/xxx/xxx.service.ts
          /\/external\/services\/[^/]+\/[^/]+\.service\.ts$/.test(filename);

        if (!requiresServerOnly) {
          return;
        }

        // Check if the file has import "server-only"
        const hasServerOnlyImport = node.body.some((statement) => {
          return (
            statement.type === "ImportDeclaration" &&
            statement.source.value === "server-only"
          );
        });

        if (!hasServerOnlyImport) {
          context.report({
            node: node,
            messageId: "missingServerOnly",
            fix(fixer) {
              // Add import "server-only" at the beginning of the file
              const firstStatement = node.body[0];
              if (firstStatement) {
                return fixer.insertTextBefore(
                  firstStatement,
                  'import "server-only";\n'
                );
              }
              return fixer.insertTextAfterRange(
                [0, 0],
                'import "server-only";\n'
              );
            },
          });
        }
      },
    };
  },
};
