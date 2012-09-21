var
	should = require('should'),
	fs = require('fs'),
	decorate = require('../index.js');

describe('node-decorate', function() {
	
	it('decorate HTML document(s)');
	it('decorate XML document(s)');
	
	it('does not send responses to request for other(except for HTML,XML) resources.');
	
	it('can run on clusters (only NODE_ENV=production)');
	
	it('has these phases - init, build_context, preprocess, get_document, decorate, postprocess', function() {
		decorate.init.should.be.ok;
		decorate.build_context.should.be.ok;
		decorate.preprocess.should.be.ok;
		decorate.get_document.should.be.ok;
		decorate.decorate.should.be.ok;
		decorate.postprocess.should.be.ok;
	});
	
	describe('phase', function() {
		
		describe('init', function() {});
		
		describe('build_context', function() {
			
			describe('context', function() {
				var default_context = decorate.getDefaultContext();
				var custom_context = decorate.getCustomContext();
				
				it('consists of four factors - default, config, request path and custom', function() {
					default_context.should.be.ok;
					custom_context.should.be.ok;
				});
				
				describe('default_context', function() {
					it('is defined by src/default.js', function() {
						var def = fs.readFileSync(__dirname + '/../src/default.js').toString();
						def.should.be.not.equal('');
					});
				});
				
				describe('custom_context', function() {
					it('is defined by src/SIGNATURE/custom.js for each user/service/etc.', function() {
						var tested = decorate.overrideContext({}, decorate.getDefaultContext());
						tested = decorate.overrideContext(tested, decorate.getCustomContext('_test'));
						
						tested.before.length.should.be.equal(1);
						tested.manipulate.length.should.be.equal(5);
						tested.after.length.should.be.equal(2);
					});
				});
			});
		});
		
		describe('get_document', function() {
			
			it('can get documents via HTTP requests');
			it('can not get documents via HTTPS requests');
			
			it('can get UTF8 and ascii documents directly');
			it('can get non-UTF8 documents by iconv', function() {
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
		
		it('is a configurtion about this server');
		it('can not customize by each user/service');
	});
	
	describe('request path', function() {
		var parsed_format = decorate.parseRequestPath('/SIGN/OPT/http/TAG_HOST/TAG_PATH/TO/DOCUMENT#HTML');
		var parsed_ex1 = decorate.parseRequestPath('/http/www.example.com/index.html');
		var parsed_ex2 = decorate.parseRequestPath('/usr1/http/service.example.co.jp/');
		var parsed_ex3 = decorate.parseRequestPath('/usr1/id/A-0001-1/http/search.example.tv/contents?q=keyword1&lang=en');
		var parsed_ex4 = decorate.parseRequestPath('/usr1/key1_value1;key2_value2/http/www.example.com/path/to/somewhere');
	
		it('consists of signature, options, target_protocol, target_host, target_path and target_hash(if exist)', function() {
			parsed_format.should.have.property('signature');
			parsed_format.should.have.property('options');
			parsed_format.should.have.property('target');
			parsed_format.target.should.have.property('protocol');
			parsed_format.target.should.have.property('host');
			parsed_format.target.should.have.property('path');
		});
		
		describe('signature', function() {
			
			it('is first part in front of target protocol', function() {
				parsed_format.signature.should.be.equal('SIGN');
				parsed_ex1.signature.should.be.equal('');
				parsed_ex2.signature.should.be.equal('usr1');
				parsed_ex3.signature.should.be.equal('usr1');
				parsed_ex4.signature.should.be.equal('usr1');
			});
		});
		
		describe('options', function() {
			
			it('is second(and more) part in front of target protocol', function() {
				parsed_format.options.should.be.equal('OPT');
				parsed_ex1.options.should.be.equal('');
				parsed_ex2.options.should.be.equal('');
				parsed_ex3.options.should.be.equal('id/A-0001-1');
				parsed_ex4.options.should.be.equal('key1_value1;key2_value2');
			});
		});
		
		describe('target protocol', function() {
			
			it('is a delimiter for a request path', function() {
				parsed_format.target.protocol.should.be.equal('http:');
				parsed_ex1.target.protocol.should.be.equal('http:');
				parsed_ex2.target.protocol.should.be.equal('http:');
				parsed_ex3.target.protocol.should.be.equal('http:');
				parsed_ex4.target.protocol.should.be.equal('http:');
			});
		});
		
		describe('target host', function() {
			
			it('is first part after target protocol', function() {
				parsed_format.target.host.should.be.equal('tag_host');
				parsed_ex1.target.host.should.be.equal('www.example.com');
				parsed_ex2.target.host.should.be.equal('service.example.co.jp');
				parsed_ex3.target.host.should.be.equal('search.example.tv');
				parsed_ex4.target.host.should.be.equal('www.example.com');
			});
		});
		
		describe('target path', function() {
			
			it('is second(and more) part after target protocol', function() {
				parsed_format.target.path.should.be.equal('/tag_path/to/document');
				parsed_ex1.target.path.should.be.equal('/index.html');
				parsed_ex2.target.path.should.be.equal('/');
				parsed_ex3.target.path.should.be.equal('/contents?q=keyword1&lang=en');
				parsed_ex4.target.path.should.be.equal('/path/to/somewhere');
			});
		});
		
		describe('target hash', function() {
			
			it('is after "#"', function() {
				parsed_format.target.hash.should.be.equal('#html');
				parsed_ex1.target.should.not.have.property('hash');
				parsed_ex2.target.should.not.have.property('hash');
				parsed_ex3.target.should.not.have.property('hash');
				parsed_ex4.target.should.not.have.property('hash');
			});
		});
	});
});
