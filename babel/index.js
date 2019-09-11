var babel = require("@babel/core");
var types = require("@babel/types");

babel.transform(`
import {Button} from 'antd'
const add = (a, b) => a + b;
let aa = 1;
`, { plugins: ['./babel/plugin-1.js'] }, function (err, result) {
  console.log(err)
  console.log(result.code)
});
