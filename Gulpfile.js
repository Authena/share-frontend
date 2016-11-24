const gulp = require('gulp')
const gutil = require("gulp-util")
const babel = require("gulp-babel")
const del = require("del")
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const open = require("open")

const webpackConfig = require('./webpack.config.js')

gulp.task('clean:assets', function (cb) {
  del.sync('./assets/**')
  cb()
})

gulp.task("webpack:build", function(callback) {
  webpackConfig.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({
      chunks: ['vendor', 'app'],
      template: path.resolve('./src/template.html'),
      filename: path.resolve('./assets/index.html')
    })
  )
  webpack(webpackConfig, function(err, stats) {
    if(err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', stats.toString({
      colors: true,
    }))
    callback()
  })
})

gulp.task('webpack-dev-server', function(callback) {
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
  webpackConfig.entry.app.push(
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server'
  )
  const compiler = webpack(webpackConfig)

  new WebpackDevServer(compiler, webpackConfig.devServer).listen(3000, "localhost", function(err) {
    if(err) throw new gutil.PluginError('webpack-dev-server', err)
    const url = `http://localhost:3000${webpackConfig.devServer.publicPath}`
    gutil.log('[webpack-dev-server]', url)
    open(url)
    callback()
  })
})

gulp.task('webpack', ['clean:assets', 'webpack:build'])
gulp.task("default", ["webpack-dev-server"])
