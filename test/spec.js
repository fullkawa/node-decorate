var
	should = require('should'),
	fs = require('fs'),
	decorate = require('../index.js');

describe('node-decorate', function() {
	
	it('decorate HTML document(s)');
	it('decorate XML document(s)');
	
	it('does not send responses to request for other resources.');
	
	it('can run on clusters (only NODE_ENV=production)');
	
	describe('decorate', function() {
		
		it('has these phases - init, build_context, preprocess, get_document, decorate, postprocess', function() {
			decorate.init.should.be.ok;
			decorate.build_context.should.be.ok;
			decorate.preprocess.should.be.ok;
			decorate.get_document.should.be.ok;
			decorate.decorate.should.be.ok;
			decorate.postprocess.should.be.ok;
		});
		
		describe('init', function() {});
		
		describe('build_context', function() {
			
			describe('context', function() {
				var default_context = decorate.getDefaultContext;
				var custom_context = decorate.getCustomContext;
				
				it('consists of two factor - default and custom', function() {
					default_context.should.be.ok;
					custom_context.should.be.ok;
				});
				
				describe('default_context', function() {
					it('is common');
				});
				
				describe('custom_context', function() {
					it('is unique for each user/service/etc.')
				});
			});
		});
		
		describe('get_document', function() {
			
			it('can get documents via HTTP requests');
			it('can not get documents via HTTPS requests');
			it('can get non-UTF8 documents', function() {
				decorate.iconv.should.be.ok;
			});
		});
		
		describe('decorate', function() {
			
			it('use jQuery(from CDN) to build DOM tree', function() {
				var url_jqcdn = decorate.config.jqueryCDN;
				url_jqcdn.should.be.a('string');
				// TODO: check existence
			});
			it('can use jQuery(from local) too', function() {
				decorate.config.useLocalJquery.should.be.a('boolean');
			});
			
			it('has three steps - before(manipulate), manipulate, after(manipulate)');
			
			describe('before, after', function() {
				
				it('decorates document "text" by replace() etc.');
			});
			
			describe('manipulate', function() {
				
				it('decorates document "elements" by jQuery methods.')
			});
		});
		
		describe('preprocess', function() {
			
			it('is to control req(/res)');
			
			it('processes functions in order', function() {
				decorate.preprocess.should.be.an.instanceOf(Array);
			});
		})
		
		describe('postprocess', function() {
			
			it('is to control (req/)res');
			
			it('processes functions in order', function() {
				decorate.postprocess.should.be.an.instanceOf(Array);
			});
		})
	});
	
	describe('config', function() {
		
		it('is a configurtion about this service');
		it('can not customize by each user/service');
	});
	
	describe('context', function() {
		
		it('has "default" and "customize"');
		
		describe('default context', function() {
			//
		});
		
		describe('custom context', function() {
			//
		});
	});
});
