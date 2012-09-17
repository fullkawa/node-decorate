module.exports = {
	append_manipulate : ['hello']
}

module.exports.proc_for_elements = {
	hello : function($) {
		$('body').attr('onload', 'alert("Hello, world !")');
	}
};
