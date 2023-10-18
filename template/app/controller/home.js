const Controller = require('../core/view.controller');
//
class HomeController extends Controller{
  async index(){

    // service.*,// 首字母小写
    // await this.service.user.find()

    //this.ctx.body = this.ctx.__('hello')
    return await this.renderView('index',{
      
    })
  }
}

module.exports = HomeController;