// #PACKAGE: cmvc
// #MODULE: template
// #DEPENDS: lib:jquery

var CMVC = CMVC || {};

(function($) {

	var template_cache = {};

	CMVC.Template = function(template) {
		
		var that = this;
		var compiled = false;
		var loading = false;

		var queue = [];

		function callQueue(compiled) {
			var cb;
			while (cb = queue.shift()) {
				cb.c.apply(that,[compiled(cb.v)]);
			}
		}

		this.render = function(view,callback) {
			
			if ($.isFunction(view)) {
				callback = view;
				view = {};
			}
		
			queue.push({v:view,c:callback});

			if (loading) return;
			if (compiled) return callQueue(compiled);
			if (template_cache[template]) return callQueue(template_cache[template]);
			loading = true;
			$.ajax({
                        	url : template,
                                success : function(template_contents) {
					compiled = _.template(template_contents);
					template_cache[template] = compiled;
					loading = false;
					callQueue(compiled);
                                }
                        }); 
		}			
	};
	
}(jQuery));
