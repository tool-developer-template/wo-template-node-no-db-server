/*
 * pm.view.js
 *
 */

(function(){
    var $global=module.globals('$');
    
    module.declare('pm.view',[$global,'pm','pm.dataset'],function(require,exports){
        var $=require($global);
        var pm=require('pm');
        var utils=pm.utils;
        var dataset=pm.ns('dataset');
        
        //cached regex to split keys for 'delegate'
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        //can't to rewrite method
        var viewOptions=['_stopListening','_setElement','_ensureElement','_delegateEvents','_undelegateEvents'];
        var dsOptions=dataset.DefaultOptions||[];
        viewOptions=viewOptions.concat(dsOptions);
        
        var View=pm.extend(dataset,{
            constructor:function(options){
                var self=this;
                self.cid=utils.uid('view');
                options=options||{};
                options.el=options.el||'body';
                utils.extend(self,utils.omit(options,viewOptions));
                
                //console.log('--view constructor--');
                
                self._ensureElement();
                self.initialize.apply(self,arguments);
                self._delegateEvents();
            },
            initialize:function(){},
            render:function(){
                
                return this;
            },
            remove:function(){
                
                this.$el.remove();
                //this._stopListening();
                
                return this;
            },
            //private method
            _setElement:function(element,delegate){
                if(this.$el){
                    this._undelegateEvents();
                }
                
                this.$el=$(element); 
                this.el=this.$el[0];
                if(delegate !== false){
                    
                    this._delegateEvents();
                }
                
                return this;
            },
            //
            _undelegateEvents:function(){
                
                this.$el.off('.delegateEvents'+this.cid);
                
                return this;
            },
            //
            _delegateEvents:function(events){
                if(!(events || (events=utils.result(this,'events')))){
                    
                    return this;
                }
                this._undelegateEvents();
                for(var key in events){
                    var method=events[key];
                    if(!utils.isFunction(method)){
                        method=this[events[key]];
                    }
                    if(!method){
                        continue;
                    }
                    var match=key.match(delegateEventSplitter);
                    var eventName=match[1];
                    var selector=match[2];
                    method=utils.bind(method,this);
                    eventName+='.delegateEvents'+this.cid;
                    if(selector === ''){
                        this.$el.on(eventName,method);
                    }else{
                        this.$el.on(eventName,selector,method);
                    }
                }
                
                return this;
            },
            //
            _ensureElement:function(){
                
                this._setElement(utils.result(this,'el'),false);
                
                return this;
            }
        });
        
        //
        //create method
        View.create=function(options){
            
            return new View(options);
        };
        
        //namespace view,pm.view
        pm.ns('view');
        pm.view=View;
        
        return View;
    });
})();