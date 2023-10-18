// 项目创建完成后输出信息
exports.run = {
  "yarn": "Start to install dependencies for the project",
  "yarn dev": "Start development",
  "yarn test": "Start test",
  "yarn debug": "Start debug",
  "yarn start": "Start production",
  "yarn stop": "Stop production",
};

// 必填
const validateRequired = (input) => {
  if (!input.trim()) {

    return false;
  }
  //
  return true;
}

// 项目创建过程中的prompts
// 参考:https://github.com/SBoudrias/Inquirer.js/blob/master/README.md
exports.prompts = {
  "name": {
    "message": "What's the project name?",
    "default": "`${this.name}`"
  },
  "description": {
    "name": "description",
    "message": "What's your project description?"
  },
  "port": {
    "name": "port",
    "message": "Input server host port,like 7001",
    "default": 7001
  },
  "cookie.keys": {
    "name": "cookieKeys",
    "message": "Input cookie keys",
    "default": function (prompts) {
      //
      return 'cookie-key:' + prompts.name;
    }
  }
} 