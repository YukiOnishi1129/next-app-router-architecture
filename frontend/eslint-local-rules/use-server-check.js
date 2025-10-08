module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: `Ensure *.action.ts files have 'use server' as the first line`,
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename()

    if (!filename.endsWith('.action.ts')) {
      return {}
    }

    return {
      'Program:exit'(node) {
        const useServerStatements = node.body.filter(
          (statement) =>
            statement.type === 'ExpressionStatement' &&
            statement.expression &&
            statement.expression.type === 'Literal' &&
            statement.expression.value === 'use server'
        )

        if (useServerStatements.length === 0) {
          context.report({
            node,
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
            message: `*.action.ts files must start with 'use server' directive`,
            fix(fixer) {
              return fixer.insertTextBeforeRange([0, 0], "'use server'\n\n")
            },
          })
          return
        }

        const firstStatement = node.body[0]
        if (
          !(
            firstStatement &&
            firstStatement.type === 'ExpressionStatement' &&
            firstStatement.expression &&
            firstStatement.expression.type === 'Literal' &&
            firstStatement.expression.value === 'use server'
          )
        ) {
          context.report({
            node: firstStatement || node,
            message: `*.action.ts files must start with 'use server' directive`,
            fix(fixer) {
              return fixer.insertTextBeforeRange([0, 0], "'use server'\n\n")
            },
          })
        }

        useServerStatements.slice(1).forEach((statement) => {
          context.report({
            node: statement,
            message: "Duplicate 'use server' directive",
            fix(fixer) {
              return fixer.remove(statement)
            },
          })
        })
      },
    }
  },
}
