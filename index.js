var express, cluster, fs, http, url, path, jsdom, Iconv, logger;
var config, default_context, jq_src;

var init = module.exports.init = function() {
	// modules
	express = require('express');
	cluster = require('cluster');
	fs = require('fs');
	http = require('http');
	url = require('url');
	path = require('path');
	jsdom = require('jsdom');
	Iconv = module.exports.iconv = require('iconv-jp').Iconv;
	// ERROR: Iconv = require('iconv').Iconv;
	
	// settings
	config = module.exports.config = require('./config.js');

	default_context = getDefaultContext();
	default_context.dirname = __dirname;
	
	if (config.useLocalJquery) {
		jq_src = fs.readFileSync(__dirname + '/lib/jquery.min.js').toString();
	}

	// logging
	logger = express.logger('dev');
	if ('production' === process.env.NODE_ENV) {
		logger = express.logger();
	}
};

var build_context = module.exports.build_context = function(req, res, next) {
	try {
		var context = initContext();
		context.request = req.headers;
		
		context = overrideContext(context, parseRequestPath(req.path));
		if ('test' !== process.env.NODE_ENV) console.info('target_url-> %s', context.target.href);
		var sign = context.signature;
		var opts = context.options;

		context = overrideContext(context, getCustomContext(sign));
		//if ('test' !== process.env.NODE_ENV) console.dir(context); // for debug

		context.request.base =
			config.serverURL + 
			((sign && sign.length > 0) ? ('/' + sign) : '') +
			((opts && opts.length > 0) ? ('/' + encodeURIComponent(opts)) : '') +
			'/http';
		context.request.current = config.serverURL + req.path;
		/* for debug
		console.log('req.path-> %s', req.path);
		console.dir(context);
		*/
		
		req.context = context;
		next();
	}
	catch(e) {
		res.writeHead(400, '[build-context] ' + e);
		res.end();
		console.log('[build-context] ', e);
	}
};

var preprocess = module.exports.preprocess = [];

var get_document = module.exports.get_document = function(req, res, next) {
	var context = req.context;
	try {
		if (!context.target.href)
			throw new Error('No target url.');

		if (/(html|xml)/.test(req.headers['accept'])) {
			http.get(context.target.href, function(response) {
				var buf = [];
				var original_encoding;
				response.on('data', function(chunk) {
					/* for debug
					console.log('[get_document] skipIconv:%s, %s << %s', context.skipIconv, original_encoding, context.target.href)
					*/
					/* for debug
					var wk = 'm';
					if (cluster.isWorker) {
						wk = cluster.worker.id;
					}
					console.log('[%s] >> %s', wk, context.target.href);
					*/
					if (context.skipIconv) {
						buf.push(chunk);
					}
					else {
						original_encoding = getEncoding(res, chunk, original_encoding);
						buf.push(convertEnc(res, chunk, original_encoding));
					}
				}).on('end', function() {
					res._document = buf.join('');
					next();
				});
			}).on('error', function(e) {
				res.writeHead(404, e);
				res.end();
			});
		}
		else {
			res.writeHead(406, 'This server returns HTML document only.');
			res.end();
			console.log('This server returns HTML document only.');
		}
	}
	catch(e) {
		res.writeHead(400, '[get-document] ' + e);
		res.end();
		console.log('[get-document] ', e);
	}
}

var decorate = module.exports.decorate = function(req, res, next) {
	var context = req.context;
	try {
		if (!res._document || res._document.length == 0) throw "No document in response.";
		for (var i = 0; i < context.before.length; i++) {
			res._document = context.proc_for_text[context.before[i]](res._document, context);
			if (!res._document || res._document.length == 0) throw "No document returns from '" + context.before[i] + "'";
		}
	
		if (context.skipJsdom) {
			res.end(res._document);
		}
		else {
			var jsdom_conf = {
				html : res._document,
				done : function(errors, window) {
					if (errors) {
						res.writeHead(400, '[jsdom-env] ' + errors);
						res.end();
						console.log('[jsdom-env] %s', errors);
					}
					for ( i = 0; i < context.manipulate.length; i++) {
						context.proc_for_elements[context.manipulate[i]](window.$, context, window.document);
					}
					
					res._document = window.document.innerHTML;
					for ( i = 0; i < context.after.length; i++) {
						res._document = context.proc_for_text[context.after[i]](res._document, context);
						if (!res._document || res._document.length == 0) throw "No document returns from '" + context.after[i] + "'";
					}
					//console.log(res._document);
					res.end(res._document);
				}
			};
			if (config.useLocalJquery) {
				jsdom_conf.src = [ jq_src ];
			}
			else {
				jsdom_conf.scripts = [ config.jqueryCDN ];
			}
			jsdom.env(jsdom_conf);
		}
	}
	catch(e) {
		res.writeHead(400, '[decorate] ' + e);
		res.end();
		console.log('[decorate] ', e);
	}
};

var postprocess = module.exports.postprocess = [];

