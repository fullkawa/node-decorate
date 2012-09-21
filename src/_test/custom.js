module.exports = {
	prepend_before : [],
	append_before : ['process1'],
	prepend_manipulate : ['process2'],
	append_manipulate : ['process3', 'process4'],
	prepend_after : ['process5', 'process6'],
	append_after : []
}

module.exports.proc_for_text = {
	process1 : function(text, context) {
		return text.replace(/HTML/g, 'html');
	},
	process5 : function(text, context) {
		return text.replace('<body>', '<body onload="alert(\'Hello, world.\');">');
	},
	process6 : function(text, context) {
		var result = text;
		if (context.options) {
			result = text.replace('world.', context.options);
		}
		return result;
	}
};

module.exports.proc_for_elements = {
	process2 : function($, context) {
		$('body').prepend('<div>target.href &gt;&gt; ' + context.target.href + '</div>');
	},
	process3 : function($, context, document) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = "console.log('[custom.js] inserts this script here !');";
		document.head.appendChild(script);
	},
	process4 : function($, context) {
		var no = 1;
		$('script').each(function() {
			this.id = 'script-' + no++;
		});
	}
};
