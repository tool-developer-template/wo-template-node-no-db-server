/*
 * ui.tab plugin
 *
 * api:
        load:function(options){}//
 * sample:
        html:
            <ul class="nav nav-tabs">
                <li class="active" data-role="tab" data-pane="#tab1"><a>tab1</a></li>
                <li data-role="tab" data-pane="#tab2"><a>tab2</a></li>
                <li data-role="tab" data-pane="#tab3"><a>tab3</a></li>
            </ul>
            <ul class="tab-content">
                <div class="tab-pane active" data-role="pane" id="tab1"></div>
                <div class="tab-pane" data-role="pane" id="tab2"></div>
                <div class="tab-pane" data-role="pane" id="tab3"></div>
            </ul>
        
        css:
            <link type="text/css" rel="stylesheet" href="./stylesheets/ui.tab.css"/>
        
        js:
            var tab=require('ui.tab');
            tab.load({
                nav:'.nav-tabs',
                content:'.tab-content',
                callback:function(){
                    
                }
            });
 */

(function(){
    if (module.declare === undefined) {
        
        throw 'There is no global module.declare method!';
    }
    var $name=module.globals('$');
    
    module.declare('ui.tab',[$name],function(require){
        var $=require($name);
        
        function Tab(options){
            options=options||{};
            var $nav=$(options.nav),
                $content=$(options.content||'body');
            if(!$nav.length){
                
                return ;
            }
            this.$nav=$nav;
            this.$content=$content;
            
            var _this=this;
            
            this.$nav.bind('click',function(e){
                var $this=$(this),
                    target=e.target,
                    $li=$this.find('[data-role="tab"]');
                while(!(target === this  || target.getAttribute('data-role') === 'tab')){
                    
                    target=target && target.parentNode ? target.parentNode : this;
                }
                if(target.getAttribute('data-ignore') !== null){
                    
                    return;
                }
                if(target.getAttribute('data-role') !== 'tab'){
                    
                    return;
                }
                
                var $target=$(target);
                if($target.hasClass('active')){//actived
                    
                    return;
                }
                
                _this.activate($target,$li);
                //callback
                options.callback && options.callback.call(_this,$target);
            });
        };
        Tab.prototype={
            target:function(index){
                index=index||0;
                
                var $li=this.$nav.find('[data-role="tab"]');
                if(index > $li.length){
                    
                    return;
                }

                return $li.eq(index);
            },
            show:function(index){
                //
                var $target=this.target(index);
                //
                if(!$target){

                    return this;
                }
                if($target.hasClass('active')){
                    
                    return;
                }
                var $li=this.$nav.find('[data-role="tab"]');
                //
                this.activate($target,$li);

                return this;
            },
            disable:function(index){
                if(index === undefined){

                    this.$nav.find('[data-role="tab"]').attr('data-ignore',true);

                    return this;
                }
                var $target=this.target(index);
                if(!$target){

                    return this;
                }
                //
                $target.attr('data-ignore',true);

                return this;
            },
            enable:function(index){
                if(index === undefined){

                    this.$nav.find('[data-role="tab"]').removeAttr('data-ignore');

                    return this;
                }
                var $target=this.target(index);
                if(!$target){

                    return this;
                }
                //
                $target.removeAttr('data-ignore');

                return this;
            },
            activate:function($target,$li){
                $li=$li||$target.parent().find('> [data-role="tab"]');
                
                //remove active class
                $li.removeClass('active');
                //current tab active class
                $target.addClass('active');
                
                var selector=$target.attr('data-pane')||'',
                    $selector=$(selector),
                    //$pane=this.$content.find('[data-role="pane"].active')||$selector.parent().find('> .active');
                    $pane=$selector.siblings('[data-role="pane"].active')||$selector.parent().find('> .active');
                $pane.removeClass('active');
                $selector.addClass('active');

                return this;
            }
        };
        
        
        return {
            load:function(options){
                
                return new Tab(options);
            }
        };
    });
})();