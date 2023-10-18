/*
 * ui.dropdown
 * api:
        load:function(options){}//
 * sample:
        html:
            <div class="dropdown" data-role="dropdown">
                <a class="dropdown-toggle" data-role="button">1</a>
                <ul class="dropdown-list" data-role="dropdownlist">
                    <li data-role="option" data-val="1"><a>1</a></li>
                    <li data-role="option" data-val="2"><a>2</a></li>
                </ul>
            </div>
        
        css:
            <link type="text/css" rel="stylesheet" href="./stylesheets/ui.dropdown.css"/>
        
        js:
            var dropdown=require('ui.dropdown');
            dropdown.load({
                el:'.dropdown',
                callback:function($target){//click callback
                    console.dir(this);
                    this.$el.find('.dropdown-toggle').text($target.attr('data-val'));
                }
            });
            
*/        
(function(){
    if (module.declare === undefined) {
        
        throw 'There is no global module.declare method!';
    }
    var $name=module.globals('$');
    
    module.declare('ui.dropdown',[$name],function(require){
        var $=require($name);
        
        var _r_dropdown='dropdown',//role name
            _r_dropdownlist='dropdownlist',
            _r_option='option',
            _r_button='button',
            _c_open='open',//class name
            _c_dropdown='dropdown';
        
        var _outed=true;//mouse in or out
        //out click
        $(document)
            .on('click',function(e){
                if(_outed){
                    
                    return Dropdown.prototype.clear.call(null);
                }
            });
        
        function Dropdown(options){
            options=options||{};
            var $el=$(options.el);
            if(!$el.length){
                
                return;
            }
            
            this.$el=$el;
            this.$target=this.$el.eq(0);
            this.callback=options.callback||'';
            this.outclick=options.outclick||'';
            
            var _this=this;
            //click event
            this.$el
                .on('click',function(e){
                    _this.clear();
                    _this.toggle(e,this);
                })
                .mouseenter(function(){
                    
                    _outed=false;
                })
                .mouseleave(function(){
                    
                    _outed=true;
                });
        };
        Dropdown.prototype={
            clear:function(){
                $('.'+_c_dropdown+',[data-role="'+_r_dropdown+'"]').each(function(){
                    var $this=$(this);
                    $this.removeClass(_c_open);
                });
            },
            toggle:function(e,el){
                if(!e){
                    //console.dir(this.$el);
                    return this.$target.toggleClass(_c_open);
                }
                
                var target=e.target,
                    $target=$(target);
                if(target.getAttribute('data-ignore') !== null){
                    
                    return;
                }
                while(!(target === el  || target.getAttribute('data-role') === _r_button || target.getAttribute('data-role') === _r_option || target.getAttribute('data-role') === _r_dropdownlist) ){
                    
                    target=target && target.parentNode ? target.parentNode : el;
                }
                if(target.nodeType === 9){//document
                    
                    return this.hide();
                }
                $target=$(target);
                
                if(target.getAttribute('data-role') === _r_option){//options
                    
                    this.callback && this.callback.call(this,$target);
                    
                    return this.hide();
                }
                if(target.getAttribute('data-role') === _r_button){//options
                    
                    this.$target=$target.parent();
                    return this.toggle();
                }
            },
            show:function(){
                
                this.$el.addClass(_c_open);
            },
            hide:function(){
                
                this.$el.removeClass(_c_open);
            }
        };
        
        return {
            load:function(options){
                
                return new Dropdown(options);
            }
        };
    });
})();