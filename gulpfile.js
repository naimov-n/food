const fileinclude = require("gulp-file-include");

let project_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        images: project_folder + "/assets/images/",
        fonts: project_folder + "/assets/fonts/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/assets/scss/**/*.scss",
        csss: source_folder + "/assets/scss/**/*.css",
        js: source_folder + "/assets/js/**/*.js",
        images: source_folder + "/assets/images/**/*.{jpeg,jpg,svg,png,gif,ico}",
        fonts: source_folder + "/assets/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/assets/scss/**/*.scss",
        js: source_folder + "/assets/js/**/*.js",
        images: source_folder + "/assets/images/**/*.{jpeg,jpg,svg,png,gif,ico}",
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require("gulp"),
    gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    del = require("del"),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    svgSprite = require("gulp-svg-sprite");


function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })

}

function clean(params) {
    return del(path.clean)
}

function html() {
    return src(path.src.html)
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded",
            })
        )
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function csss() {
    return src(path.src.csss)
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.images)
        .pipe(dest(path.build.images))
        .pipe(src(path.src.images))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        .pipe(dest(path.build.images))
        .pipe(browsersync.stream())
}

gulp.task('svgSprite', function() {
    return gulp.src([source_folder + '/iconsorite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg",
                    example: true
                }
            }
        }))
        .pipe(dest(path.build.images))

})

function watchFile() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.js], images)
}

let build = gulp.series(clean, gulp.parallel(js, csss, css, html, images))
let watch = gulp.parallel(build, watchFile, browserSync);


exports.images = images;
exports.js = js;
exports.css = css;
exports.csss = csss;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;