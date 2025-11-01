class RestfulRoutesValidator {
  static get meta() {
    return {
      type: "suggestion",
      docs: {
        description: "Enforce RESTful route conventions"
      }
    };
  }

  static create(context) {
    return {
      "CallExpression[callee.property.name=/^(get|post|put|delete)$/]"(node) {
        const httpMethod = node.callee.property.name;
        const allowedMethods =
          RestfulRoutesValidator.#methodsMap[httpMethod] || [];
        RestfulRoutesValidator.#validateRouteMethod(
          context,
          node,
          httpMethod,
          allowedMethods
        );
      }
    };
  }

  static get #methodsMap() {
    return {
      get: ["index", "show"],
      post: ["create"],
      patch: ["update"],
      delete: ["destroy"]
    };
  }

  static #validateRouteMethod(context, node, httpMethod, allowedMethods) {
    const args = node.arguments;
    if (args.length < 2) return;

    const lastArg = args[args.length - 1];
    if (lastArg.type !== "MemberExpression") return;

    const methodName = lastArg.property.name;
    if (!allowedMethods.includes(methodName)) {
      context.report({
        node: lastArg,
        message:
          `HTTP ${httpMethod.toUpperCase()} routes should use one of these ` +
          `controller methods: ${allowedMethods.join(", ")}`
      });
    }
  }
}

export default {
  meta: RestfulRoutesValidator.meta,
  create: RestfulRoutesValidator.create
};
