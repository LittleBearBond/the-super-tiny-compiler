function tokenizer(input) {
  let current = 0
  let tokens = []
  while (current < input.length) {
    // 遍历
    let char = input[current]
    // 左括号
    if (char === '(' || char === ')') {
      tokens.push({
        type: 'paren',
        value: char
      })
      current++
      continue;
    }
    /*  if (char === ')') {
       tokens.push({
         type: 'paren',
         value: char
       })
       current++
       continue;
     } */

    //  white space
    const WHITE_SPACE = /\s/
    // 这里可以优化while  这里直接向后扫描空白字符
    if (WHITE_SPACE.test(char)) {
      current++
      continue;
    }

    // number
    const NUMBER = /\d/
    if (NUMBER.test(char)) {
      let value = ''
      while (NUMBER.test(char)) {
        value += char
        char = input[++current]
      }
      tokens.push({
        type: 'number',
        value
      })
      continue;
    }

    // string
    if (char === '"') {
      let value = ''
      char = input[++current]
      while (char !== '"') {
        value += char
        char = input[++current]
      }
      // '"'，拿出右引号
      char = input[++current]
      tokens.push({
        type: 'string',
        value
      })
      continue;
    }

    let LETTERS = /[a-z]/i
    if (LETTERS.test(char)) {
      let value = ''
      while (LETTERS.test(char)) {
        value += char
        char = input[++current]
      }
      tokens.push({
        type: 'name',
        value
      })
      continue;
    }
    throw new TypeError('I dont know what this character is: ' + char);
  }
  return tokens;
}


function parser(tokens) {
  let current = 0

  const ast = {
    type: 'Program',
    body: []
  }

  function walk() {
    let { type, value } = tokens[current]
    if (type === 'number') {
      current++
      return {
        type: 'NumberLiteral',
        value: value
      }
    }
    if (type === 'string') {
      current++
      return {
        type: 'StringLiteral',
        value: value
      }
    }
    // 左括号
    if (type === 'paren' && value === '(') {
      // 继续迭代
      let token = tokens[++current]
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      }
      token = tokens[++current]
      // 遍历取到参数
      while (token.type !== 'paren' || (token.type === 'paren' && token.value === '(')) {
        // 递归取参数
        node.params.push(walk())
        // 拿出右括号
        token = tokens[current]
      }
      current++
      return node;
    }
    throw new TypeError(token.type);
  }

  while (current < tokens.length) {
    ast.body.push(walk())
  }

  return ast;
}

function traverser(ast, visitor = {}) {

  function traverseArray(array, parent) {
    array.forEach(child => traverseNode(child, parent));
  }

  function tranverseNode(node, parent) {
    const { enter, exit } = visitor[node.type] || {}
    if (enter) {
      enter(node, parent)
    }
    switch (node.type) {
      // 入口多个
      case 'Program':
        traverseArray(node.body, node);
        break;
      case 'CallExpression':
        // 多个参数
        traverseArray(node.params, node);
        break;
      // 字符串或者数字
      case 'NumberLiteral':
      case 'StringLiteral':
        break;
      default:
        throw new TypeError(node.type);
    }

    if (exit) {
      exit(node, parent);
    }
  }

  // 从根节点开始
  tranverseNode(ast, null)
}

function transformer(ast) {

  const newAst = {
    type: 'Program',
    body: []
  }

  //
  ast._context = newAst.body
  traverser(ast, {
    NumberLiteral: {
      enter({ value }, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value
        });
      },
    },
    StringLiteral: {
      enter({ value }, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value
        });
      },
    },
    CallExpression: {
      enter(node, parent) {

        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        node._context = expression.arguments;

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        parent._context.push(expression);
      }
    }
  });

  return newAst;
}
