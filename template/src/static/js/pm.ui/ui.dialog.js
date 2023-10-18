/*
 * ui.dialog plugin
 *
 * api:
        Dialog.get:
        Dialog.dialog:
        Dialog.alert://didn't realize
        Dialog.prompt://didn't realize
        Dialog.submit://didn't realize
        Dialog.show:function(dialog){}//dialog or dialog id
        Dialog.hide:function(dialog){}//dialog or dialog id
        Dialog.remove:function(dialog){}//dialog or dialog id
        
        var dialog=Dialog.dialog({});//create a dialog object
        dialog.show:show this dialog
        dialog.hide:hide this dialog
        dialog.remove:remove this dialog
 * sample:
        html:
            <div id="_content">content</div>
            
        css:
            <link type="text/css" rel="stylesheet" href="./stylesheets/ui.dialog.css"/>
            
        js:
            var Dialog=require('ui.dialog');
            var dailog=Dialog.dialog({
                id:'_test',
                width:600,//default 600,
                height:200,//default no height
                zIndex:10000,//z-index ,default 1000,
                opacity:.5,//modal cover opacity,default .5
                modal:true,//default true,has modal cover
                auto:true,//default false,auto show
                cls:'content',//content zone class
                content:$('#_content'),//document or jquery object ,or html string
                show:function(){
                    //show callback
                },
                hide:function(){
                    //hide callback
                },
                remove:function(){
                    //remove callback
                },
                outclick:function(){
                    //outside click callback ,this must be on modal.
                    this.hide();
                },
                renderTo:'body'//default body
            });
 */
(function(){
    if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
    
    var $name=module.globals('$');
    
    module.declare('ui.dialog',[$name],function(require){
        
        var $=require($name);
        
        function Dialog(options){
            options=options||{};
            //width
            options.width=options.width||600;
            //z-index
            options.zIndex=options.zIndex||1000;
            //modal
            options.modal=options.modal === false ? false : (options.modal || true);
            //opacity
            options.opacity=options.opacity === undefined ? .5 : options.opacity;
            //options
            this.options=options;
            
            //id
            this.id=options.id||Dialog.gid(),
                dialog=Dialog.get(this.id);
            if(dialog){//already created
                
                return dialog.show();
            }
            
            Dialog.set(this.id,this);
            
            var $renderTo=$(options.renderTo || 'body'),
                zIndex=options.zIndex;
            
            var _this=this;
            
            //container
            this.$container=$('<div data-role="dialog" class="dialog-box" style="display:none;"/>')
                .attr('id',this.id)
                .css({
                    'z-index':options.zIndex
                })
                .appendTo($renderTo);
                
            //content
            this.$content=$(options.content)
                .css({
                        width:options.width,
                        height:options.height
                    })
                .addClass('dialog-content')
                .addClass(options.cls)
                .appendTo(this.$container);
            
            //modal
            if(options.modal){
            
                this.$container
                    .addClass('modal');
                
                this.$mask=$('<div data-role="mask" class="mask"/>')
                    .css({
                        'position':'absolute',
                        'z-index':'-1',
                        'opacity':options.opacity
                    })
                    .appendTo(this.$container);
                    
                if(options.outclick){
                    
                    this.$mask.click(function(){
                        options.outclick && options.outclick.call(_this);    
                    });
                }                
            }else{
                var width=parseFloat(this.$container.width()),
                    height=parseFloat(this.$container.height());
                this.$container
                    .css({
                        'margin-left':-width/2,
                        'margin-top':-height/2
                    })
            }
            //
            if(options.auto){
                this.show();
            }
        };
        Dialog.prototype={
            resize:function(){
                
            },
            follow:function(){
                
            },
            show:function(){
                $('body').addClass('modal-open');
                this.options.show && this.options.show.call(this);
                this.$container
                    .css({
                        'display':'block'
                    })
                    .addClass('fade');
                
                var _this=this,
                    t=setTimeout(function(){
                        _this.$container
                            .addClass('in');
                        clearTimeout(t);
                    },10);
            },
            hide:function(){
                $('body').removeClass('modal-open');
                this.options.hide && this.options.hide.call(this);
                
                this.$container.removeClass('in');
                var _this=this,
                    t=setTimeout(function(){
                        _this.$container
                        .removeClass('fade')
                        .hide();
                    },200);
            },
            remove:function(){
                $('body').removeClass('modal-open');
                this.options.remove && this.options.remove.call(this);
                this.$container.remove();
            }
        };
        Dialog.Cache={};
        
        Dialog.gid=function(){
            
            return new Date().getTime()+''+Math.floor(Math.random()*1000000);
        };
        Dialog.isIn=function(dialog){
            
            return Dialog.get(dialog) ? true : false;
        };
        Dialog.set=function(id,dialog){
            
            return Dialog.Cache[id]=dialog;
        },
        Dialog.get=function(dialog){
            if(dialog === undefined || dialog === null){
                
                return null;
            }
            if(typeof dialog === 'object'){
                
                return dialog;
            }
            
            return Dialog.Cache[dialog];
        };
        Dialog.dialog=function(options){
            
            return new Dialog(options);
        };
        Dialog.alert=function(){
            
        };
        Dialog.submit=function(){
            
        };
        Dialog.prompt=function(){
            
        };
        Dialog.show=function(dialog){//dialog obj or id
            var dialog=Dialog.get(dialog);
            
            dialog && dialog.show();
        };
        Dialog.hide=function(dialog){//dialog obj or id
            var dialog=Dialog.get(dialog);
            
            dialog && dialog.hide();
        };
        Dialog.remove=function(dialog){//dialog obj or id
            var dialog=Dialog.get(dialog);
            
            dialog && dialog.remove();
        };
        
        return Dialog;
    });
})();