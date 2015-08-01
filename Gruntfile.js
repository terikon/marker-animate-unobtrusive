module.exports = function(grunt) {
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	
	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),
		
		uglify: {
			options: {
				sourceMap: true,
				banner: '/* <%= grunt.task.current.target %> v<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> (C) 2015 Terikon Apps */\n'
			},
			SlidingMarker: {
				src: 'SlidingMarker.js',
				dest: 'dist/SlidingMarker.min.js'
			},
			MarkerWithGhost: {
				src: 'MarkerWithGhost.js',
				dest: 'dist/MarkerWithGhost.min.js'
			}
		},
		
		jshint: {
			all: ['Gruntfile.js', 'SlidingMarker.js', 'MarkerWithGhost.js', 'tests/**/*.js']
		},
		
		jasmine: {
			//These will run with jQuery loaded before the library.
			"with jQuery": {
				src: ['SlidingMarker.js', 'MarkerWithGhost.js', 'tests/testHelper.js'],
				options: {
					specs: 'tests/spec/*Spec.js',
					vendor: [
						'https://maps.googleapis.com/maps/api/js?sensor=false',
						'node_modules/jquery/dist/jquery.min.js',
						'vendor/jquery.easing.1.3.js',
						'vendor/markerAnimate.js'
					]
				}
			},
			//These will run with jQuery loaded after the library, so it will be accessible  only to specs.
			"without jQuery": {
				src: ['SlidingMarker.js', 'MarkerWithGhost.js',
					'node_modules/jquery/dist/jquery.min.js', 'vendor/jquery.easing.1.3.js', 'vendor/markerAnimate.js',
					'tests/testHelper.js'],
				options: {
					specs: 'tests/spec/*Spec.js',
					vendor: [
						'https://maps.googleapis.com/maps/api/js?sensor=false'
					]
				}
			}
		}
		
	});
	
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('test', ['jasmine']);
};