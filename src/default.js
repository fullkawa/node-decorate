module.exports = {
	/**
	 * skipIconv:
	 *  true -> Skip to convert character encoding.
	 *   CAUTION: Non-UTF8 documents will be gable !!
	 */
	skipIconv: false,
	
	/**
	 * skipJsdom:
	 *	true -> Skip to build DOM by jsdom module, you can not run manipulations.
	 *	false (*default)
	 */
	skipJsdom: false,
	
	/**
	 * Document decorators
	 */
	before: [],
	
	manipulate: [
		'replace2AbsoluteURL',
		'removeJsdom'
	],
	
	after: [], //['debug']
	
}

module.exports.proc_for_text = {

	debug: function(doc, context) {
		console.log('----');
		console.log(doc);
		console.log('----');
		return doc;
	}
}

var getParent = function(path) {
	var parent = path;
	try {
		if (parent !== undefined) {
			parent = parent.substring(0, parent.lastIndexOf('/'));
		}
	}
	catch(e) {
		console.log('[getParent] %s', e);
	}
	return parent;
}

var replaceDirname2URL = function(path, context) {
	var url = path;
	try {
		var dirname = context.dirname;
		var req_base = getParent(context.request.base);
		do {
			if (path.indexOf(dirname) == 0) { // equal path.startsWith(dirname)
				url = path.replace(dirname, req_base);
				break;
			}
			dirname = getParent(dirname);
			req_base = getParent(req_base);
		}
		while(dirname.length > 1)
	}
	catch(e) {
		console.log('[replaceDirname2URL] %s', e);
	}
	//console.log('[replaceDirname2URL] replaced-> %s', url); // for debug
	return url;
};

module.exports.proc_for_elements = {

	removeJsdom: function($) {
		$('.jsdom').remove();
	},
	
	replace2AbsoluteURL: function($, context) {
		var target = context.target;
		for (var i=0; i<this.URLReplaceTargets.length; i++) {
			var tag = this.URLReplaceTargets[i].tag;
			var attr = this.URLReplaceTargets[i].attr;
			
			$(tag).each(function(i, elm) {
				//console.log('<%s %s="%s">', elm._tagName, attr, elm[attr]); // for debug
				if ('a' === tag && '' !== elm[attr] && !(/^http/.test(elm[attr]))) {
					elm[attr] = replaceDirname2URL(elm[attr], context);
				}
				//console.log('<%s %s="%s">', elm._tagName, attr, elm[attr]); // for debug
				
				if ('' !== elm[attr] && !(/^http/.test(elm[attr])) && !(/^\/\//.test(elm[attr]))) {
					elm[attr] = target.base + elm[attr];
				}
				/* for debug
				console.log('<%s %s="%s">', elm._tagName, attr, elm[attr]);
				console.log();
				*/
			});
		}
	},
	URLReplaceTargets: [
		{ tag: 'form',			 attr: 'action'},
		{ tag: 'a',					attr: 'href'},
		{ tag: 'area',			 attr: 'href'},
		{ tag: 'link',			 attr: 'href'},
		{ tag: 'img',				attr: 'src'},
		{ tag: 'input',			attr: 'src'},
		{ tag: 'script',		 attr: 'src'},
		{ tag: 'frame',			attr: 'src'},
		{ tag: 'iframe',		 attr: 'src'},
		
		/* Rare targets; if you wished, you can move them.
		{ tag: 'base',			 attr: 'href'},
		{ tag: 'body',			 attr: 'background'},
		{ tag: 'blockquote', attr: 'cite'},
		{ tag: 'q',					attr: 'cite'},
		{ tag: 'del',				attr: 'cite'},
		{ tag: 'ins',				attr: 'cite'},
		{ tag: 'object',		 attr: 'classid'},
		{ tag: 'object',		 attr: 'codebase'},
		{ tag: 'applet',		 attr: 'codebase'},
		{ tag: 'object',		 attr: 'data'},
		{ tag: 'img',				attr: 'longdesc'},
		{ tag: 'frame',			attr: 'longdesc'},
		{ tag: 'iframe',		 attr: 'longdesc'},
		{ tag: 'head',			 attr: 'profile'},
		{ tag: 'img',				attr: 'usemap'},
		{ tag: 'object',		 attr: 'usemap'},
		{ tag: 'input',			attr: 'usemap'},
		*/
	]
}
