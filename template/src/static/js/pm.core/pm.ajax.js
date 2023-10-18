/*
 * pm.ajax.js
 *
 *
            
*/

(function(){
    //
    var $global=module.globals('$');
    //
    module.declare('pm.ajax',[$global,'pm','pm.config'],function(require){
        var $=require($global);
        var pm=require('pm');
        var mc=require('pm.config');
        //
        var handle=mc.AJAX_REQUEST_HANDLE;
        
        var config={
            url:mc.LOGIC_SERVER_PATH,
            headers:{
                //'Access-Control-Allow-Origin':'*'
            },
            timeout:120000,//2*60*1000
            type:'GET'
        };
        var restful=mc.AJAX_RESTFUL_API||{};
        
        function toRestful(name,data){
            var t=restful[name] && restful[name]['action']||name||'',
                reg=/\{([\w\-\.]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
                fn=function($0,$1){
                    var d=data[$1];
                    delete data[$1];//remove url parameter
                    
                    return d !== undefined ? d : ''; 
                };
                
                t=t.replace(reg,fn);
                t=t.replace(/(\/){2,}/g,'/');//more than two //
                t=t.replace(/\/$/,'');//replace end /
            
            return t;
        }
        
        var ajax={
            config:function(options){
                $.extend(config,options);
                
                return this;
            },
            request:function(action,options){
                
                options=$.extend({},config,options);
                
                var  error=options.error||function(res){
                    if(typeof res === 'string'){
                        try{
                            res=$.parseJSON(res);
                        }catch(e){
                            console.log('error ,and data error ,no json!');
                        }
                    }
                    
                    handle ? handle(res,'',options.error) : (options.error && options.error(res));
                },
                success=options.success;
                //debug
                options.success=function(res){
                    
                    if(typeof res === 'string'){
                        try{
                            res=$.parseJSON(res);
                        }catch(e){
                            
                            console.log('success,but data error ,no json!');
                        }
                    }
                    //
                    handle ? handle(res,success,error) : (success && success(res));
                };
                //not online
                if(!window.navigator.onLine){
                    error({
                        code:10001,
                        info:'You are in offline status!'
                    });
                    
                    return this;
                }
                if(!action){
                    
                    throw 'There is no ACTION name!';
                }
                //url
                options.url=options.url + (toRestful(action,options.data||{}) || action);
                //type,default post
                options.type=(restful[action] && restful[action]['method'])||options.type;
                options.type=options.type.toUpperCase();
                
                //console.log('--request param--');
                //console.log(options.url);
                //console.dir(options);
                
                return $.ajax(options);
            }
        };
        
        //namespace ajax,pm.ajax
        pm.ns('pm.ajax');
        pm.ajax=ajax;
        
        return ajax;
    });
})();