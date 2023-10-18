const Controller = require('egg').Controller;
const {STATIC_PATH,STATIC_ASSETS_PATH,STATIC_IMAGE_PATH} = require('../../config/global');

class ViewController extends Controller{
  //
  async renderView(page,local={}){
    const ctx = this.ctx;
    const ua = ctx.useragent;
    //const req = ctx.request;
    //const agent = req.headers['user-agent'] || '';
    // 全局变量导出
    const globalPath = {
      STATIC_PATH,
      STATIC_ASSETS_PATH,
      STATIC_IMAGE_PATH
    };
    //
    if(ua.mobile){
      //
      return ctx.body = await ctx.renderView('pages/m/'+page,{
        currentPage:page,
        ...local,
        ...globalPath
      })
    }
    //
    return ctx.body = await ctx.renderView('pages/'+page,{
      currentPage:page,
      ...local,
      ...globalPath
    })
  }
}

module.exports = ViewController;