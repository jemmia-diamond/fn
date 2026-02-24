class NoVietnameseTextValidator {
  static get meta() {
    return {
      type: "problem",
      docs: {
        description: "Disallow Vietnamese text in comments, only English is allowed"
      },
      fixable: null,
      schema: []
    };
  }

  static create(context) {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]/;

    function checkText(node, text) {
      if (text && vietnamesePattern.test(text)) {
        context.report({
          node,
          message: "Vietnamese text in comments is not allowed. Only English comments are permitted."
        });
      }
    }

    return {
      Program() {
        const sourceCode = context.sourceCode;
        const comments = sourceCode.getAllComments();

        comments.forEach(comment => {
          checkText(comment, comment.value);
        });
      }
    };
  }
}

export default {
  meta: NoVietnameseTextValidator.meta,
  create: NoVietnameseTextValidator.create
};