var parseRequestPath = module.exports.parseRequestPath = function(reqPath) {
	var parsed = {};
	try {
		var separator = (reqPath.indexOf('/https/i') > 0) ? '/https/' : '/http/';

		var parts = reqPath.split(separator);
		if (parts.length == 1) throw 'No protocol in "' + reqPath + '"';

		var target = parsed.target = url.parse(separator.substring(1, separator.length - 1) + '://' + parts[1].toLowerCase());

		var signend = parts[0].indexOf('/', 1);
		if (signend == -1) {
			parsed.signature = parts[0].substring(1);
			parsed.options = '';
		}
		else {
			parsed.signature = parts[0].substring(1, signend);
			parsed.options = decodeURIComponent(parts[0].substring(signend + 1));
		}
	}
	catch(e) {
		console.log('[parseRequestPath] %s', e);
	}
	/* for debug
	console.log(reqPath);
	console.dir(parsed);
	*/
	return parsed;
}

var getDefaultContext = module.exports.getDefaultContext = function() {
	return require('./src/default.js');
};

var getCustomContext = module.exports.getCustomContext = function(signature) {
	if (signature === undefined || signature.length == 0) {
		signature = '.';
	}
	return require('./src/' + signature + '/custom.js');
};

var initContext = function() {
	return overrideContext({}, default_context);
};

var overrideContext = module.exports.overrideContext = function(base, context) {
	var overridden = base || {};
	try {
		for (var key in context) {
			if (/^prepend_(before|manipulate|after)/.test(key)) {
				var commands = key.split('_');
				if (!overridden[commands[1]]) overridden[commands[1]] = [];
				overridden[commands[1]] = context[key].concat(overridden[commands[1]]);
			}
			else if (/^append_(before|manipulate|after)/.test(key)) {
				var commands = key.split('_');
				if (!overridden[commands[1]]) overridden[commands[1]] = [];
				overridden[commands[1]] = overridden[commands[1]].concat(context[key]);
			}
			else if (/^proc_for_(text|elements)/.test(key)) {
				if (!overridden[key]) overridden[key] = {};
				for (var funcname in context[key]) {
					overridden[key][funcname] = context[key][funcname];
				}
			}
			else {
				overridden[key] = context[key];
			}
		}
	}
	catch(e) {
		console.log('[overrideContext] %s', e);
	}
	return overridden;
};

var getEncoding = function(response, chunk, original_encoding) {
	var encoding = original_encoding;
	try {
		if (!encoding) {
			var matcher = /charset=['"]?(.+)?['";]/;
			
			var reshd_target = response.getHeader('Content-Type');
			if (reshd_target !== undefined) {
				if (reshd_target.match(matcher)) {
					encoding = RegExp.$1.toLowerCase();
				}
			}
			else {
				if ('test' !== process.env.NODE_ENV) {
					console.log('[getEncoding] No "Content-Type" in response header: ');
					//console.dir(response._headers); // for debug
				}
			}
			
			if (!encoding) {
				var chunk_target = chunk.toString();
				if (chunk_target.match(matcher)) {
					encoding = RegExp.$1.toLowerCase();
				}
				else {
					var shorten = chunk_target.substring(0, 30).concat('...');
					if ('test' !== process.env.NODE_ENV) console.log('[getEncoding] No charset in chunk: %j', shorten);
				}
			}
			if ('test' !== process.env.NODE_ENV) console.log('[getEncoding] encoding-> %s', encoding);
		}
	}
	catch(e) {
		console.log('[getEncoding] ' + e);
	}
	//console.log('[getEncoding] encoding-> %s', encoding); // for debug
	return encoding;
}

var convertEnc = function(response, chunk, encoding) {
	var converted = chunk;
	try {
		if ('utf-8' !== encoding && 'ascii' !== encoding) {
			var iconv = new Iconv(encoding, 'utf-8');
			converted = iconv.convert(chunk);
			/* for debug
			console.log('[convertEnc] original: %s', original_header);
			console.log('[convertEnc] convert "%s" -> "utf-8"', encoding);
			*/
		}
	}
	catch(e) {
		if ('test' !== process.env.NODE_ENV) console.log('[convertEnc] encoding:%s, %s', encoding, e);
		// No Problem; console.log(chunk.toString());
	}
	response.setHeader('Content-Type', 'text/html; charset=utf-8'); // FIXME: case XML document
	return converted;
}

var buildApp = function() {
	var app = express();
	if ('test' !== process.env.NODE_ENV) app.use(logger);
	app.use(build_context);
	for (var i=0; i<preprocess.length; i++) {
		app.use(preprocess[i]);l
	}
	app.use(get_document);
	app.use(decorate);
	for (var i=0; i<preprocess.length; i++) {
		app.use(postprocess[i]);
	}
	app.listen(config.port);
};


// start
init();

// clustering
if (cluster.isMaster) {
	console.log(__filename + ' started at %s .', new Date());
	console.log('env: %s', process.env.NODE_ENV);

	if ('test' === process.env.NODE_ENV) {
		buildApp();
	}
	else {
		for (var i = 0; i < config.clusterNum; i++) {
			cluster.fork();
		}
		cluster.on('fork', function(worker) {
			if ("test" !== process.env.NODE_ENV) console.log('worker %s created.', worker.id);
		}).on('exit', function(worker) {
			if ("test" !== process.env.NODE_ENV) console.log('worker %s died.', worker.id);
		});
	}
}
else { // worker
	buildApp();
}
