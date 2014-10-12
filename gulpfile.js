var gulp = require('gulp'),
    livereload = require('gulp-livereload');

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['routes/*', 'views/*', 'public/stylesheets/*', 'public/javascripts/*'])
  .on('change', livereload.changed);
});