var
	should = require('should'),
	http = require('http'),
	fs = require('fs'),
	md5 = require('MD5'),
	server = require('../index.js');

describe('node-decorate', function() {
	
	describe('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/index.html', function() {
		it('send a response code: 200', function(done) {
			var doc = fs.readFileSync(__dirname + '/check_docs/index.html').toString();
			request('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/index.html', done).expects(200, doc);
		});
	});
	describe('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/tests/a.html', function() {
		it('send a response code: 200', function(done) {
			var doc = fs.readFileSync(__dirname + '/check_docs/tests_a.html').toString();
			request('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/tests/a.html', done).expects(200, doc);
		});
	});
	describe('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/tests/path/to/document.html', function() {
		it('send a response code: 200', function(done) {
			var doc = fs.readFileSync(__dirname + '/check_docs/tests_path_to_document.html').toString();
			request('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/tests/path/to/document.html', done).expects(200, doc);
		});
	});
	describe('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/tests/path/to/more/and/more/document.html', function() {
		it('send a response code: 200', function(done) {
			var doc = fs.readFileSync(__dirname + '/check_docs/tests_path_to_more_and_more_document.html').toString();
			request('/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/tests/path/to/more/and/more/document.html', done).expects(200, doc);
		});
	});

	describe('/_test/Node.js%20!/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/', function() {
		it('send a response code: 200', function(done) {
			var doc = fs.readFileSync(__dirname + '/check_docs/index.html#_test').toString();
			request('/_test/Node.js%20!/http/node-decorate-tests.s3-website-ap-northeast-1.amazonaws.com/', done).expects(200, doc);
		});
	});
});

var request = function(target, done) {
	var _req_options = {
		host: '127.0.0.1',
		port: server.config.port,
		path: target,
		headers: {
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
		}
	};
	return {
		expects : function(statusCode, body, options) {
			var options = options || {};
			var req = http.get(_req_options, function(res) {
				var buf = [];
				res.on('data', function(chunk) {
					//console.log('status code: %s', statusCode); // for debug
					res.should.have.status(statusCode);
					buf.push(chunk);
				})
				.on('end', function() {
					if (options.md5) {
						var document = md5(buf.join(''));
						document.should.be.equal(md5(body));
					}
					else {
						var document = buf.join('');
						document.should.be.equal(body);
					}
					done();
				});
			});
		}
	};
};
