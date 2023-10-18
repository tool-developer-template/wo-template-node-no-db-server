const path = require('path');
const {STATIC_PATH} = require('./global');

// 日志输出配置
exports.logger = {
  level: 'ERROR',
};


  // static
  exports.static = {
    prefix: STATIC_PATH,
    dirs: [
      path.join(__dirname, '../app/public')
    ],
    dynamic: true, // 如果当前访问的静态资源没有缓存，则缓存静态文件，和`preload`配合使用；
    preload: false,
    maxAge: 31536000, // in prod env, 0 in other envs
    buffer: true, // in prod env, false in other envs
  }
  