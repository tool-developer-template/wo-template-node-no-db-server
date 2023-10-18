/*
 *
 *
 *
 * @desc

 */
(function () {
    if (module.declare === undefined) {

        throw 'There is no global module.declare method!';
    }

    var $global = module.globals('$');
    //
    module.declare('pm.mobi', [$global, 'pm', 'pm.view', 'os'], function (require) {
        var $ = require($global);
        var pm = require('pm');
        var view = pm.ns('view');
        var os = require('os');

        //
        var startPath = window.location.pathname;

        //
        var doc = window.document;
        var docEl = doc.documentElement;


        var view_attr = {
            'header': true,
            'footer': true,
            'loading': true,
            'destroy': false,
            'content': '',
            'title': '',
            'history': '',
            'direction': '',
            'data': ''
        };
        var regx = {
            html: /^<.+>$/,
            path: /(?:\/){2,}/g
        };

        //can't to support pushState
        if (!('pushState' in window.history)) {
            window.history['pushState'] = function () {
            };
            window.history['replaceState'] = function () {
            }
        }

        //path name normalize
        function normalize(pathname) {
            //
            return pathname.replace(regx.path, '/')
        }

        //
        // History Class
        //
        function History(options) {
            if (History.history) {

                return History.history;
            }
            //console.log(options);
            this.baseURI = options.baseURI;
            this.timestamp = options.timestamp;
            //route view map
            History.routeView = options.routeView || false;
            //
            History.routeBaseURI = options.routeBaseURI || '';
            this.init(options.el, options.title, options.state);

            History.history = this;
        };
        History.prototype = {
            init: function (el, title, state) {
                if (!history.state) {

                    this.replaceState(el, title, state);
                } else {

                    this.pushState(el, title, state);
                }
            },
            handleState: function (el, title, his, handle) {
                //
                var search = window.location.search;
                //set route view
                if (History.routeView) {
                    var view = el.replace('#', '');
                    var base = History.routeBaseURI || '/';
                    view = History.routeView[view] || History.routeView[el];
                    //
                    search = [base, (view || el.replace('#view_item_', ''))].join('/');
                }
                //set timestamp
                if (this.timestamp) {
                    search = search || '';
                    var reg = new RegExp('(?:\\?|&)timestamp\=\\d+');
                    search = search.replace(reg, '');
                    if (search) {
                        search = [search, '&', this.timestamp, '=', new Date().getTime()].join('');
                    } else {
                        search = ['?', this.timestamp, '=', new Date().getTime()].join('');
                    }
                }
                //
                if (his) {
                    his = his.split(':');
                    handle = his[0];
                    his = his.length > 1 ? his[1] : '';
                    if (!/^\//.test(his)) {
                        his = '/' + his;
                    }
                }
                //replace // to /
                search = normalize(search);
                //
                var hash = History.routeView ? '' : '/' + el;
                var uri = normalize([his || this.baseURI, search, hash].join(''));
                var title = title || document.title;
                var options = {
                    el: el,
                    //title:title,
                    uri: uri
                };
                //
                handle = handle || 'push';
                handle = handle + 'State';

                window.history[handle] && window.history[handle](options, title, uri);
                document.title = title;
            },
            replaceState: function (el, title, state) {
                //
                return this.handleState(el, title, state, 'replace');
            },
            pushState: function (el, title, state) {
                //
                return this.handleState(el, title, state, 'push');
            }
        };

        //
        // MobiView Class
        //
        function MobiView(options) {
            var $views = $('[data-role="views"]');
            if (!$views.length) {

                return console.log('there is must be a views el,data-role="views" setting');
            }
            //
            MobiView.setOptions(options);
            //$views
            MobiView.$views = $views;
            //global header
            MobiView.$gheader = $('[data-role="views"] > [data-role="global-header"]');
            //global footer
            MobiView.$gfooter = $('[data-role="views"] > [data-role="global-footer"]');
            //
            MobiView.init($views);
        };

        //options
        MobiView.setOptions = function (options) {
            options = options || {};

            //extend deep is true
            options = $.extend(true, options, MobiView.options || {});
            //
            MobiView.options = options;

            //baseURI
            MobiView.baseURI = startPath;
            //z-index
            MobiView.zIndex = options.zIndex || 100;
            //normal width for rem
            MobiView.normalWidth = options.normalWidth || 640;
            //max normal width for rem
            MobiView.normalMaxWidth = options.normalMaxWidth || 768;
            //min normal width for rem
            MobiView.normalMinWidth = options.normalMinWidth || 320;
            //normal px
            MobiView.basePX = options.normalPx || 100;

            //history go
            MobiView.historyGoIndex = 0;
            //history options
            MobiView.historyOptions = {};
            //history timestamp
            var historyTimeStamp = options.historyTimeStamp;
            if (historyTimeStamp === true) {
                historyTimeStamp = 't';
            }
            MobiView.historyTimeStamp = !historyTimeStamp ? '' : historyTimeStamp;

            //duration
            MobiView.translateDuration = parseInt(options.duration || 400);
            //direction
            MobiView.translateDirection = options.direction || 'left';
            //view_attr['direction']=MobiView.translateDirection;
            //translate offset
            //for some android browser,have header 60px
            MobiView.translateOffset = options.translateOffset || 60;
            //translateDelay
            //can't be set 0,advice number 3-10,default 3
            MobiView.translateDelay = options.translateDelay || 1;
            //
            MobiView.directions = options.directions || {
                    left: 'left',
                    right: 'right',
                    up: 'up',
                    down: 'down'
                };
            MobiView.opposites = options.opposites || {
                    left: 'right',
                    right: 'left',
                    up: 'down',
                    down: 'up'
                };
            //
            MobiView.globalBeforeCallback = options.globalBeforeCallback;
            //
            MobiView.globalAfterCallback = options.globalAfterCallback;
            //
            MobiView.markup = options.markup || 'div';
            //
            History.routeView = History.routeView || options.routeView;
            History.routeBaseURI = History.routeBaseURI || options.routeBaseURI || '';
        };

        //init
        MobiView.init = function () {
            //mobi view cache
            MobiView.ViewCache = {};
            //init view width and height
            MobiView.viewWH();

            //
            MobiView.initView();
            //
            MobiView.setRem();
            //
            MobiView.eventListener();
        };
        MobiView.getDPR = function () {
            var devicePixelRatio = window.devicePixelRatio;
            if (os.ios) {
                if (devicePixelRatio >= 3) {

                    return 3;
                }
                if (devicePixelRatio >= 2) {

                    return 2;
                }
            }

            return 1;
        };
        MobiView.setRem = function () {
            if (!MobiView.options.setRem) {

                return;
            }
            if (typeof MobiView.options.setRem === 'function') {

                return MobiView.options.setRem();
            }
            //var width=docEl.getBoundingClientRect().width;
            //portrait
            var width = MobiView.viewHeight;
            var orientation = window.orientation;

            //landscape,or in desktop
            if (orientation === 90 || orientation === -90 || orientation === undefined) {
                width = MobiView.viewWidth;
            }

            if (width < MobiView.normalMinWidth) {
                width = MobiView.normalMinWidth;
            }
            if (width > MobiView.normalMaxWidth) {
                width = MobiView.normalMaxWidth;
            }

            var rem = parseFloat(width * MobiView.basePX / MobiView.normalWidth).toFixed(2);
            //
            docEl.style.fontSize = rem + 'px';

            MobiView.REM = rem;
        };
        MobiView.initView = function () {
            var $views = MobiView.$views;
            var $view = $views.find('[data-role="view"]');
            var $actived = $views.find('[data-role="view"][data-actived]');
            $actived.removeAttr('data-actived');
            //last set data-actived attribute
            //or last data-role="view"
            $actived = $actived.length ? $actived.eq($actived.length - 1) : $view.eq($view.length - 1);
            //only allow a actived
            $actived.attr('data-actived', true);

            var actived = '#' + $actived.attr('id');
            var state = $(actived).attr('data-history');
            //$view,like data-role="view"
            $view.each(function () {
                var $item = $(this);
                var el = $item.attr('id');
                el = '#' + el;//only id
                var v = view.create({
                    $view: $item,
                    el: el,
                    mobis: {
                        el: el
                    }
                });
                //get mobi data
                MobiView.getMobis($item, v.mobis);
                //create mobi view
                MobiView.createMobiView(v);
            });

            //mobi container
            var $mobiView = $('[data-mobi="container"]');
            if (!$mobiView.length) {
                $mobiView = $('<div data-mobi="container"></div>')
                    .appendTo($('body'));
            }
            $mobiView.attr('data-role', 'views');
            //
            MobiView.$mobiView = $mobiView;

            //current mobi view
            //save active view info
            //el,like #id
            //history,like "push" or "replace",default push
            MobiView.activeView = {
                el: actived
            };

            //MobiView.pushState(actived,document.title,activeView.mobis);
            MobiView.history = new History({
                baseURI: MobiView.baseURI,
                el: actived,
                title: document.title,
                timestamp: MobiView.historyTimeStamp,
                //routeView:MobiView.options.routeView,
                //routeBaseURI:MobiView.options.routeBaseURI||'',
                state: state
            });
            //
            MobiView.loadToMobi(actived);
            //
            //remove loading
            $actived.find('[data-role="loading"]').remove();
        };
        //event listener
        MobiView.eventListener = function () {
            //
            var $mobiView = MobiView.$mobiView;
            //catch A tag click event
            var touchevent = $mobiView.tap ? 'tap' : 'click';
            //var touchevent=$mobiView.tap ? 'touchstart' : 'click';
            //document.addEventListener('click',MobiView.checkAnchorClick);
            $mobiView.on(touchevent, MobiView.checkAnchorClick);
            //$views.touchon(MobiView.checkAnchorClick);
            //popstate event
            window.addEventListener('popstate', function (data) {
                if (!data.state) {

                    return;
                }
                //
                return MobiView.goBack(data.state);
            }, false);
            //orientation change event
            window.addEventListener('orientationchange', function () {

                MobiView.setRem();
            });
        };
        //
        MobiView.loadToMobi = function (el) {
            if (!el) {

                return console.log('there is must be a view el');
            }
            var view = MobiView.getMobiView(el);
            if (!view.el) {

                return console.log('there is no this view, can\'t to load it');
            }
            //set header and footer content
            MobiView.headerAndFooter(view);
            //set loading content
            MobiView.loadingHandle(view);
            //
            var $view = MobiView.$views.find(el);

            MobiView.$mobiView
                .append($view);

            return view;
        };

        //
        //get document.body client width and client height
        //set MobiView.viewWidth
        //set MobiView.viewHeight
        MobiView.viewWH = function () {
            //var width=document.body.clientWidth;
            //var height=document.body.clientHeight;
            var cr = docEl.getBoundingClientRect();
            var width = cr.width;
            var height = cr.height;
            var orientation = window.orientation;
            //landscape
            if (orientation === 90 || orientation === -90 || orientation === undefined) {
                //view width
                MobiView.viewWidth = width;
                //view height
                MobiView.viewHeight = height;
            } else {
                //view width
                MobiView.viewWidth = height;
                //view height
                MobiView.viewHeight = width;
            }
            //translate offset width
            MobiView.translateWidth = (MobiView.viewWidth + MobiView.translateOffset);
            MobiView.translateHeight = (MobiView.viewHeight + MobiView.translateOffset);

            return this;
        };
        //
        //get $view,data-* attribute
        //return mobis
        MobiView.getMobis = function ($view, mobis) {
            //get and save dom view attribute info
            for (var attr in view_attr) {
                var val = $view.attr('data-' + attr);
                //"":true
                //"false":false
                //null:default value,view_attr[attr]
                //other:val
                //val=val === "" ? true : val;
                val = val === 'false' ? false : val || view_attr[attr];
                //val=val === null ? view_attr[attr] : val;
                mobis[attr] = val;
            }

            return mobis;
        };
        //
        //view.mobis,default options
        //return a view copy
        MobiView.mobisViewOptions = function (view, options) {
            options = options || {};
            for (var attr in view_attr) {
                var val = view_attr[attr];
                if (val === options[attr]) {
                    //default value,not to extend
                    delete options[attr];
                }
            }
            //copy view.mobis
            var mobis = $.extend({}, view.mobis, options);
            //copy a view
            //var v=$.extend({},view);
            view.mobis = mobis;

            return view;
        };

        //check a click event
        MobiView.checkAnchorClick = function (e) {
            var target = e.target;
            //text
            if (target.nodeType === 3) {
                target = target.parentNode;
            }
            //catch a html tag
            while (!(target === this || target.tagName === 'A')) {

                target = target && target.parentNode ? target.parentNode : this;
            }

            var $target = $(target);
            var ignore = $target.attr('data-ignore');
            //ignore
            //like set attribute,data-ignore,data-ignore="other"
            if (ignore === '' || (ignore && ignore !== 'false')) {

                return;
            }
            //go to
            //like,data-to="#view"
            if ($target.attr('data-to')) {
                //
                e.preventDefault();
                //
                if (MobiView.translating) {

                    return console.log('translating');
                }
                var to = $target.attr('data-to');
                if (!to) {

                    return;
                }
                //mobi view options
                var options = MobiView.getMobis($target, {});
                return MobiView.loadMobiView(to, options);
            }
            //go back
            //like,data-role="back"
            //like,data-role="foward"
            var role = $target.attr('data-role');
            if (role === 'back' || role === 'forward') {
                e.preventDefault();

                if (MobiView.translating) {

                    return console.log('translating');
                }

                return window.history[role] && window.history[role]();
            }
        };
        //resize
        MobiView.resize = function () {
            //MobiView.viewWH();
            //var orientation=window.orientation;
            //landscape,or in desktop
            /*if(orientation === 90 || orientation === -90 || orientation === undefined){

             return MobiView.$views.css({width:MobiView.viewWidth,height:MobiView.viewHeight});
             }

             //portrait
             return MobiView.$views.css({width:MobiView.viewHeight,height:MobiView.viewWidth});*/
        };
        //
        //mobi view is created
        //in MobiView.ViewCache,and view.mobis.created=true,return true
        //
        MobiView.created = function (el) {
            if (!el) {

                return false;
            }
            var v = MobiView.ViewCache[el] || {};
            //this mobi view can be rewritten
            if (!(v.mobis && v.mobis.created)) {

                return false;
            }

            return MobiView.ViewCache[el] || false;
        };
        //
        //is html,
        //like <div></div>
        //
        MobiView.isHtml = function (str) {

            return regx.html.test(str)
        };
        //
        //get mobis el
        //when el is a mobi view,return el.mobis.el
        MobiView.getEl = function (el) {
            if (typeof el === 'object') {
                el = el.mobis.el;
            }

            return el;
        };
        //
        //get mobi view
        //in MobiView.ViewCache will return mobi view
        //not ,return {}
        MobiView.getMobiView = function (el) {
            var el = MobiView.getEl(el);
            if (!el) {

                return {};
            }

            return MobiView.ViewCache[el] || {};
        };
        //
        //add mobi view to MobiView.ViewCache
        //when be created,return mobi view
        MobiView.createMobiView = function (view) {
            //
            var el = MobiView.getEl(view);
            if (!el) {

                return {};
            }
            var v = MobiView.created(el);
            if (v) {

                return v;
            }
            //console.log(el,view,MobiView.ViewCache);
            //console.log('create mobi view',el,view);
            //add view into cache
            MobiView.ViewCache[el] = view;
        };

        //
        //created and in dom
        //created will return com view
        //be not created will return false
        MobiView.createdInDom = function (el) {
            //
            el = MobiView.getEl(el);
            var $view = $('[data-role="views"] > [data-role="view"]' + el);
            if (!$view.length) {

                return false;
            }

            return $view;
        };
        //
        //create dom view
        MobiView.createDomView = function (options) {
            options = options || {};
            var mobis = options.mobis || {};
            var el = mobis.el;
            if (!el) {

                return console.log('there is must be a view el');
            }
            //el is in dom view
            //return mobi view
            var $view = MobiView.createdInDom(el);
            if ($view.length) {
                //after append dom view
                var v = MobiView.getMobiView(el);
                if (v.mobis.created) {

                    return v;
                }
            }
            //el='#id'
            //create $view
            var id = el.replace('#', '');
            $view = $view.length ? $view : $('<' + MobiView.markup + ' data-role="view" id="' + id + '"/>');

            //var v={};
            var v = view.create(options);
            //
            v.$view = $view;
            //
            v.mobis = v.mobis || {};
            //sign default view is created
            //v.mobis.created=true;
            //mobis el
            v.mobis.el = el;
            //mobis options
            v.mobis.options = options;
            //
            MobiView.getMobis($view, v.mobis);
            //dom view load callback before append
            //will call the mobis.load function
            var mobiLoadCallback = v.mobis.load;
            mobiLoadCallback && mobiLoadCallback.call(v, v.mobis);


            //append to dom view
            MobiView.$views.append($view);

            //create view
            //v=$.extend(v,view.create(options));
            //create mobi view,can to be rewritten
            MobiView.createMobiView(v);
            v.mobis.created = true;
            //create $content
            var $content = $view.find('[data-role="content"]');
            //$content=$content.length ? $content : (MobiView.isHtml(mobis.content) ? $(mobis.content) : $('<div data-role="content"></div>'));
            $content = $content.length ? $content : (MobiView.isHtml(mobis.content) ? $(mobis.content) : '');
            if ($content) {
                $content
                    .attr('data-role', 'content')
                    .appendTo($view);
            }

            //dom view load callback after append
            //will call the mobis.loaded function
            var mobiLoadedCallback = mobis.loaded;
            mobiLoadedCallback && mobiLoadedCallback.call(v, v.mobis);

            return v;
        };
        //
        //get html content
        MobiView.getHTMLContent = function (content) {
            //content is function
            //like ,content:function(){return '<div></div>'}
            /*if(typeof content === 'function'){
             content=content();

             //return content;
             }
             //like '<div></div>'
             if(MobiView.isHtml(content)){

             return content;
             }

             return content;*/

            return typeof content === 'function' ? content() : content;
        };
        //set header and footer
        MobiView.setHF = function (view, hf) {
            hf = hf || 'header';
            var $active = view.$view;
            var mobis = view.mobis;
            var content = mobis[hf] || '';

            if (content) {
                //
                var $hf = $active.find('[data-role="' + hf + '"]');
                //get header or footer html content
                content = MobiView.getHTMLContent(content);
                //like <div></div> ,html
                if (MobiView.isHtml(content)) {
                    //remove old header or footer
                    $hf.remove();
                    $hf = $(content);
                    $hf.attr('data-role', hf)//add data-role attribute
                }
                if (!$hf.length) {

                    $hf = hf === 'header' ? MobiView.$gheader.clone() : MobiView.$gfooter.clone();
                }
                //
                $hf.show();
                //title
                if (mobis.title) {
                    var $title = $hf.find('[data-role="title"]');
                    if ($title.length) {
                        var title = mobis.title || $title.text() || document.title || '';
                        $title.text(title);
                    }
                }
                if (hf === 'header') {
                    $active.find('[data-role="header"],[data-role="global-header"]').remove();
                    $active.find('[data-role="content"]').before($hf);
                } else {
                    $active.find('[data-role="footer"],[data-role="global-footer"]').remove();
                    $active.find('[data-role="content"]').after($hf);
                }
            }
        };
        //header and footer set
        MobiView.headerAndFooter = function (view) {
            var $view = view.$view;
            var $content = $view.find('[data-role="content"]');
            if (!$content.length) {

                return;
            }
            var $header = $view.find('[data-role="header"]');
            var $footer = $view.find('[data-role="footer"]');
            var mobis = view.mobis;
            //console.log('headerAndFooter',mobis.el,mobis.header,mobis);
            //header
            if (mobis.header) {
                MobiView.setHF(view, 'header');
            } else {
                $header.hide();
            }
            //footer
            if (mobis.footer) {
                MobiView.setHF(view, 'footer');
            } else {
                $footer.hide();
            }

            return this;
        };
        //loading handle
        MobiView.loadingHandle = function (view) {
            var mobis = view.mobis;
            var $view = view.$view;
            var $content = $view.find('[data-role="content"]');
            //loading:true,or will $.load content
            if (mobis.loading || (mobis.content && !MobiView.isHtml(mobis.content))) {
                //
                if (mobis.loading === 'background' || (mobis.content && !MobiView.isHtml(mobis.content))) {

                    $content.addClass('content-loading');

                    return this;
                }
                //
                /*if(mobis.content && !MobiView.isHtml(mobis.content)){
                 //empty content
                 $view.find('[data-role="content"]').empty();
                 }*/
                //loading
                //default use MobiView.options.loading
                var loading = mobis.loading === true ? MobiView.options.loading : mobis.loading;
                //get loading html content
                loading = MobiView.getHTMLContent(loading);
                var $loading = $(loading);
                //set loading data-role attribute
                $loading.attr('data-role', 'loading');
                //append to content zone
                $view.find('[data-role="content"]').append($loading);
            }

            return this;
        };
        //
        MobiView.appendContent = function (view, content, callback) {
            var $view = view.$view;
            var $content = $view.find('[data-role="content"]');
            if (content) {
                if ($content.length) {
                    $content.html(content);
                } else {
                    $view.html(content);
                }
            }
            $content.removeClass('content-loading');
            //
            callback && callback();
        };
        //content handle
        MobiView.contentHandle = function (view, callback) {
            var mobis = view.mobis;
            var $view = view.$view;
            var $content = $view.find('[data-role="content"]');
            //console.log(mobis.el,mobis);
            if (mobis.content) {
                //
                var content = MobiView.getHTMLContent(mobis.content);
                //
                if (MobiView.isHtml(content)) {

                    return MobiView.appendContent(view, content, callback);
                }
                //
                if (content) {
                    //for android,
                    //must to use empty method to empry content
                    //
                    return $('<div/>').load(mobis.content, function (content) {
                        //
                        return MobiView.appendContent(view, content, callback);
                    });
                }
            }
            $content.removeClass('content-loading');
            //remove loading
            $view.find('[data-role="loading"]').remove();

            callback && callback();
        };
        //
        MobiView.doAnimation = function ($fromEl, $toEl, options) {
            var direction = options.direction || 'left';

            MobiView.$mobiView.prepend($toEl);
            $toEl
                .addClass('mobi-to-view')
                .addClass(direction)
                .addClass('initial');
            MobiView.$mobiView
                .addClass('animate')
                .addClass(direction);
            var next = function () {

                options.before && options.before();

                return $toEl.removeClass('initial');
            };
            //
            setTimeout(next, 1);
            var after = function () {

                $fromEl.appendTo(MobiView.$views);
                $toEl
                    .removeClass('mobi-to-view')
                    .removeClass(direction);

                MobiView.$mobiView
                    .removeClass('animate')
                    .removeClass(direction);
                /**/
                return options.after && options.after();
            };

            return setTimeout(after, MobiView.translateDuration);
        };
        //
        MobiView.loadContent = function (el, options) {
            if (MobiView.translating) {

                return console.log('translating');
            }
            options = options || {};
            //
            el = MobiView.getEl(el);
            var v = MobiView.getMobiView(el);
            if (!v) {

                return console.log('there is no this view, can\'t to load it');
            }
            if (el && el === MobiView.activeView.el) {

                return;
            }
            var view = MobiView.createDomView(v);
            var cview = MobiView.getMobiView(MobiView.activeView.el);
            //return a view copy,mobis include options
            var nview = MobiView.mobisViewOptions(view, options);
            var mobis = nview.mobis;
            //$views
            var $views = MobiView.$views;
            //current view
            var $current = MobiView.$mobiView.find(MobiView.activeView.el);
            //active view
            var $active = nview.$view;
            //title
            /*var $title=$active.find('[data-role="title"]');
             var title=document.title||'';
             if($title.length){
             title=mobis.title||$title.text()||title||'';
             $title.text(title);
             }*/
            //set header and footer
            //MobiView.headerAndFooter(view);

            //set loading
            //MobiView.loadingHandle(view);

            //mobi view load callback
            //call mobis.preload before translation
            var mobiLoadCallback = mobis.perload;
            mobiLoadCallback && mobiLoadCallback.call(nview, nview.mobis);
            //direction
            var direction = mobis.direction || MobiView.translateDirection;
            //
            view.mobis.direction = direction;
            //go back
            if (view.mobis.directionTag === 1) {
                direction = cview.mobis.direction;
                direction = MobiView.opposites[direction];
            } else {
                //load or go forward
                direction = MobiView.directions[direction];
            }
            //
            //direction tag
            //go forward
            if (view.mobis.directionTag === 1 && cview.mobis.directionTag === 0) {

                cview.mobis.directionTag = -1;
                view.mobis.directionTag = 0;
            } else {
                //load or go back
                view.mobis.directionTag = 0;//
                cview.mobis.directionTag = 1;//
            }
            //
            MobiView.translating = true;
            //save active view info
            MobiView.activeView.el = mobis.el;
            //
            MobiView.activeView.history = mobis.history;

            return MobiView.doAnimation($current, $active, {
                direction: direction,
                before: function () {
                    MobiView.globalBeforeCallback && MobiView.globalBeforeCallback(nview, nview.mobis);
                    //ios
                    //MobiView.$mobiView.css({'overflow-x':'visible'});
                    //android
                    MobiView.$mobiView.css({'overflow': 'visible'});
                    MobiView.loadToMobi(el);
                },
                after: function () {
                    MobiView.contentHandle(nview, function () {
                        //mobi view loaded callback
                        //call mobis.perloaded,when after translation and content load complete
                        var mobiLoadedCallback = mobis.perloaded;
                        mobiLoadedCallback && mobiLoadedCallback.call(nview, nview.mobis);

                        //call global callback
                        MobiView.globalAfterCallback && MobiView.globalAfterCallback.call(nview, nview.mobis);


                        $active
                            .attr('data-actived', true);

                        MobiView.translating = false;
                        //ios
                        //MobiView.$mobiView.css({'overflow-x':'hidden'});
                        //android
                        MobiView.$mobiView.css({'overflow': 'hidden'});

                        //empty mobi view history options
                        MobiView.historyOptions = {};

                        //console.log(MobiView.ViewCache);

                        var destroy = cview.mobis.destroy;
                        var $cview = cview.$view;
                        if (destroy === 'view') {

                            return $cview.empty();
                        }
                        var $ncontent = $cview.find('[data-role="content"]');
                        if (destroy === 'content' || destroy === true) {

                            return $ncontent.empty();
                        }
                        if (destroy === 'remove') {

                            return $ncontent.remove();
                        }
                    });
                }
            });
        };
        MobiView.loadMobiView = function (el, options) {
            //
            var v = MobiView.getMobiView(el);
            if (!v.el) {

                return console.log('load a view ,must be an el setting');
            }
            //for load mobi view,direction tag as 0
            v.mobis.directionTag = 0;
            //
            MobiView.loadContent(el, options);
            var mobis = v.mobis;
            var his = mobis.history || 'push';
            if (his === 'nochange') {

                return;
            }
            //
            MobiView.history.handleState(el, mobis.title, his);
        };
        //load goback mobi view
        MobiView.loadMobiBackView = function (options) {
            options = options || {};
            var el = options.el;

            var v = MobiView.getMobiView(el);
            var cv = MobiView.getMobiView(MobiView.activeView.el);
            var mobis = cv.mobis || {};
            var goback = mobis.goback;
            var reload = mobis.reload;
            var goforward = mobis.goforward;
            var index = MobiView.historyGoIndex;
            //go back
            if (goback === 'disabled' && v.mobis.directionTag === 1) {
                index = index ? -index : 1;

                history.go(index);

                return MobiView.historyGoIndex = 0;
            }
            //go forward
            if (goforward === 'disabled' && v.mobis.directionTag === -1) {
                index = index ? -index : -1;

                history.go(index);

                return MobiView.historyGoIndex = 0;
            }

            var opts = {};
            //custom goback
            if (goback && typeof goback === 'function' && v.mobis.directionTag === 1) {

                opts = goback.call(cv, options, mobis);
            }
            //custom goforward
            if (goforward && typeof goforward === 'function' && v.mobis.directionTag === -1) {

                opts = goforward.call(cv, options, mobis);
            }
            //
            if (reload && !v.mobis.directionTag && options.el === mobis.el) {
                //
                if (typeof reload === 'function') {

                    return reload.call(cv, options, mobis);
                } else if (options.uri) {

                    return location.reload();
                }
            }
            options = $.extend(options, MobiView.historyOptions, opts);
            //
            MobiView.loadContent(el, options);
        };
        //
        MobiView.goBack = function (options) {
            options = options || {};

            if (MobiView.translating) {

                return console.log('translating');
            }


            return MobiView.loadMobiBackView(options);
        };
        //
        // Mobi Class
        //
        function Mobi(options) {
            //single instance mode
            if (Mobi.mobi) {
                //extend more options to set
                MobiView.setOptions(options);
                //
                return Mobi.mobi;
            }

            //init mobi view
            new MobiView(options);

            Mobi.mobi = this;

            return this;
        };
        Mobi.prototype = {
            view: function (options) {
                options = options || {};
                //get view,like mobi.view('#view');
                //only view id
                if (options && typeof options === 'string') {

                    return MobiView.getMobiView(options);
                }
                var el = options.el;
                if (!el) {

                    return console.log('there is must be a view el');
                }
                var el = options.el;
                if (!el) {

                    return console.log('there is must be a view el');
                }
                var v = MobiView.created(el);
                if (v) {

                    return v;
                }
                //is created in dom
                var $view = MobiView.createdInDom(el);
                //get view or {}
                v = MobiView.getMobiView(el);
                //extend view mobis
                v.mobis = $.extend({
                    el: el,
                    created: false
                }, v.mobis || {}, options.mobis);
                //
                delete options.mobis;
                //
                v = $.extend(v, options);
                //
                if ($view && $view.length) {
                    options.mobis = v.mobis;
                    //create a view
                    v = view.create(options);
                    //
                    v.$view = $view;
                    //
                    v.mobis = v.mobis || {};
                    //mobis el
                    v.mobis.el = el;
                    //mobis options
                    v.mobis.options = options;
                    //create a mobi view,can not to be rewritten
                    MobiView.createMobiView(v);
                    //sign default view is created
                    v.mobis.created = true;

                    return this;
                }
                //
                MobiView.createMobiView(v);

                return this;
            },
            load: function (el, options) {
                //
                el = MobiView.getEl(el);

                if (!el) {

                    return console.log('load a view ,must be an el setting');
                }

                return MobiView.loadMobiView(el, options);
            },
            go: function (index, options) {
                index = parseInt(index);
                if (index) {
                    //
                    MobiView.historyOptions = options || {};
                    //
                    MobiView.historyGoIndex = index;
                    //
                    window.history.go(index);
                }

                return this;
            },
            goback: function (options) {
                MobiView.historyOptions = options || {};
                //MobiView.historyGoIndex=-1;
                //call window history back method
                window.history.back();

                return this;
            },
            goforward: function (options) {
                MobiView.historyOptions = options || {};
                //MobiView.historyGoIndex=1;
                //call window history forward method
                window.history.forward();

                return this;
            }
        };

        return Mobi;
    });
})();
