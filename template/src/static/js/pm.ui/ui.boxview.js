/*
 * ui.boxview
 * api:
        load:function(options){}//
 * sample:
        css:
            .boxview{margin-left:200px;margin-top:200px;}
            img{width:100px;height:100px;}
            .mask{background-color:#3a3a3a;opacity:.77;}
            
        html:
            <div class="boxview">
                <img data-href="1.jpg" src="1.jpg" data-rel="test.html"/>
            </div>
            
        js:
            var boxview=require('ui.boxview');
            boxview.load({
                el:'.boxview',
                offsetHeight:40,
                src:'data-href',
                //type:'ajax',
                //width:200,
                //height:200,
                controls:{
                    //close:true
                },
                loaded:function(){
                    
                    this.$caption && this.$caption.text((this.index+1) + '/' +this.length);
                }
            });
            
*/
 (function (){
        var $global = module.globals ('$');

        function pagesize (){
                var doc = document.documentElement,
                        ww = window.innerWidth||self.innerWidth ||  (doc && doc.clientWidth) || document.body.clientWidth,
                        hh = window.innerHeight||self.innerHeight ||  (doc && doc.clientHeight) || document.body.clientHeight;
                
                ww-=18;
                var x = window.pageXOffset || self.pageXOffset ||  (doc && doc.scrollLeft) || document.body.scrollLeft;
                var y =  window.pageYOffset || self.pageYOffset ||  (doc && doc.scrollTop) || document.body.scrollTop;

                var sw = window.innerWidth || document.body.scrollWidth || document.body.offsetWidth;
                var sh = window.innerHeight+window.scrollMaxY || document.body.scrollHeight || document.body.offsetHeight;
                var w = sw < ww ? ww : sw;
                var h = sh<hh ? hh : sh;
                w  -= 18;


                return [w,h,x,y,ww,hh];
        };
        function tonumber (val,per){
            if (typeof val  === 'number'){

                return val;
            }
            if (typeof val  === 'string'){
                per = per||100;
                //px
                if (/px$/.test (val) ){

                        return parseFloat (val); 
                }
                //.
                if (/^\./.test (val) ){

                        return parseFloat (val)*per; 
                }
                //%
                if (/%$/.test (val) ){

                        return parseFloat (val)/100*per; 
                }   
            }

            return 0;  
        }  
        // 
        module.declare ('ui.boxview',[$global],function (require){
                var $ = require ($global); 

                var _defaults = {
                        el:null,
                        width:null,
                        height:null,
                        offsetWH:200,
                        offsetWidth:0,
                        offsetHeight:0,
                        speed:500,
                        left:null,
                        top:null,
                        src:'data-href',
                        auto:false,
                        delay:true,
                        modal:true,
                        zIndex:1000,
                        controls:{
                            close:true,
                            content:true,
                            prev:true,
                            next:true,
                            caption:true,
                            zoom:true
                        },
                        renderTo:document.body,
                        tapmask:null,
                        resize:null,
                        scroll:null,
                        start:null,
                        loaded:null,
                        close:null
                };
                var viewFun = {
                    'image':'viewImage',
                    'ajax':'viewAjax'
                };
                var elFun= {
                    close:function (options){
                        options = options||{};
                        var callback = options.callback;
                        return $('<a data-role="view-close" class="view-close"></a>')
                                .click(function(){

                                     callback && callback ('close');  
                                })
                    },
                    prev:function (options){
                        options = options||{};
                        var callback = options.callback;
                        return $('<a data-role="view-prev" class="view-prev">&lt;</a>')
                                .click(function(){
                                        
                                        callback && callback ('prev');  
                                });
                    },
                    next:function (options){
                        options = options||{};
                        var callback = options.callback;
                        return $('<a data-role="view-next" class="view-next">&gt;</a>')
                                .click(function(){
                                        
                                        callback && callback ('next');  
                                });
                    },
                    caption:function (options){

                        return $('<label data-role="view-caption" class="view-caption"></label>');
                    },
                    zoom:function (options){
                        options = options||{};
                        var callback = options.callback;
                        return $('<a data-role="view-zoom" class="view-zoom in"/>')
                                .click(function(){
                                        
                                        callback && callback ('zoom');  
                                });
                    },
                    content:function (options){

                        return $('<div data-role="view-content" class="view-content"/>');
                    }     
                };
                function BoxView (options){
                        var _this = this;
                        
                        var opt = $.extend ({},_defaults,options);


                        if (!opt.el){

                                return console.log ('there is must be an el object'); 
                        }
                        _this.options = opt;
                        //
                        _this.$el = $ (opt.el);

                        _this.$object = _this.$el.find ('['+opt.src+']');

                        _this.length = _this.$object.length;
                        _this.index = 0;
                        _this.zoomed=false;

                        _this.$el.bind ('click',function (e){
                                var     target = e.target,
                                        $target = $(target);
                                if(target.getAttribute('data-ignore') !== null){
                    
                                    return;
                                }      
                                if ($target.attr (opt.src)){

                                        _this.index = _this.$object.index($target);

                                        return _this.run($target); 
                                } 
                        });
                        //resize scroll
                        $(window).bind('resize scroll',function(e){
                                var resize = _this.options.resize;
                                var scroll = _this.options.scroll;
                                
                                if (e.type === 'resize' && resize && typeof resize  === 'function' && resize.call (_this,e)){

                                    return ;
                                }
                                if (e.type === 'scroll' && scroll && typeof scroll  === 'function' && scroll.call (_this,e)){

                                    return ;
                                } 

                                _this.resize(e);
                        });
                };
                BoxView.prototype = {
                        init:function (){
                                var _this = this;
                                _this.options.start && _this.options.start.call (_this);
                                
                                _this.pagesize = pagesize ();
                                
                                //top ,left
                                _this.options.top = tonumber (_this.options.top,_this.pagesize[4]) ;
                                _this.options.left = tonumber (_this.options.left,_this.pagesize[5]) ;
                                
                                var color = 'yellow';
                                if (_this.options.modal){
                                        _this.$mask = $ ('<div  class="mask view-mask" data-role="mask"/>')
                                                .css ({
                                                        'width':_this.pagesize[0],
                                                        'height':_this.pagesize[1],
                                                        'position':'absolute',
                                                        'z-index':this.options.zIndex,
                                                        'left':'0',
                                                        'top':'0'
                                                }).click(function (){
                                                        var tapmask = _this.options.tapmask;
                                                        if (tapmask && typeof tapmask === 'function' && tapmask.call(_this) ){

                                                            return ;
                                                        } 

                                                        _this.close (); 
                                                }).appendTo ($ (this.options.renderTo) )  ; 
                                        

                                        //color 
                                        color = '#FFF';
                                }

                                //$container
                                _this.$container = $ ('<div class="view-box" data-role="viewbox" style="background-color:'+color+';"/>')
                                        .css ({
                                                'position':'absolute',
                                                'top':_this.offset.top,
                                                'left':_this.offset.left,
                                                'z-index':_this.options.zIndex+2,
                                                'width':'0',
                                                'height':'0'
                                        }).animate ({
                                                width:50,
                                                height:50,
                                                top:_this.options.top ? _this.pagesize[3]+_this.options.top : _this.pagesize[3]+Math.round(_this.pagesize[5]/2),
                                                left:_this.options.left ? _this.pagesize[2]+_this.options.left : Math.round(_this.pagesize[4]/2)
                                        }) 
                                        .appendTo ($ (_this.options.renderTo) ) ;

								if(_this.options.id){
									_this.$container.attr('id',_this.options.id);
								}
                                var controls = _this.options.controls||{};

                                for (var control in controls){
                                    var v = controls[control];

                                    if (typeof v  === 'boolean' || typeof v === 'object'){
                                        var fun = elFun[control];
                                        var options = $.extend({},v,{
                                            callback:function (control){

                                                var callback=_this[control];
                                                
                                                callback && callback.call (_this); 
                                            } 
                                        });
                                        var $v = fun && fun (options);
                                        
                                        _this['$'+control] = $v;

                                        _this.$container.append ($v);
                                        continue;
                                    }
                                     
                                    if (typeof v  === 'function'){
                                        var $v = v ();
                                        _this['$'+control] = $v;

                                        _this.$container.append ($v);
                                        continue; 
                                    }
                                }

                                //
                                if (!(_this.$content && _this.$content.length)){
                                    _this.$content = (elFun['content'])();
                                    _this.$container.append (_this.$content); 
                                } 
                               

                                //$content
                                /*_this.$content=$('<div data-role="view-content" class="view-content"/>');
                                //$close
                                _this.$close=$('<a data-role="view-close" class="view-close"></a>')
                                        .click(function(){
                                              _this.close ();  
                                        });
                                
                                //$prev
                                _this.$prev=$('<a data-role="view-prev" class="view-prev">&lt;</a>')
                                        .click(function(){
                                                
                                                _this.prev();
                                        });
                                //$next
                                _this.$next=$('<a data-role="view-next" class="view-next">&gt;</a>')
                                        .click(function(){
                                                
                                                _this.next();
                                        });
                                
                                //$caption
                                _this.$caption=$('<label data-role="view-caption" class="view-caption">1/6</label>');
                                
                                //$zoom
                                _this.$zoom=$('<a data-role="view-zoom" class="view-zoom in"/>')
                                        .click(function(){
                                                
                                                _this.zoom();
                                        });*/
                        }, 
                        run:function ($target,inited,zoomed){
                                var _this = this;
                                _this.$target=$target;
                                _this.offset = _this.$target.offset ();

                                var fun=_this[viewFun[_this.options.type||'image']];

                                !inited && _this.init ();

                                fun && fun.call(_this,$target,inited,zoomed); 
                        },
                        animate:function (t,l,w,h,callback,closed){
                                var _this = this;

                                this.$container.animate ({
                                        'left':l,
                                        'width':w
                                },this.options.speed).animate ({
                                        'top':t,
                                        'height':h
                                },this.options.speed,function (){

                                        //

                                        callback && callback (); 
                                } ); 
                        },
                        viewImage:function ($target,inited,zoomed){
                            var _this = this;
                            
                            var $img = $target.clone ().hide ().css({'position':'static'});
                            var img = new Image ();
                            
                            
                            _this.$close && _this.$close.fadeOut(0);
                            _this.$prev && _this.$prev.fadeOut(0);
                            _this.$next && _this.$next.fadeOut(0);
                            _this.$caption && _this.$caption.fadeOut(0);
                            _this.$zoom && _this.$zoom.fadeOut(0);
                            
                            _this.$container.addClass('loading');
                            
                            //disabled
                            _this.$prev && _this.$prev.removeClass('disabled');
                            _this.$next && _this.$next.removeClass('disabled');
                            if(_this.index <= 0){
                                    _this.$prev && _this.$prev.addClass('disabled');
                            }
                            if(_this.index >= _this.length -1){
                                  _this.$next && _this.$next.addClass('disabled');  
                            }
                            //image load
                            img.onload = function (){
                                    $img.attr('src',$img.attr(_this.options.src));
                                    _this.$content.html($img);
                                    
                                    var w = img.width;
                                    var h = img.height;
                                    var offsetHeight=_this.options.offsetHeight;
                                    if(!zoomed){
                                            if (w >= _this.pagesize[4]  - _this.options.offsetWH || h >= _this.pagesize[5] -_this.options.offsetWH ){
                                                    if (w >= _this.pagesize[4]  - _this.options.offsetWH){
                                                            w = _this.pagesize[4]-_this.options.offsetWH;
                                                            h = Math.round (w*img.height/img.width); 
                                                    }
                                                    if (h >= _this.pagesize[5] -_this.options.offsetWH ){
                                                            h = _this.pagesize[5]-_this.options.offsetWH;
                                                            w = Math.round (h*img.width/img.height); 
                                                    } 
                                            } 
                                    }else{
                                            if (w >= _this.pagesize[4]  - _this.options.offsetWH){
                                                    w = _this.pagesize[4]-_this.options.offsetWH;
                                                    h = Math.round (w*img.height/img.width);
                                                    
                                                    //offsetHeight+=offsetHeight;                                                        
                                            }
                                    }
                                    var top = _this.$target.attr('data-view-top') || _this.options.top||(_this.pagesize[3]+Math.round ((_this.pagesize[5]-h)/2));
                                    var left = _this.$target.attr('data-view-left') || _this.options.left || (Math.round((_this.pagesize[4]-w)/2)-18);
                                    
                                    top=top < 0 ? _this.options.offsetWH/2 : top;
                                    
                                    _this.animate (top,left,w,(h+offsetHeight),function (){
                                            //
                                            _this.$container.removeClass('loading');
                                            
                                            //
                                            _this.$container.find ('img'). css ({
                                                    'width':w,
                                                    'height':h,
                                                    'display':'block'
                                            }).fadeIn ();
                                            
                                            
                                            _this.$close && _this.$close.fadeIn(300);
                                            _this.$prev && _this.$prev.fadeIn(300);
                                            _this.$next && _this.$next.fadeIn(300);
                                            _this.$caption && _this.$caption.fadeIn(300);
                                            _this.$zoom && _this.$zoom.fadeIn(300);
                                            
                                            _this.options.loaded && _this.options.loaded.call(_this);
                                    } ); 

                                    img.onload = function (){};   
                            };
                            
                            img.src = $img.attr (_this.options.src); 
                        },
                        viewAjax:function ($target,inited,zoomed){
                            var _this = this;

                            var url = $target.attr (_this.options.src);
                            if (!url){

                                return console.log ('there is no url'); 
                            }  

                            _this.$container.addClass('loading');

                            _this.$content.load (url,function (){

                                //
                                _this.$container.removeClass('loading');
                                
                                var w =  _this.$target.attr('data-view-width') || _this.options.width;
                                var h =  _this.$target.attr('data-view-height') || _this.options.height;

                                var top =  _this.$target.attr('data-view-top') || _this.options.top || (_this.pagesize[3]+Math.round ((_this.pagesize[5]-h)/2));
                                var left =  _this.$target.attr('data-view-left') || _this.options.left || (Math.round((_this.pagesize[4]-w)/2)-18);

                                _this.animate (top,left,w,h,function (){

                                    _this.options.loaded && _this.options.loaded.call(_this);
                                }); 
                            } ); 

                        },  
                        next:function(){
                                this.index++;
                                if(this.index >= this.length){
                                        
                                        return this.index=this.length-1;
                                }
                                var $target=this.$object.eq(this.index);
                                
                                this.run($target,true,this.zoomed);
                        },
                        prev:function(){
                                this.index--;
                                if(this.index < 0){
                                        
                                        return this.index = 0;
                                }
                                var $target=this.$object.eq(this.index);
                                
                                this.run($target,true,this.zoomed);
                        },
                        zoom:function($zoom){
                                this.zoomed=!this.zoomed;
                                this.run(this.$target,true,this.zoomed); 
                                this.$zoom.toggleClass('out');
                        },
                        close:function (callback){
                                var _this = this;
                                //
                                _this.$mask && _this.$mask.unbind('click'); 
                                _this.$close && _this.$close.unbind('click').hide(0);
                                _this.$prev && _this.$prev.unbind('click').hide(0);
                                _this.$next && _this.$next.unbind('click').hide(0);
                                _this.$zoom && _this.$zoom.unbind('click').hide(0);
                                
                                var offset = _this.$target.offset (); 

                                _this.$container && _this.$container.animate ({
                                        'top':offset.top,
                                        'left':offset.left,
                                        'width':'0',
                                        'height':'0'
                                },_this.options.speed,function (){
                                        _this.$mask && _this.$mask.remove ();
                                        _this.$container && _this.$container.remove ();

                                        _this.$container = null;
                                        _this.$content = null;
                                        _this.$close = null;
                                        _this.$prev = null;
                                        _this.$next = null;
                                        _this.$caption = null;
                                        _this.$zoom = null;

                                        _this.options.closed  && _this.options.closed.call (_this);
                                        callback && callback (); 
                                } );
                        },
                        resize:function(e){
                                var _this=this;
                                _this.pagesize=pagesize();
                                
                                var w=_this.$container && _this.$container.outerWidth();
                                var h=_this.$container && _this.$container.outerHeight();
                                
                                _this.$mask && _this.$mask
                                        .css ({
                                                'width':_this.pagesize[0],
                                                'height':_this.pagesize[1]
                                        });
                                
                                if(_this.$zoom && e.type === 'scroll' && _this.$zoom.hasClass('out')){
                                   
                                        return ;
                                }
                                _this.$container && _this.$container
                                        .css({
                                                'top':_this.pagesize[3]+Math.round ((_this.pagesize[5]-h)/2),
                                                'left':Math.round((_this.pagesize[4]-w)/2)
                                        });
                        }
                };

                return {
                        load:function (options){


                                return new BoxView (options); 
                        } 
                }
        } ); 
 } )();  