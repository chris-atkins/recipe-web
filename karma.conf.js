module.exports = function (config) {
	config.set({

		basePath: './',

		browserConsoleLogOptions: {
			level: 'log',
			format: '%b %T: %m',
			terminal: true
		},

		preprocessors: {
			"app/recipe-lib/**/*.html": ["ng-html2js"]
		},

		files: [
			'app/recipe-lib/spec-utils.spec.js',
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-route/angular-route.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/angular-cookies/angular-cookies.js',
			'app/bower_components/angular-underscore-module/angular-underscore-module.js',
			'app/bower_components/angular-trix/dist/angular-trix.js',
			'app/bower_components/underscore/underscore.js',
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
			'app/bower_components/ng-file-upload/ng-file-upload-all.js',
			'app/bower_components/ng-img-crop/compile/unminified/ng-img-crop.js',
			'app/bower_components/bootstrap/dist/css/bootstrap.css',
			'app/bower_components/tether/dist/js/tether.js',
			'app/bower_components/bootstrap/dist/js/bootstrap.js',
			'app/recipe-lib/**/*.js',
			'app/recipe-lib/**/*.html'
		],

		ngHtml2JsPreprocessor: {
			// If your build process changes the path to your templates,
			// use stripPrefix and prependPrefix to adjust it.
			stripPrefix: "app/",
			// prependPrefix: "base/app/recipe-lib",

			// the name of the Angular module to create
			moduleName: "my.templates"
		},

		autoWatch: true,

		frameworks: ['jasmine'],

		browsers: ['Chrome'],

		plugins: [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-jasmine',
			'karma-junit-reporter',
			'karma-ng-html2js-preprocessor'
		],

		junitReporter: {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}

	});
};
