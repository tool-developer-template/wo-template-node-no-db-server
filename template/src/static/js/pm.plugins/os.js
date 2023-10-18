/*
 * @name Operating System
 * @desc
Currently  is only to userAgent
 */
(function () {
    if (module.declare === undefined) {
        throw 'There is no global module.declare method!';
    }
    /**
 * 规则处理
 */
    let DefaultRules = {
        //
        mobile: /mobile\/\d+/,
        //
        pad: /ipad|touchpad|tablet\sos/,
        //

        // maxthon:/maxthon/,
        // theword:/the\sword/,
        firefox: {
            alias: 'mozilla',
            regex: /firefox\/([\d.]+)/,
            browser: true
        },
        chrome: {
            regex: /(?:chrome|crios)\/([\d.]+)/,
            browser: true
        },
        safari: {
            regex: /version\/([\d.]+).*?\ssafari/,
            browser: true
        },
        opera: {
            regex: /(?:opera|opr)(?:.*version|)\/([\d.]+)/,
            browser: true
        },
        msie: {
            alias: 'ie',
            regex: /(?:msie\s|trident.*?\srv:)([\d.]+)/,
            browser: true
        },
        edge: {
            regex: /edge?\/([\d.]+)/
        },
        qq: {
            regex: /m?qq(?:browser)?\/([\d.]+)/,
            browser: /m?qq(?:browser)\/([\d.]+)/,
            filter: ['safari'],
            client: /qq\/([\d.]+)/,
        },
        /*wos:{
          regex:/wosbrowser\/([\d.]+)/,
          browser:true,
          filter:['safari']
        },
        dolfin: {
          regex:/dolfin(?:.*version|)\/([\d.]+)/,
          browser:true
        }, //
        silk: {
          regex:/silk(?:.*version|)\/([\d.]+)/,
          browser:true
        }, //
        */
        uc: {
            regex: /(?:uc)(?:web|browser)(?:.*version|\/)?([\d.]+)/,
            browser: true,
            mobile: true
        }, //
        /*taobao: {
          regex:/(?:tao|taobao)browser(?:.*version|)\/([\d.]+)/,
          browser:true
        },*/
        liebao: {
            regex: /(?:lb)browser(?:.*? rv:([\d.]+)|)/,
            browser: true
        },
        /*ng:{
          regex:/browserng\/([\d.]+)/,
          browser:true
        },*/

        //
        micromessenger: {
            regex: /micromessenger\/([\d.]+)/,
            alias: 'webchat',
            devtools: 'wechatdevtools',
            desktop: 'windowswechat'
        },

        //engine
        webkit: {
            regex: /webkit\/(?:[\d.]+)/,
            engine: true
        },
        gecko: {
            regex: /gecko\/(?:[\d.]+)/,
            engine: true
        },
        // opera
        presto: {
            regex: /presto\/(?:[\d.]+)/,
            engine: true
        }, //
        trident: {
            regex: /trident\/(?:[\d.]+)/,
            engine: true
        },
        //
        mac: {
            regex: /(?:mac os x)\s+([\w.]+)/,
            device: true
        }, //
        windows: {
            regex: /(?:windows\snt)\s+([\d.]+)/,
            device: true
        }, //
        linux: {
            regex: /linux/,
            device: true
        },
        chromeos: {
            regex: /cromeos/,
            device: true
        },
        //
        ios: /(i(?:pad|phone|pod))(?:.*)cpu(?: i(?:pad|phone|pod))? os (\d+(?:[\.|_]\d+){1,})/,
        android: {
            regex: /(?:android)\s+([\d.]+)/,
            device: true,
            mobile: true
        },
        windowsphone: {
            regex: /windows\sphone\sos\s([\d.]+)/,
            device: true,
            mobile: true
        }, //
        ipad: {
            regex: /(?:ipad).*os\s([\d_]+)/,
            device: true,
            mobile: true
        },
        iphone: {
            regex: /(?:iphone\sos)\s(\w+)/,
            device: true,
            major: true,
            mobile: true
        },
        ipod: {
            regex: /(?:ipod)(?:.*)cpu(?: iphone)?\sos\s(\w+)/,
            device: true,
            mobile: true
        },
        touchpad: {
            regex: /touchpad\/([\d.]+)/,
            device: true,
            mobile: true
        },
        blackberry: {
            regex: /(?:playbook|blackberry|bb).*?(?:tablet\sos)?\s?([\d.]+)/,
            device: true,
            mobile: true,
            //filter:['safari']
        },
        /*rimtablet:{
          regex: /rimtablet/,
          device:true,
          mobile:true
        }, //
        bada: {
          regex:/bada/,
          device:true,
          mobile:true
        }, //
        hpw: {
          alias:'hp',
          regex:/(?:webos|hpwos)[\s\/]([\d.]+)/,
          device:true,
          mobile:true
        },*/
        /*symbian:{
          regex:/symbianos\/([\d.]+)/,
          device:true,
          mobile:true
        },*/

    }



    function UserAgent(ua) {
        //
        ua = (ua || navigator.userAgent).toLowerCase();
        const res = {};

        //
        function handle(rule) {
            //
            if (rule instanceof RegExp) {
                if (rule.test(ua)) {
                    //
                    return true;
                }
            } else if (typeof rule === 'string') {
                //
                return ua.indexOf(rule) !== -1;
            }
            //
            return !!rule;
        }
        //
        function handleVersion(name, value) {
            //
            if (value) {
                const version = value.replace(/_/g, '.');
                const [major, minor, patch] = version.split('.');
                //
                return {
                    name,
                    version,
                    major: parseInt(major),
                    minor: minor !== undefined ? parseInt(minor) : minor,
                    patch: patch !== undefined ? parseInt(patch) : patch
                }
            }
            return {
                name
            }
        }

        function handleRule(key, rule, r) {
            //
            r = rule instanceof RegExp ? rule.exec(ua) : r;
            if (r) {
                //
                return handleVersion(key, r[1])
            }
        }
        //
        const keys = Object.keys(DefaultRules);
        const correction = [];
        keys.forEach((key) => {
            //
            let rule = DefaultRules[key];
            // [rule]:/regex/
            if (rule instanceof RegExp) {
                //
                rule = {
                    regex: rule
                }
            }
            //
            const { regex, browser, alias, engine, device, devtools, desktop, major, mobile, filter, client } = rule;
            //
            const r = regex.exec(ua);
            if (r) {
                const v = handleVersion(key, r[1]);
                //
                res[key] = true;
                //
                if (alias) {
                    res[alias] = true;
                }
                if (filter) {
                    correction.push(...filter);
                }

                //
                if (mobile && !res['mobile']) {
                    //
                    res['mobile'] = true;
                }

                // iphone6 = true
                if (major && r[1]) {
                    //
                    const { name, major } = v;
                    //
                    res[[name, major].join('')] = true;
                }
                // [iphone-version] = 6.0.1
                if (r[1]) {
                    //
                    const { name, version } = v;
                    //
                    res[[name, 'version'].join('-')] = version
                }
            }
            // {chrome:true,version:'79.0.1',major:79,minor:0,patch:1}
            if (browser) {
                const t = handleRule(key, browser, r);
                if (t) {
                    //
                    res['browser'] = t
                }
            }
            // client
            if (client) {
                const t = handleRule(key, client, r);
                if (t) {
                    //
                    res['client'] = t
                }
            }
            // {iphone:true,device:'iphone',version:'9.0.1',major:9,minor:0,patch:1}
            if (device) {
                const t = handleRule(key, device, r);
                if (t) {
                    //
                    res['device'] = t
                }
            }
            // {webkit:true,engine:'webkit'}
            if (engine) {
                const t = handleRule(key, engine, r);
                if (t) {
                    //
                    res['engine'] = t.name
                }
            }
            // devtools = true
            if (devtools) {
                //
                const r = handle(devtools);
                if (r) {
                    //
                    res['devtools'] = r;
                }
            }
            // desktop = true
            if (desktop) {
                //
                const r = handle(desktop);
                if (r) {
                    //
                    res['desktop'] = r;
                }
            }
        })
        //
        if (!res.mobile) {
            //
            res.desktop = true;
        }

        // 数据修正处理
        correction.forEach(rule => {
            //
            delete res[rule];
            delete res[[rule, 'version'].join('-')];
        })
        //
        if (res.trident) {
            //
            res['msie'] = res['msie'] || true;
            res['ie'] = res['ie'] || true;
            res['browser'] = res['browser'] || {};
            res['browser']['name'] = res['browser']['name'] || 'msie';
        } else if (res.msie) {
            //
            res['trident'] = true;
            res['engine'] = 'trident';
        }
        //
        var DOMWindow = DOMWindow || {};
        if (DOMWindow && DOMWindow.UCNewsJSController) {
            res['uc'] = true;
            res['browser'] = 'uc';
        }

        //
        return res;
    }
    /**
     * 自定义规则处理
     * 
     * {
     *  micromessager:{
     *    micromessager:/micromessenger\/([\d.]+)/,
     *    devtools:'wechatdevtools'
     *  }
     * }
     * @param {*} rules 
     */
    UserAgent.custom = (rules) => {
        //
        DefaultRules = {
            ...DefaultRules,
            ...(rules || {}),
        }
    }
    //define os module
    module.declare('os', function (require, exports, module) {
        //
        return new UserAgent(navigator.userAgent);
    });
})();