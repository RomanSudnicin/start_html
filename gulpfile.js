var gulp            = require('gulp'),
    browserSync     = require('browser-sync'),
    autoprefixer    = require('gulp-autoprefixer'),
    svgmin          = require('gulp-svgmin'),
    imagemin        = require('gulp-imagemin'),
    newer           = require('gulp-newer'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    versionAppend   = require('gulp-version-append'),
    reload          = browserSync.reload,
    rimraf          = require('rimraf'),
    pngquant        = require('imagemin-pngquant'),
    concat          = require('gulp-concat'),
    cssmin          = require('gulp-cssmin'),
    uglify          = require('gulp-uglify'),
    rename          = require('gulp-rename'),
    sassLint        = require('gulp-sass-lint');

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html:   'build/',
        js:     'build/js/',
        css:    'build/css/',
        img:    'build/img/',
        fonts:  'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/**/*.js',//В стилях и скриптах нам понадобятся только main файлы
        sass: 'src/scss/**/style.scss',
        allsass: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/*.html',
        js: 'src/js/**/*.js',
        sass: 'src/scss/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

// HTML-BUILD
gulp.task('html:build', function () {
    return gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(versionAppend(['html', 'js', 'css'], {appendType: 'timestamp'}))
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true, once: true})); //И перезагрузим наш сервер для обновлений
});

// JS_BUILD
gulp.task('js:build', function () {
    return gulp.src(path.src.js) 
        .pipe(concat('main.js'))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true, once: true})); //И перезагрузим сервер
});

// SASS-BUILD
gulp.task('sass:build', function() {
    var supportedBrowsers = [
        '> 0.5%',
        'last 2 versions',
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.1',
        'bb >= 10'
    ];
    return gulp.src(path.src.sass)
        .pipe(sass().on('error', sass.logError)) // Using gulp-sass
        .pipe(autoprefixer({
            browsers: supportedBrowsers,
            cascade: false
        })) //Добавим вендорные префиксы
        .pipe(rename('style.min.css'))
        .pipe(cssmin({ keepSpecialComments: false, specialComments: 0 }))
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({stream: true, once: true}));
});

// SCSS-LINT

gulp.task('lint', function () {
    return gulp.src(path.src.allsass)
        .pipe(sassLint({
            files: {ignore: [path.src.sass, 'src/scss/vendor/**/*.scss']},
            configFile: 'config/.sass-lint.yml'
        }))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError())
});

// IMAGE-BUILD
gulp.task('images:build', function () {
    return gulp.src(path.src.img) //Выберем наши картинки
        .pipe(newer(path.build.img)) //Выберем только новые
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            pngquant: true,
            svgoPlugins: [{removeViewBox: false}],
            use:[pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true, once: true}));
});

// FONTS-BUILD
gulp.task('fonts:build', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

// GLUE ALL BUILDS
gulp.task('build', [
    'html:build',
    'js:build',
    'sass:build',
    'fonts:build',
    'images:build'
]);

// WATCH-TASK Отслеживаем изменения
gulp.task('watch', function(){
    gulp.watch([path.watch.html], ['html:build']);
    gulp.watch([path.watch.sass], ['sass:build']);
    gulp.watch([path.watch.js], ['js:build']);
    gulp.watch([path.watch.img], ['images:build']);
    gulp.watch([path.watch.fonts], ['fonts:build']);
});

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        },
        host: 'localhost',
        port: 9000
    });
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'serve', 'watch']);
