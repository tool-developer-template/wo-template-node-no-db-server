const Controller = require('egg').Controller;

// 错误码提示文字信息
const CodeInfo = {
  '-1': '参数错误',
  '-2': '数据验证错误',
  '-3': '数据库操作错误',
  '-4': '服务器错误',
  '-5': '缓存服务器错误',
  '-6': '请求返回错误',

  '0': '成功',
  '1': '不合法',
  '2': '已注册',
  '3': '没有授权',
  //
  '200': '成功',
  //
  '400': '服务不存在',
  '403': '无权限',
  '500': '服务器错误'
};

//
function isNumeric(value){

  return !isNaN(parseFloat(value)) && isFinite(value);
};
function isObject(value){
  //
  return typeof value=== 'object';
};


class ApiController extends Controller{
  // 自定义错误码提示信息
  static codeInfo(codeinfo) {
    codeinfo = codeinfo || {};
    //
    Object.assign(CodeInfo, codeinfo);
  }
  /**
   * 成功返回
   * @param {*} data 
   * @returns 
   */
  success(data){
    //
    return this.ctx.body = this.res(0,data)
  }
  /**
   * 失败返回
   * @param {*} message 
   * @param {*} code 
   * @returns 
   */
  fail(code,data){
    //
    if(typeof code === 'object'){
      code = code.code;
      data = code.data;
    }
    //
    const error = this.res(code,data);
    //
    this.ctx.logger.error(new Error(JSON.stringify(error)));
    //
    return this.ctx.body = error;
  }
  res(code, data) {
    //
    if (isNumeric(code)) {
      this.code = code;
    }
    //
    if (Array.isArray(code) || isObject(code)) {
      data = code;
      this.code = 0;
    }
    //
    return {
      code: this.code,
      info: CodeInfo[this.code + ''],
      data
    }
  }
}

module.exports = ApiController;