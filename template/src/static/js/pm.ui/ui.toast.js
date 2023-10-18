/*
 * ui.toast plugin
 *
 * api:
        load:function(options){}//
 * sample:
        html:
            <div class="toast">
              <div class="toast-text"></div>
            </div>
        
        css:
            <link type="text/css" rel="stylesheet" href="./stylesheets/ui.toast.css"/>
        
        js:
            const Toast=require('ui.toast');
            const toast = new Toast({
              duration:2000,
              text:'提示文字',
              appendTo:'body',
              showCls:'showed'
            });
            //
            toast.show();
            toast.show(text,duration,appendTo);
            //
            toast.hide();
 */

            (function(){
              if (module.declare === undefined) {
                  
                  throw 'There is no global module.declare method!';
              }
              const $$=module.globals('$');
              
              module.declare('ui.toast',[$$],function(require){
                  const $=require($$);
                  //
                  function Toast(options){
                      options=options||{};
                      //
                      this.options = options;
                      //
                      this.$toast = $('<div data-role="toast" class="toast"/>');
                      this.$text = $('<div data-role="toast-text" class="toast-text"/>');
                      //
                      this.$toast.append(this.$text);
                      //
                      // this.show(text,duration,appendTo);
                  };
                  //
                  Toast.load = function(options){
                    //
                    return new Toast(options);
                  };
                  //
                  Toast.prototype={
                      show:function(text,duration,appendTo){
                        text = text || this.options.text;
                        duration = duration || this.options.duration || 2000;
                        appendTo = appendTo || this.options.appendTo || 'body';
                        const showCls = this.options.showCls || 'showed';
                        //
                        this.$text.text(text);
                        this.$toast.appendTo(appendTo);
                        if(showCls){
                          //
                          this.$toast.addClass(showCls);
                        }
                        this.options.showCls = showCls;
                        //
                        clearTimeout(this.timeout);
                        //
                        this.timeout = setTimeout(()=>{
                          //
                          this.hide();
                        },duration)
                      },
                      hide:function(){
                        const showCls = this.options.showCls;
                        this.$toast.removeClass(showCls);
                        //
                        clearTimeout(this.timeout);
                      },
                  };
                  //
                  return Toast;
              });
          })();