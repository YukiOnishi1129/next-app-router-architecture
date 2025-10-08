module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Restrict imports from external/services to only handlers/*.command.ts and handlers/*.query.ts files',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      invalidServiceImport:
        'Services from external/services can only be imported in external/handlers/*.command.ts or external/handlers/*.query.ts files',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const filename = context.getFilename()

        // Check if importing from external/services
        if (!importPath.includes('/external/services/')) {
          return
        }

        // Allow imports in handler command and query files
        const isHandlerCommand =
          /\/external\/handlers\/[^/]+\/[^/]+\.command\.ts$/.test(filename)
        const isHandlerQuery =
          /\/external\/handlers\/[^/]+\/[^/]+\.query\.ts$/.test(filename)

        if (isHandlerCommand || isHandlerQuery) {
          return
        }

        // Report error for imports from other files
        context.report({
          node,
          messageId: 'invalidServiceImport',
        })
      },
    }
  },
}
