'use strict';

import process from 'node:process';
import path from 'node:path';

import gulp from 'gulp';
import gulpLog from 'fancy-log';
import { deleteAsync } from 'del';
import cssnano from 'cssnano';
import sass from 'sass';

import gulpIf from 'gulp-if';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpPostcss from 'gulp-postcss';
import gulpSass from 'gulp-sass';
import gulpHtmlMin from 'gulp-html-minifier-terser';
import gulpImageMin, { optipng } from 'gulp-imagemin';

import postcssFlexbugsFixes from 'postcss-flexbugs-fixes';
import postcssPresetEnv from 'postcss-preset-env';

import { rollup } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import strip from '@rollup/plugin-strip';
import { terser } from "rollup-plugin-terser";

const compileDir = './release';
const isProd = process.env.NODE_ENV === 'production' || process.argv.indexOf('--production') > -1 || process.argv.indexOf('production') > -1;

const sourcemapsBegin = () => gulpIf(!isProd, gulpSourcemaps.init());
const sourcemapsEnd = () => gulpIf(!isProd, gulpSourcemaps.write());
const saveToDir = name => gulp.dest(path.join(compileDir, name));



function html() {
    return gulp.src('./*.html')
        .pipe(gulpHtmlMin({
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            noNewlinesBeforeTagClose: true,
            quoteCharacter: '\'',
            removeComments: isProd,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            sortAttributes: true,
            sortClassName: true,
            useShortDoctype: true
        }))
        .pipe(saveToDir('.'));
}


function css() {
    return gulp.src(['./css/**/*.css', './css/**/*.scss'])
        .pipe(sourcemapsBegin())
        .pipe(gulpIf(file => file.extname == '.scss', gulpSass(sass)()))
        .pipe(gulpPostcss([
            postcssFlexbugsFixes(),
            postcssPresetEnv({
                enableClientSidePolyfills: false
            }),
            cssnano({
                preset: ['default', { discardComments: isProd }]
            })
        ]))
        .pipe(sourcemapsEnd())
        .pipe(saveToDir('css'));
}


async function js() {
    const bundle = await rollup({
        input: './js/script.js',
        onwarn: warn => gulpLog(`rollup: ${warn.code} (${warn.message})`),
        plugins: [
            nodeResolve({
                browser: true,
            }),
            commonjs({}),
            babel({
                babelHelpers: 'bundled',
                exclude: 'node_modules/**',
                presets: [
                    ['@babel/env', {
                        ignoreBrowserslistConfig: true,
                        useBuiltIns: 'usage',
                        corejs: 3
                    }]
                ]
            }),
            strip({}),
            terser()
        ]
    });

    await bundle.write({
        file: path.join(compileDir, 'js', 'script.js'),
        format: 'iife',
        name: 'App',
        generatedCode: 'es5',
        interop: 'auto',
        sourcemap: isProd ? false : 'inline'
    });
}


function images() {
    return gulp.src('./images/**/*')
        .pipe(gulpImageMin([
            optipng({
                optimizationLevel: isProd ? 5 : 1,
                interlaced: true
            })
        ], {
            verbose: !isProd
        }))
        .pipe(saveToDir('images'));
}





async function clean() {
    gulpLog('чистим папку сборки проекта');
    await deleteAsync(compileDir + '/**/*', { force: true });
}

async function build() {
    gulpLog(`собираем проект ${isProd ? 'на продакшен' : 'на разработку'}`);
    return gulp.series(clean, gulp.parallel(html, css, js, images))();
}

function watch() {
    gulpLog('смотрим за изменениями');
    gulp.watch(['./*.html'], html);
    gulp.watch(['./css/**/*.css', './css/**/*.scss'], css);
    gulp.watch(['./js/**/*.js'], js);
    gulp.watch(['./images/**/*'], images);
}

export { clean, build, watch };
export default watch;
