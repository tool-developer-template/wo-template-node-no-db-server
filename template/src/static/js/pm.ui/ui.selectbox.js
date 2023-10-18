/*
 * ui.selectbox
 * api:
        load:function(options){}//
 * sample:
        html:
            <a class="selectbox">
                <input type="text"/>
                <select>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            </a>
        
        css:
            <link type="text/css" rel="stylesheet" href="./stylesheets/ui.selectbox.css"/>
        
        js:
            var selectbox=require('ui.selectbox');
            selectbox.load({
                el:'.selectbox',
                callback:function($target){//click callback
                    console.dir(this);
                    
                }
            });
            
*/        
(function(){
    if (module.declare === undefined) {
        
        throw 'There is no global module.declare method!';
    }
    var $name=module.globals('$');
    
    module.declare('ui.selectbox',[$name],function(require){
        var $=require($name);
        
        function SelectBox(options){
            options=options||{};
            var $el=$(options.el);
            if(!$el.length){
                
                return;
            }
            
            this.$el=$el;
            this.$select=this.$el.find('select');
            this.$input=this.$el.find('input');
            this.change=options.change||'';
            
            this.value(this.$select.val());
            
            var _this=this;
            this.$select.change(function(){
                
                _this.value(this.value);
                _this.change && _this.change.call(_this);
            });
        };
        SelectBox.prototype={
            value:function(value){
                if(value === undefined){
                    
                    return this.$select.val();
                }
                var value=this.$select.find('option:checked').text();
                this.$input.val(value);
            },
            text:function(value){
                if(value === undefined){
                    
                    return this.$input.val();
                }
                
                this.$input.val(value);
            }
        };
        return {
            load:function(options){
                
                return new SelectBox(options);
            }
        };
    });
})();