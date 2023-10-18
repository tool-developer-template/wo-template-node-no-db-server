const gulp = require('gulp');
const less = require('gulp-less');
const cssmin = require('gulp-csso');
const path = require('path');
const uglify = require('gulp-uglify');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const obfuscate = require('gulp-javascript-obfuscator');
//
const replace = require('gulp-replace');

const less_src = './src/static/less/**/*.less';
const js_src = './src/static/js/**/*.js';
const copy_src = ['./src/static/assets/**/*'];
const copy_fonts_src = ['./src/static/fonts/**/*'];
const copy_css_src = ['./src/static/less/**/*.css'];
const view_src = './src/view/**/*.html';

const public_src = './app/public';
// less
gulp.task('less', async function () {
  return await gulp.src(less_src)
    .pipe(less({
      //paths: [ path.join(__dirname, 'less') ]
    }))
    .pipe(gulp.dest(`${public_src}/css`));
});
gulp.task('cssmin', function (done) {
  //
  gulp.src(less_src)
    .pipe(less({
      //paths: [ path.join(__dirname, 'less') ]
    }))
    .pipe(cssmin())
    .pipe(rev())
    .pipe(gulp.dest(`${public_src}/css`))
    .pipe(rev.manifest())
    .pipe(gulp.dest(`${public_src}/css`))
    .on('finish', () => {done()})
});

// compress js
gulp.task('compress', function (done) {
  //
  gulp.src([js_src])
    .pipe(uglify({
      mangle:true
    }))
    .pipe(obfuscate())
    .pipe(rev())
    .pipe(gulp.dest(`${public_src}/js`))
    .pipe(rev.manifest())
    .pipe(gulp.dest(`${public_src}/js`))
    .on('finish', () => {done()})
  ;
});

// copy fonts
gulp.task('copy', async function () {
  //
  return await gulp.src(copy_src)
    .pipe(gulp.dest(`${public_src}/assets/`))
});
gulp.task('copy-fonts', async function () {
  //
  return await gulp.src(copy_fonts_src)
    .pipe(gulp.dest(`${public_src}/fonts/`))
});
gulp.task('copy-css', async function () {
  //
  return await gulp.src(copy_css_src)
    .pipe(gulp.dest(`${public_src}/css/`))
});
// copy js
gulp.task('copy-js', async function () {
  //
  return await gulp.src(js_src)
    .pipe(gulp.dest(`${public_src}/js/`));
});

gulp.task('copy-view', async function () {
  
  //
  return await gulp.src(view_src)
    .pipe(gulp.dest(`./app/view/`));
});

gulp.task('revHtml', async function (done) {
  //
  const globalPath = require('./config/global.js');
  //
  gulp.src([`${public_src}/**/*.json`,view_src])
    .pipe(replace(/\{\{\s*?([^\s]+)\s*?\}\}/g,function(match,current){
      const filePath = globalPath[current];
      if(filePath){
        //
        return filePath;
      }
      //
      return match;
    }))
    .pipe(revCollector({
      replaceReved: true,
      dirReplacements:{
        '/static/js':'/static/js',
        '/static/css':'/static/css',
        '/static/less':'/static/less'
      },
    }))
    .pipe(gulp.dest('./app/view'))
    .on('finish', () => {done()});
});

// js配置文件处理
gulp.task('config-alias',function(){
  const manifest = require('./app/public/js/rev-manifest.json');
  //
  return gulp.src(`${public_src}/js/config-*.js`)
    .pipe(replace(/("|')\{[\w-\.]+\}\/[\w-\.]+\1/g,function(match){
      const current = match.replace(/\{|\}/g,'').replace(/'|"/g,'');
      const file = manifest[current + '.js'];
      if(file){
        //
        return `'${file.replace(/\.js$/,'')}'`;
      }
      //
      return match;
    }))
    .pipe(gulp.dest(`${public_src}/js/`))
})

// watch
gulp.task('watch',function () {
  // watch less
  gulp.watch(less_src, { ignoreInitial: false },gulp.series('less'));
  // watch js
  // gulp.watch(js_src, { ignoreInitial: false },gulp.series('compress'));
  gulp.watch(js_src, { ignoreInitial: false },gulp.series('copy-js'))
  //
  gulp.watch(view_src, { ignoreInitial: false },gulp.series('copy-view'))
  // copy
  gulp.watch(copy_src, { ignoreInitial: false },gulp.series('copy'))
  // copy fonts
  gulp.watch(copy_fonts_src, { ignoreInitial: false },gulp.series('copy-fonts'))
  // copy css
  gulp.watch(copy_css_src, { ignoreInitial: false },gulp.series('copy-css'))
});

// default
gulp.task('build',gulp.series('copy','copy-fonts','copy-css','cssmin','compress','revHtml','config-alias'))
gulp.task('dev',gulp.parallel('copy','copy-fonts','copy-css','less','watch'))
gulp.task('default',gulp.parallel('copy','copy-fonts','copy-css','less','compress','watch'))