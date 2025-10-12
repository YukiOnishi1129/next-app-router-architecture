module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing server-only external domain modules outside the external layer',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      noExternalDomain:
        "Don't import from '@/external/domain/**' outside the external layer. Re-export needed types from a feature/shared types module.",
    },
  },
  create(context) {
    function reportIfExternalDomainImport(source, node) {
      if (
        typeof source === 'string' &&
        source.startsWith('@/external/domain/')
      ) {
        context.report({ node, messageId: 'noExternalDomain' })
      }
    }

    return {
      ImportDeclaration(node) {
        reportIfExternalDomainImport(
          node.source && node.source.value,
          node.source || node
        )
      },
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          node.arguments &&
          node.arguments.length === 1
        ) {
          const arg = node.arguments[0]
          if (arg && arg.type === 'Literal') {
            reportIfExternalDomainImport(arg.value, arg)
          }
        }
      },
    }
  },
}
