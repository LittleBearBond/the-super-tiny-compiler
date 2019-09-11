// parse.js
const recast = require('recast')

const code = `function add (a, b) {
return a+b
}`

const ast = recast.parse(code)

// 获取代码块 ast 的第一个 body，即我们的 add 函数
const [add] = ast.program.body

console.log(add)

console.log(recast.print(ast).code)
console.log(recast.prettyPrint(ast, { tabWidth: 2 }).code)
