/*
* @Author: syq
* @Date:   2017-02-22 19:47:41
* @Last Modified by:   shenyanqiu
* @Last Modified time: 2017-08-12 15:55:50
*/

'use strict';
/**
 * 1.less编译 压缩 合并
 * 2.js 合并 压缩 混淆
 * 3.img复制
 * 4.html压缩
 */

// 在gulpfile中先加载gulp包，因为这个包提供API
var gulp = require('gulp');
//less
var less = require('gulp-less');
//css压缩
var cssnano = require('gulp-cssnano');
//压缩图片
var imagemin = require('gulp-imagemin');
// 深度压缩图片png
var pngquant = require('imagemin-pngquant');
// 深度压缩图片jpg 好像没什么用
var imageminJpegtran = require('imagemin-jpegtran');
// 只压缩修改的图片
var cache = require('gulp-cache');
//删除dist项目
var del = require('del');
//复制
var copy = require('copy');
//浏览器同步
var browserSync = require('browser-sync');
// 1、less编译 压缩 合并
gulp.task('style',function() {
	// 这里是执行style任务时自动
	gulp.src(['src/styles/*.less','!src/styles/_*.less'])
		.pipe(less())
		.pipe(cssnano())
		.pipe(gulp.dest('dist/styles'))
		.pipe(browserSync.reload({
		      stream: true
		    }));
});
//连接js
var concat = require('gulp-concat');
//压缩js
var uglify = require('gulp-uglify');

// 2.js 合并 压缩 混淆
gulp.task('script',function() {
	gulp.src('src/scripts/*.js')
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/scripts'))
		.pipe(browserSync.reload({
		      stream: true
		    }));
});

// 3、图片复制
gulp.task('image',function() {
	gulp.src('src/images/*.*')
		.pipe(gulp.dest('dist/images'))
		.pipe(browserSync.reload({
		      stream: true
		    }));
});

// 4、html
var htmlmin = require('gulp-htmlmin');
gulp.task('html',function() {
	gulp.src('src/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments:true
		}))
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.reload({
		      stream: true
		    }));
});

//5、图片压缩拷贝
gulp.task('imgmin', function() {
    gulp.src('src/images/*.{png,jpg,gif,ico}')
    	// //imagemin 3.0版本以下
     //    .pipe(imagemin({
     //        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
     //        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
     //        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
     //        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
     //    }))
  //       //imagemin 新版本
  //       .pipe(imagemin([
		//     imagemin.gifsicle({interlaced: true}),
		//     imagemin.jpegtran({progressive: true}),
		//     imagemin.optipng({optimizationLevel: 5}),
		//     imagemin.svgo({plugins: [{removeViewBox: true}]})
		// ]))
		//
		//深度压缩只修改的图片
		.pipe(cache(imagemin([
		    imagemin.gifsicle({interlaced: true}),
		    imagemin.jpegtran({progressive: true}),
		    imagemin.optipng({optimizationLevel: 5}),
		    imagemin.svgo({plugins: [{removeViewBox: false}]})
		],{
            use: [pngquant(),imageminJpegtran()]
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.reload({
		      stream: true
		    }));
});
//删除dist项目
gulp.task('clean',function(){
	del('dist/*');
});
//引用包复制
gulp.task('bower',function(cb){
	copy('src/*.json', 'dist',cb);
	gulp.src('src/bower_components/**/dist/*')
	.pipe(gulp.dest('dist/bower_components'));
});
//默认任务
gulp.task('default',function() {
	gulp.start('clean','style','script','imgmin','html','bower');
});
//浏览器同步任务 dist文件
gulp.task('serve',function() {
	browserSync({
		server: {
			baseDir:['dist']
		}
	}, function(err, bs) {
	    console.log(bs.options.getIn(["urls", "local"]));
	});

	gulp.watch('src/styles/*.less',['style']);
	gulp.watch('src/scripts/*.js',['script']);
	gulp.watch('src/images/*.*',['imgmin']);
	gulp.watch('src/*.html',['html']);
	gulp.watch('src/*.json',['bower']);
})