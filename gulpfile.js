const chalk = require('chalk');
const del = require('del');
const peg = require('pegjs');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

function compile(grammar) {
  return peg.generate(grammar, {
    output: 'source',
    format: 'commonjs'
  });
}

function parse(rle) {
  console.log(chalk.dim(this.fname));

  const parser = require('./build/parsers/rle.js');
  const results = parser.parse(rle);

  const pattern = {};
  const comments = [];

  results
    .filter(result => {
      if (result.type === 'comment') {
        comments.push(result.value);
        return false;
      } else {
        return true;
      }
    })
    .forEach(result => {
      pattern[result.type] = result.value || result;
    });

  pattern.name = pattern.name || this.fname;
  pattern.comments = comments;
  pattern.width = pattern.header.x;
  pattern.height = pattern.header.y;
  pattern.rules = pattern.header.rules;

  delete pattern.header;

  pattern.cells = pattern.lines.items.map(runs => {
    const decoded = [];

    runs.forEach(run => {
      for (let i = 0; i < run[0]; i++) {
        decoded.push(run[1]);
      }
    });

    return decoded;
  });

  delete pattern.lines;

  return JSON.stringify(pattern);
}

gulp.task('clean', () => del([ 'build/**' ]));

gulp.task('download', [ 'clean' ], () => {
  return plugins.download('http://www.conwaylife.com/patterns/all.zip')
    .pipe(plugins.unzip())
    .pipe(gulp.dest('build/data'));
});

gulp.task('compile', [ 'download' ], () => {
  return gulp.src('grammars/*.pegjs')
    .pipe(plugins.change(compile))
    .pipe(plugins.rename(path => {
      path.extname = '.js';
    }))
    .pipe(gulp.dest('build/parsers'));
});

gulp.task('build', [ 'compile' ], () => {
  return gulp.src('build/data/*.rle')
    .pipe(plugins.filterSize(1000))
    .pipe(plugins.change(parse))
    .pipe(plugins.rename(path => {
      path.extname = '.json';
    }))
    .pipe(gulp.dest('build/json'));
});

gulp.task('default', [ 'build' ]);
