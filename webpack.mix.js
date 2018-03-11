let mix = require('laravel-mix');
let LiveReloadPlugin = require('webpack-livereload-plugin');
let fs = require('fs');

mix .options({
        processCssUrls: false,
    })
    .sass('assets/src/styles/main.sass', 'assets/dist/css/')
    .sourceMaps()
    .setPublicPath('./');

mix .js('assets/src/scripts/main.js', 'assets/dist/js/main.js')
    .copyDirectory('assets/src/fonts', 'assets/dist/fonts')
    .copyDirectory('assets/src/images', 'assets/dist/images')
    .setPublicPath('./');


let getFiles = function (dir) {
    let files = [];

    fs.readdirSync(dir).forEach(file => {
        if (fs.statSync(`${dir}/${file}`).isFile()) {
            files.push(`${dir}/${file}`);
        }

        else if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            files = files.concat(getFiles(`${dir}/${file}`));
        }
    });

    return files;
};



let recJs = function (src, dest) {
    getFiles(src).forEach(file => {
        mix.js(src + file.substr(src.length), dest + file.substr(src.length));
    });
}

let recCombine = function (src, dest) {
    let files = [];
    getFiles(src).forEach(file => {
        files.push(src + file.substr(src.length));
    });

    mix.js(files, dest);
}

// recJs('assets/src/scripts/pages/', 'assets/dist/js/pages/');
recCombine('assets/src/scripts/pages/', 'assets/dist/js/pages.js');

// Full API
// mix.js(src, output);
// mix.react(src, output); <-- Identical to mix.js(), but registers React Babel compilation.
// mix.ts(src, output); <-- Requires tsconfig.json to exist in the same folder as webpack.mix.js
// mix.extract(vendorLibs);
// mix.sass(src, output);
// mix.standaloneSass('src', output); <-- Faster, but isolated from Webpack.
// mix.fastSass('src', output); <-- Alias for mix.standaloneSass().
// mix.less(src, output);
// mix.stylus(src, output);
// mix.postCss(src, output, [require('postcss-some-plugin')()]);
// mix.browserSync('my-site.dev');
// mix.combine(files, destination);
// mix.babel(files, destination); <-- Identical to mix.combine(), but also includes Babel compilation.
// mix.copy(from, to);
// mix.copyDirectory(fromDir, toDir);
// mix.minify(file);
// mix.sourceMaps(); // Enable sourcemaps
// mix.version(); // Enable versioning.
// mix.disableNotifications();
// mix.setPublicPath('path/to/public');
// mix.setResourceRoot('prefix/for/resource/locators');
// mix.autoload({}); <-- Will be passed to Webpack's ProvidePlugin.
// mix.webpackConfig({}); <-- Override webpack.config.js, without editing the file directly.
// mix.then(function () {}) <-- Will be triggered each time Webpack finishes building.
// mix.options({
//   extractVueStyles: false, // Extract .vue component styling to file, rather than inline.
//   globalVueStyles: file, // Variables file to be imported in every component.
//   processCssUrls: true, // Process/optimize relative stylesheet url()'s. Set to false, if you don't want them touched.
//   purifyCss: false, // Remove unused CSS selectors.
//   uglify: {}, // Uglify-specific options. https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
//   postCss: [] // Post-CSS options: https://github.com/postcss/postcss/blob/master/docs/plugins.md
// });
