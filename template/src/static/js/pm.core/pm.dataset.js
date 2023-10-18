/*
 * pm.dataset.js
 *
 */


(function(undefined){
    //
    var $global=module.globals('$');
    //
    module.declare('pm.dataset',[$global,'pm'],function(require,exports){
        var $=require($global);
        var pm=require('pm');
        var utils=pm.utils;
        
        //can't to rewrite method
        var dsOptions=['get','set','save','handle','val','_delegateChanges'];
        var dsDefaultPrototype=['data','fields','defaults','settings','gettings'];
        var DATA_FIELD='data-field';
        
        //nodeName
        var VALUE_MAPPING={
            'label':'text',
            'span':'text',
            'p':'html',
            'div':'html'
        };
        
        /*
         *
            '' => ['data-field']
            v1 => ['data-field="v1"']
         *
         */
        function getFieldName(field){
            var res=['[',DATA_FIELD];
            //[data-field]
            if(field !== undefined){
                //[data-field="field"]
                res=res.concat(['=','"',field,'"']);
            }
            //
            res.push(']');
            
            return res.join('');
        }
        /*
         *
            $el -> {'v1':'[data-field="v1"]',...}
         *
         */
        function getFields($el){
            var $items=$el.find(getFieldName());
            var fields={};
            $items.each(function(){
                var field=$(this).attr(DATA_FIELD);
                
                fields[field]=getFieldName(field);
            });
            
            return fields;
        }
        /*
         *
            ['v1','v2'] => {'v1':'[data-field="v1"]','v2':'[data-field="v2"]'}
         *
         */
        function array2json(arr){
            var i=0;
            var len=arr.length;
            var json={};
            for(;i<len;i++){
                var field=arr[i];
                json[field]=getFieldName(field);
            }
            
            return json;
        }
        /*
         * 'v1' => ['v1'] => {'v1':'v1'}
         * ['v1','v2'] => {'v1':'v1','v2':'v2'}
         */
        function handleFields(fields){
            if(typeof fields === 'string'){
                fields=[fields];
            }
            
            fields=utils.toBoolean(fields) ? fields : utils.extend(getFields(this.$el),this.fields);
            //
            if(utils.isArray(fields)){
                fields=array2json(fields);
            }
            
            return fields||{};
        }
        /*
         *
            get value:
                $el => $el.text() or $el.html() or $el.val() or $el.attr('src')
            set value:
                $el,value => $el.text(value) or $el.html(value) or $el.val(value) or $el.attr('src',value)
         *
         */
        function handleValue($el,value){
            if($el && $el.length){
                var nodeName=$el[0].nodeName;
                nodeName=nodeName.toLowerCase();
                //img
                if(nodeName === 'img'){
                    
                    return value !== undefined ? $el.attr('src',value) : $el.attr('src');
                }
                var method=this.mappings[nodeName];
                if(method){
                    
                    return value !== undefined ? $el[method](value) : $el[method]();
                }
                
                return value !== undefined ? $el.val(value) : $el.val();
            }
        }
        //
        var DataSet=pm.extend(Object,{
            constructor:function(options){
                var self=this;
                //
                options=options||{};
                
                utils.extend(self,utils.omit(options,dsOptions));
                
                var el=options.el||'body';
                var fields=options.fields||{};
                if(utils.isArray(fields)){
                    fields=array2json(fields);
                }
                self.$el=$(el); 
                self.el=self.$el[0];
                //default prototype
                utils.each(dsDefaultPrototype,function(value,index){
                    self[value]=options[value]||{};
                });
                //fields
                self.fields=fields;
                //mappings
                self.mappings=utils.extend(VALUE_MAPPING,options.mappings||{});
                
                //console.log('--dataset constructor--');
                //
                self.initialize.apply(self,arguments);
            },
            initialize:function(){},
            //
            get:function(fields){
                var res={};
                var handing=this.gettings['...'];
                //
                fields=handleFields.call(this,fields);
                //
                for(var field in fields){
                    var item=this.fields[field]||fields[field]||getFieldName(field);
                    var $item=this.$el.find(item);
                    var render=this.gettings[field]||handing;
                    var value=undefined;
                    if(render && utils.isFunction(render)){
                        value=render.call(this,$item,field,fields);
                    }
                    value=(value !== undefined) ? value : handleValue.call(this,$item);
                    //default value
                    value=value !== undefined ? value : this.defaults[field];
                    
                    if(value !== undefined){
                        res[field]=value;
                    }
                }
                
                return res;
            },
            //
            set:function(){
                var changes=this._delegateChanges.apply(this,Array.prototype.slice.call(arguments,0));
                //
                var events=utils.result(this,'changes');
                if(!(utils.toBoolean(events))){
                    
                    return this;
                }
                
                //
                if(changes.length){
                    for(var i=0,l=changes.length;i<l;i++){
                        var field=changes[i];
                        var method=events[field];
                        var capture=events['*'];//any data change
                        if(!utils.isFunction(method)){
                            method=this[events[field]];
                        }
                        if(method){
                            method=utils.bind(method,this);
                            method.call(this,this.data[field],field);
                        }
                        
                        //trigger any data change event
                        if(!utils.isFunction(capture)){
                            capture=this[events['*']];
                        }
                        if(capture){
                            capture=utils.bind(capture,this);
                            capture.call(this,this.data[field],field);
                        }
                    }
                }
                
                return this;
            },
            //
            save:function(){
                
                this._delegateChanges.apply(this,Array.prototype.slice.call(arguments,0));
                
                return this;
            },
            handle:function($item,value){
                //
                if(utils.isString($item)){
                    $item=this.fields[$item]||getFieldName($item);
                    $item=this.$el.find($item);
                }
                
                return handleValue.call(this,$item,value);
            },
            val:function(field){
                var data=this.get(field);
                //only one field,return the value
                if(utils.isString(field)){
                    
                    return data[field];
                }
                
                //more fields,return data object
                return data;
            },
            //
            _delegateChanges:function(data,fields){
                data=data||{};
                //set(key,value)
                if(typeof data === 'string'){
                    var json={};
                    json[data]=fields;
                    fields=[data];
                    data=json;
                }
                //no data
                if(!utils.toBoolean(data)){
                    
                    return [];
                }
                //set data fields
                if(fields === undefined){
                    fields=utils.keys(data);
                }
                //
                fields=handleFields.call(this,fields);
                
                //
                var changes=[];
                var handing=this.settings['...'];
                //
                for(var field in data){
                    var item=this.fields[field]||fields[field]||getFieldName(field);
                    var $item=this.$el.find(item);
                    var value=data[field];
                    var render=this.settings[field]||handing;
                    //default value
                    value=value !== undefined ? value : this.defaults[field];
                    if(render && utils.isFunction(render)){
                        value=render.call(this,$item,value,field,fields);
                    }else{
                        handleValue.call(this,$item,value);
                    }
                    //
                    if(!utils.isEqual(value,this.data[field])){
                        
                        changes.push(field);
                    }
                    
                    //cache data
                    this.data[field]=value;
                }
                
                
                return changes;
            }
        });
        //create method
        DataSet.create=function(options){
            
            return new DataSet(options);
        };
        //dataset can't to rewrite method
        DataSet.DefaultOptions=dsOptions;
        
        //namespace dataset,pm.dataset
        pm.ns('dataset');
        pm.dataset=DataSet;
        
        return DataSet;
    });
})();