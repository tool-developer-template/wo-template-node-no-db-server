const Controller = require('../core/view.controller');

class <%= contextName %>Controller extends Controller{
  async index(){

    
    //this.ctx.body = "Hello"
    return await this.renderView('<%= (contextName.charAt(0).toLowerCase() + contextName.slice(1)) %>',{
      
    })
  }
}

module.exports = <%= contextName %>Controller;