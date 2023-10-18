/*
 * pm.config.js
 *
 */
(function(){
    module.declare('pm.config',['pm'],function(require,exports){
        var pm=require('pm');
        var LOGIC_SERVER_PATH='/api/';
        var AJAX_RESTFUL_API={
            //登录
            'sign':{
                'method':'POST'
            },
            'signin':{
                'action':'user/signin',
                'method':'POST'
            },
            'signout':{
                'action':'/user/{id}'
            }
        };//
        //
        var config={
            LOGIC_SERVER_PATH:LOGIC_SERVER_PATH,
            AJAX_RESTFUL_API:AJAX_RESTFUL_API,
            AJAX_REQUEST_HANDLE:function(res,success,error){
                res=res||{};
                if(res.code <= 10){
                    if(success && typeof success === 'function'){

                        success(res);
                    }
                }else{
                    if(error && typeof error === 'function'){
                        error(res);
                    }
                }
            },
            //
            OTHERS:''
        };
        //namespace config,core.config
        pm.ns('config');
        pm.config=config;
        //
        return config;
    });
})();