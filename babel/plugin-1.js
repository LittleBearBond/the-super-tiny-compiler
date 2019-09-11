module.exports = function ({ types: t }) {
  return {
    visitor: {
      // visitor contents
      // Identifier(path) {
      //   // console.log(path)
      //   console.log(path.node.name)
      // }
      /* Identifier: {
        enter(path) {
          // console.trace("我是进入的：", path.node.name)
          console.log("我是进入的：", path.node.name)
        },
        exit(path) {
          console.log("我是退出的：", path.node.name)
        }
      }, */
      VariableDeclaration(path) {
        console.log('path.node.kind', path.node.kind)
        if (path.node.kind && ['const', 'let'].includes(path.node.kind)) {
          path.node.kind = 'var'
        }
      },
      Program: {

      }
    }
  };
};
