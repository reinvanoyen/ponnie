const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

gulp.task('build', () => {

  return browserify('index.js')
    .transform('babelify', {
      plugins: ['transform-react-jsx', {pragma: 'h'}],
      presets: ['env']
    })
    .bundle()
    .pipe( source('index.js') )
    .pipe( gulp.dest( 'build' ) )
  ;
});