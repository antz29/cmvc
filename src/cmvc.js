// #PACKAGE: cmvc
// #MODULE: core
// #DEPENDS: lib:jquery

var CMVC = CMVC || {};

(function( window, $, undefined ) {

	CMVC.options = {
		'target' : null,
		'loading_indicator' : null,
		'default_controller' : 'index',
		'default_action' : 'index',
		'minimum_containter_height' : 200,
		'load_indicator_timeout' : 300,
		'load_fail_timeout' : 3000 //TODO: Implement load fail timeout handling.  
	};
	
	var observers = {};
	var first_load = true;

	CMVC.on = function(event,func,context) {
		if (!observers[event]) observers[event] = {};		
		observers[event][func.toString()] = {func : func, context : context}; 
	};
	
	CMVC.trigger = function(event,data,callback) {
		if (!observers[event]) {
			if (_.isFunction(callback)) { return callback(true); }
			return;
		}
		var ret = true;
		var remain = 0;
		_.each(observers[event],function(v) {
			remain++;
			setTimeout(function() { 
				ret = v.func.apply(v.context,data);
				remain--;
			},0);
		});
		
		function checkReady() {
			if (remain > 0) {
				setTimeout(checkReady,0);
			}
			else {
				callback(ret);
			}
		};
	};
	
	CMVC.init = function() {
				
		$(window).bind( 'hashchange', function (e) {
			var state = $.bbq.getState();
			if (!state.load) state.load = CMVC.options.default_controller;
			
			var conact = state.load.split('/');
			var controller = conact.shift();
			var action = conact.shift();
			
			action = action || CMVC.options.default_action;
			
			delete state.load;
			
			CMVC.trigger('beforeload',[controller, action, state],function(load) {
				if (load) CMVC.load(controller, action, state); 
			});
		});
		
		$(window).trigger('hashchange');
	};
	
	CMVC.load = function(controller, action, state) {
		
		if (!first_load && CMVC.options.loading_indicator) {
			var out_height = CMVC.options.target.outerHeight();
			var load_height = (out_height < CMVC.options.minimum_containter_height) ? CMVC.options.minimum_containter_height : out_height;
			var load_timer = setTimeout(function() {
				CMVC.options.loading_indicator.height(load_height).show();
			},CMVC.options.load_indicator_timeout);
		}

		dominoes(controller,function () {
			var name =_.camelize(controller);
			controller = new CMVC.Controllers[name]();
			controller.setName(name);
			
			CMVC.trigger('loadcontroller',[controller, action, state],function(load) {
				if (!load) return;
				controller.callAction(action, state, function(contents) {
					CMVC.trigger('load',[controller, action, state, contents],function(new_contents) {											
						if (new_contents) contents = new_contents;
						var class_name = _.underscore(name);
						CMVC.options.target.removeAttr('class').addClass(class_name);
						
						//$('nav li').removeClass('active');
						//$('nav li a[href*='+ class_name +']').closest('li').addClass('active');
						
						CMVC.options.target.html(contents);
						
						if (CMVC.options.loading_indicator) {
							CMVC.options.loading_indicator.fadeOut();
						}
						
						first_load = false;
						clearTimeout(load_timer);
					});
				}); 
			});
		});
	};
	
})(window, window.jQuery);
