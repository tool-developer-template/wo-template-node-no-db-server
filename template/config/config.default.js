const path = require('path');
const {STATIC_PATH} = require('./global');

// Cookie安全字符串
exports.keys = "<%= cookieKeys %>"



// view  
exports.view = {
  mapping: {
    '.tpl': 'nunjucks',
    '.html': 'nunjucks',
  },
}
// static
exports.static = {
  prefix: STATIC_PATH,
  dirs: [
    path.join(__dirname, '../app/public')
  ],
  dynamic: true, // 如果当前访问的静态资源没有缓存，则缓存静态文件，和`preload`配合使用；
  preload: false,
  maxAge: 0, // in prod env, 0 in other envs
  buffer: false, // in prod env, false in other envs
}

// config/config.default.js
exports.i18n = {
  // 默认语言，默认 "en_US"
  defaultLocale: 'en_US',
  // URL 参数，默认 "locale"
  queryField: 'locale',
  // Cookie 记录的 key, 默认："locale"
  cookieField: 'locale',
  // Cookie 的 domain 配置，默认为空，代表当前域名有效
  cookieDomain: '',
  // Cookie 默认 `1y` 一年后过期， 如果设置为 Number，则单位为 ms
  cookieMaxAge: '1y',
};
