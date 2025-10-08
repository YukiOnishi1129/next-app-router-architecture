module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Restrict action.ts imports to components with "use client" directive',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      actionImportNotAllowed:
        'Components without "use client" directive cannot import *.action.ts files. Add "use client" directive, convert to a custom hook (use*.ts/tsx), or remove the action import.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const filename = context.getFilename()

        // Only check .ts and .tsx files
        if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) {
          return
        }

        // Skip if this is a custom hook (use*.ts or use*.tsx)
        const basename = filename.split('/').pop()
        if (basename.startsWith('use')) {
          return
        }

        // Check if importing an action.ts file
        const importPath = node.source.value
        if (
          !importPath.includes('.action') &&
          !importPath.endsWith('.action.ts')
        ) {
          return
        }

        // Get the source code
        const sourceCode = context.getSourceCode()
        const programNode = sourceCode.ast

        // Check if file has 'use client' directive
        const hasUseClient = programNode.body.some((statement, index) => {
          // Check only the first few statements for directives
          if (index > 5) return false

          return (
            statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'Literal' &&
            statement.expression.value === 'use client'
          )
        })

        if (!hasUseClient) {
          context.report({
            node: node,
            messageId: 'actionImportNotAllowed',
          })
        }
      },
    }
  },
}
