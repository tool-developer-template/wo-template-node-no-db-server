/*
 * pm.analytics.js
 *
 */

(function(){
    var $global=module.globals('$');
    
    module.declare('pm.analytics',[$global,'pm'],function(require,exports){
        var $=require($global);
        var pm=require('pm');
        var utils=pm.utils;
        
         function Analytics(options){
            options=options||{};
            options.el=options.el||'body';
            options.name=options.name||'';
            this.statistics=options.statistics||window._hmt;
            this.mappings=options.mappings||{};
            this.options=options;
            this.$el=$(options.el);
            this.el=this.$el[0];
            
            //event name
            var self=this;
            //event on
            this.$el.on('click','[data-analytics]',function(e){
                /*var target=e.target;
                while(!(target.nodeType === 9 || target === this  || target.getAttribute('data-analytics') !== null)){
                   
                    target=target && target.parentNode ? target.parentNode : this;
                }*/
                var data=this.getAttribute('data-analytics');
                if(data !== null && data !== 'ignore'){
                    //data
                    self.data=data;
                    //target
                    self.target=this;
                    //$target
                    self.$target=$(this);
                    //
                    var info=self.info();
                    //
                    self.statistics && self.statistics.push(info);
                    
                    self.options.analyze && self.options.analyze.call(self,e);
                }
            });
        }
        
        Analytics.prototype={
            get:function(){
                var data=this.data;
                var result={};
                if(data){
                    if(data.indexOf(';') > -1 || data.indexOf(':') > -1){
                        //'name:name;type:click'
                        data=data.split(';');
                        utils.each(data,function(value,index){
                            if(value.indexOf(':') > -1){
                                var r=value.split(':');
                                result[r[0]]=r[1];
                            }
                        });
                    }else{
                        result['name']=data;
                    }
                }
                //deal mappings data
                var name=result['name']||'';
                var mp=this.options.name ? [this.options.name,name].join(' ') : name;
                var json=this.mappings[mp]||this.mappings[name]||{};
                
                return utils.extend(result,json);
            },
            info:function(){
                var data=this.get();
                var page=this.options.name||'page';
                var name=data['name']||'';
                var type=data['type']||'click';
                var alias=data['alias']||'button';
                var device=this.options.device;
                
                var result=[page];
                //device
                if(device){
                    result.push(device);
                }
                //name
                if(name){
                    result.push(name);
                }
                var event=result.join('-');
                
                return ['_trackEvent',event,type,alias];
            }
        };
        //
        //create method
        Analytics.create=function(options){
            
            return new Analytics(options);
        };
        
        //namespace analytics,pm.analytics
        pm.ns('analytics');
        pm.analytics=Analytics;
        
        return Analytics;
    });
})();