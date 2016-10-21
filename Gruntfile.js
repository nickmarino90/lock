"use strict";

var fs = require("fs");
var pkg = require("./package");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    clean: {
      build: ["build/"],
      dev: ["build/"],
      dist: ["lib/"]
    },
    env: {
      build: {
        NODE_ENV: "production"
      }
    },
    exec: {
      touch_index: "touch src/index.js"
    },
    stylus: {
      build: {
        options: {
          compress: false // temp
        },
        src: "css/index.styl",
        dest: "css/index.css"
      }
    },
    watch: {
      stylus: {
        files: ["css/index.styl"],
        tasks: ["stylus:build", "exec:touch_index"]
      },
      dev: {
        files: ["src/**/*"],
        tasks: ["webpack"],
        options: {
          spawn: false,
        }
      }
    },
    webpack: {
      options: webpackConfig,
      build: {
        watch: false,
        keepalive: false,
        inline: false,
        hot: false,
        plugins: [
          new webpack.optimize.UglifyJsPlugin({
            // compress: {
            //   warnings: false
            // },
            output: './build/lock.min.js'
          })
        ]
      }
    },
    "webpack-dev-server": {
      options: {
        webpack: webpackConfig,
        publicPath: "/build/"
      },
      start: {
        keepAlive: true,
        webpack: {
          devtool: "eval",
          debug: true
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("grunt-env");
  grunt.loadNpmTasks("grunt-exec");


  grunt.registerTask("build", ["clean:build", "env:build", "stylus:build", "webpack:build"]);
  grunt.registerTask("dist", ["clean:dist", "stylus:build", "webpack:build"]);
  grunt.registerTask("prepare_dev", ["clean:dev", /*"connect:dev",*/ "stylus:build"]);
  grunt.registerTask("dev", ["prepare_dev", "webpack-dev-server", "watch"]);
  grunt.registerTask("design", ["prepare_dev", "webpack", "watch"]);
};
