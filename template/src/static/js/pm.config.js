/*
 * pm.config.js
 *
 */
(function(){
    module.declare('pm.config',['pm','db'],function(require,exports){
        var pm=require('pm');
        var LOGIC_SERVER_PATH='/';
        var REGEX={
            'EMAIL':/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            'PHONE':/^0?(?:13[0-9]|14[579]|15[012356789]|17[0135678]|18[0-9])[0-9]{8}$/,
            'VCODE':/^\d{6}$/,
            'QQ':/^\d{5,12}$/,
            'NUMBER0':/^(?:[1-9][0-9]*?|0)(?:\.[0-9]+)?$/,
            'NUMBER':/^(?:[1-9][0-9]*?)(?:\.[0-9]+)?$/,
            'INTEGER0':/^(?:[1-9][0-9]*?|0)/,
            'INTEGER':/^(?:[1-9][0-9]*?)/,
            'FLOATINTEGER':/^(?:[1-9][0-9]*?)(?:\.[0]{1,2})?$/
        };
        var TOVALIDATE=function(){
            var self=this;
            var data=this.get();

            return this.validator.validate(data,function(field,error){

                self.$el.find('[data-field="'+field+'"]').focus();
                console.log(field,error);
            });
        };
        var AJAX_RESTFUL_API={
            //登录
            'qrcodeLogin':{
                'action':'wx/qrcode/login'
            },
            'qrcodeSignin':{
                'action':'wx/qrcode/signin',
                'method':'POST'
            },
            'mqssRegist':{
                'action':'mqss/regist',
                'method':'POST'
            },
            'musicCreate':{
                'action':'ajax/music/create',
                'method':'POST'
            },
            'musicUpdate':{
                'action':'ajax/music/update',
                'method':'POST'
            },
            'invitTplCreate':{
                'action':'ajax/invit/create',
                'method':'POST'
            },
            'invitTplUpdate':{
                'action':'ajax/invit/update',
                'method':'POST'
            },
            'quotationTplCreate':{
                'action':'ajax/quotation/create',
                'method':'POST'
            },
            'quotationTplUpdate':{
                'action':'ajax/quotation/update',
                'method':'POST'
            },
            'statCounts':{
                'action':'stat/counts',
                'method':'GET'
            }
        };//
        //
        var config={
            LOGIC_SERVER_PATH:LOGIC_SERVER_PATH,
            AJAX_RESTFUL_API:AJAX_RESTFUL_API,
            REGEX:REGEX,
            TOVALIDATE:TOVALIDATE,
            AJAX_REQUEST_HANDLE:function(res,success,error){
                res=res||{};
                if(!res.code){
                    if(success && typeof success === 'function'){
                        //
                        success(res);
                    }
                }else if(error){
                    if(error && typeof error === 'function'){
                        //
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