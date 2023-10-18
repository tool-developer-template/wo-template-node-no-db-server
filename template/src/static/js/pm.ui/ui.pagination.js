/*
 * ui.pagination
 * api:
        load:function(options){}//
 * sample:
        html:
            <ul class="pagination">
				<li class="first"><a>&lt;&lt;</a></li>
				<li class="prev"><a>&lt;&nbsp;上一页</a></li>
				<li data-role="pagination"><a>1</a></li>
				<li data-role="pagination" class="active"><a>2</a></li>
				<li data-role="pagination"><a>3</a></li>
				<li data-role="pagination"><a>4</a></li>
				<li data-role="pagination" class="ellipsis"><a>...</a></li>
				<li data-role="pagination"><a>5</a></li>
				<li class="next"><a>&gt;</a></li>
				<li class="last"><a>&gt;&gt;</a></li>
			</ul>
        
        css:
            <link type="text/css" rel="stylesheet" href="./stylesheets/ui.pagination.css"/>
        
        js:
            var pagination=require('ui.pagination');
            pagination.load({
				el:'.pagination',
                etype:'bind',
				current:1,//current page index
				totals:21,//total page index
				pages:5,//page counts ,default 0(no pagination),if ellipsis,only odd
				//ellipsis:false,//default true
				pagination:'<li><a>{pagination}</a></li>',//pagination object
				callback:function(index){//click callback
					//
					console.log(index);
				}
			});
 */
(function(){
    if (module.declare === undefined) {
        
        throw 'There is no global module.declare method!';
    }
    var $name=module.globals('$');
    
    
    var _format={
        'ellipsis':'...',
        '...':'ellipsis'
    };
    
    module.declare('ui.pagination',[$name],function(require){
        var $=require($name);
        
        function Pagination(options){
            options=options||{};
            
            if(!options.el){
                
                return ;
            }
            this.$el=$(options.el);
            this.previous=this.current=options.current||1;
			this.pages=options.pages||5;
			this.sizes=options.sizes||0;
            this.totals=Math.ceil((options.totals||5)/this.pages);
            this.pagination=options.pagination||'<li><a>{pagination}</a></li>';
            this.callback=options.callback;
            this.etype=options.etype||'';
			
            
            //ellipsis
			this.ellipsis=options.ellipsis === false ? false : true;
			//
            this.arr=[];
            this.arr.length=this.totals;
            var i=0,
                len=this.arr.length;
            for(;i<len;i++){
                this.arr[i]=i+1;
            };
            //prev
            this.$prev=this.$el.find('>li.prev')||this.$el.find('>li.first');
            
            //
            this.pageto();
            
            var _this=this;
            var _pagenation_click=function(e){
                var $target=$(e.target),
                    $parent=$target.parent();
                  
                if($parent.hasClass('ellipsis') || $parent.hasClass('disabled') || $parent.hasClass('active')){
                    
                    return;
                }  
                if($parent.attr('data-role') === 'pagination'){//pagination
                    _this.current=parseInt($parent.text());
                    //_this.created=false;
                    
                    return _this.pageto(_this.current);
                }
                //to prev page
                if($parent.hasClass('first')){
                    
                    _this.current=1;
                    
                    return _this.pageto(_this.current);
                }
                if($parent.hasClass('prev')){
                    
                    _this.current--;
                    
                    return _this.pageto(_this.current);
                }
                
                //to next page
                if($parent.hasClass('next')){
                    
                    _this.current++;
                    
                    return _this.pageto(_this.current);
                }
                if($parent.hasClass('last')){
                    
                    _this.current=_this.totals;
                    
                    return _this.pageto(_this.current);
                }
            };
            //bind event
            if(this.etype === 'bind'){
                this.$el.bind('click',_pagenation_click);
            }else{
                this.$el[0].onclick=_pagenation_click;
            }
        };
        Pagination.prototype={
            pageto:function(){
                //remove disabled
                this.$el.find('>li').removeClass('disabled');
                
                this.created && this.callback && this.callback(this.current);
                
                if(this.current <= 1){//first
                    this.current=1;
                    this.$el.find('>li.first,>li.prev').addClass('disabled');
                }
                
                if(this.current >= this.totals){//last
                    this.current=this.totals;
                    this.$el.find('>li.last,>li.next').addClass('disabled');
                }
                //pagination object
                var $pagination=this.$el.find('>li:not(.first,.prev,.next,.last)');
                
                $pagination.removeClass('active');
                
                if(this.sizes === 0){
                    
                    return $pagination.remove();
                }
                
                this.sizes=this.sizes < 3 ? 3 : this.sizes;
                
                //totals < sizes
                if(this.totals < this.sizes){
                    if(this.created){
                        
                        return $pagination.eq(this.current-1).addClass('active');
                    }
                    //
                    return this.createEl(this.arr,$pagination);
                }
                
                //totals > sizes
                this.create($pagination);
            },
            create:function($pagination){
				var arr=[].concat(this.arr),
					offset=Math.floor(this.sizes/2),
					start=this.current-offset,
					end=!start ? this.sizes : this.current+offset;
                
                if(this.ellipsis){
					var m=start - 2,//left splice length
						n=this.totals-(end+1);//right splice length
					arr[0]=1;//arr first value
					arr[arr.length-1]=this.totals;//arr last value
                    
                    if(m > 0){
                        if(this.totals - m < this.sizes){
                            m=this.current - offset - 2;
                        }
						arr.splice(1,m,'ellipsis');
                        end=end-m+1;
					}
					if(n > 0){
						arr.splice(end,n,'ellipsis');
					}
				}else{
					var m=start - 1,//left splice length
						n=this.totals - end;//right splice length
					arr[0]=1;//arr first value
					if(m > 0){
                        if(this.totals - m < this.sizes){
                            m=this.current - offset - 2;
                        }
						arr.splice(0,m);
                        end=end-m;
					}
					if(n > 0){
						arr.splice(end,n);
					}
				}
                
                this.createEl(arr,$pagination);
            },
            createEl:function(arr,$pagination){
                var $ul=$('<ul/>'),
                    i=0,
                    len=arr.length;
                $pagination=$pagination||this.$el.find('>li:not(.first,.prev,.next,.last)');
                //empty to remove
                $pagination.remove();
                //to create by array
                for(;i<len;i++){
                    var val=arr[i]||'';
                    val=_format[val]||val;
                    var $li=$(this.pagination.replace(/{pagination}/g,val))
                        .attr('data-role','pagination')
                        .addClass(_format[val]||'')//ellipsis
                        .attr('data-index',val);
                    $ul.append($li);
                }
                var $children=$ul.children();
                //atter to
                this.$prev.after($children);
                //active
                this.$el.find('[data-index="'+this.current+'"]').addClass('active');
                
                this.created=true;
            }
        };
        
        return {
            load:function(options){
                
                return new Pagination(options);
            }
        };
    });
})();