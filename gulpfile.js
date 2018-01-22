const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

gulp.task('build', () => {

  return browserify('example/index.js')
    .transform('babelify', {
      presets: ['env'],
      plugins: [
          ['transform-react-jsx', {pragma: 'ponnie.vnode'}]
      ]
    })
    .bundle()
    .pipe( source('index.js') )
    .pipe( gulp.dest( 'example/build' ) )
  ;
});