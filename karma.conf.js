// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'client_old/bower_components/jquery/dist/jquery.js',
      'client_old/bower_components/angular/angular.js',
      'client_old/bower_components/angular-mocks/angular-mocks.js',
      'client_old/bower_components/angular-resource/angular-resource.js',
      'client_old/bower_components/angular-cookies/angular-cookies.js',
      'client_old/bower_components/angular-sanitize/angular-sanitize.js',
      'client_old/bower_components/angular-route/angular-route.js',
      'client_old/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'client_old/bower_components/lodash/dist/lodash.compat.js',
      'client_old/bower_components/angular-socket-io/socket.js',
      'client_old/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client_old/app/app.js',
      'client_old/app/app.coffee',
      'client_old/app/**/*.js',
      'client_old/app/**/*.coffee',
      'client_old/components/**/*.js',
      'client_old/components/**/*.coffee',
      'client_old/app/**/*.jade',
      'client_old/components/**/*.jade',
      'client_old/app/**/*.html',
      'client_old/components/**/*.html'
    ],

    preprocessors: {
      '**/*.jade': 'ng-jade2js',
      '**/*.html': 'html2js',
      '**/*.coffee': 'coffee',
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client_old/'
    },

    ngJade2JsPreprocessor: {
      stripPrefix: 'client_old/'
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
