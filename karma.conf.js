module.exports = function (config) {
	config.set({

		basePath: './',

		files: [
			'app/bower_components/angular/angular.js',
			'app/bower_components/angular-route/angular-route.js',
			'app/bower_components/angular-mocks/angular-mocks.js',
			'app/bower_components/angular-cookies/angular-cookies.js',
			'app/bower_components/angular-underscore-module/angular-underscore-module.js',
			'app/bower_components/angular-trix/dist/angular-trix.js',
			'app/bower_components/underscore/underscore.js',
			'app/bower_components/jquery/dist/jquery.js',
			'app/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
			'app/recipe-lib/**/*.js',
			'app/recipe-lib/**/*.html'
		],

		autoWatch: true,

		frameworks: ['jasmine'],

		browsers: ['Chrome'],

		plugins: [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-jasmine',
			'karma-junit-reporter'
		],

		junitReporter: {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}

	});
};
