import RestfulRoutesValidator from "../rules/restful-routes.js";

export default function getRoutesConfig() {
  return {
    files: ["src/routes/**/*.js"],
    plugins: {
      "restful": {
        rules: {
          "routes": RestfulRoutesValidator
        }
      }
    },
    rules: {
      "restful/routes": "error"
    }
  };
}
