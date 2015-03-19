module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			target1: {
				options: {
					sourceMap: true,
					banner: '/*! <%= pkg.title %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
				},
				src: 'SlidingMarker.js',
				dest: 'dist/SlidingMarker.min.js'
			}
		},
		
		jshint: {
			all: ['Gruntfile.js', 'SlidingMarker.js', 'tests/**/*.js']
		},
		
		jasmine: {
			all: {
				src: "SlidingMarker.js",
				options: {
					specs: "tests/spec/*Spec.js",
					vendor: [
						"https://maps.googleapis.com/maps/api/js?sensor=false",
						"node_modules/jquery/dist/jquery.min.js",
						"vendor/jquery.easing.1.3.js",
						"vendor/markerAnimate.js"
					]
				}
			}
		}
		
	});
	
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('test', ['jasmine']);
};