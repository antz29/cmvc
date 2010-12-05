// #PACKAGE: cmvc
// #MODULE: core
// #DEPENDS: lib:jquery, lib:underscore, cmvc:event_manager

var CMVC = CMVC || {};

(function( window, $, undefined ) {

	CMVC.options = {
		'target' : null,
		'loading_indicator' : null,
		'default_controller' : 'index',
		'default_action' : 'index',
		'load_indicator_timeout' : 300
	};
	
	var controllers = {};
	var actions = {};

	var first_load = true;

	CMVC.init = function() {
		
	       	CMVC.EventManager.makeObservable('cmvc',CMVC,[ 
			'pre_load',
			'post_load', 
			'pre_controller', 
			'pre_action', 
			'post_action',
			'post_controller',
			'pre_render', 
			'post_render', 
			'show_indicator',
			'hide_indicator' 
		]);
	};

	CMVC.start = function() {
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

	CMVC.controller = function(name,def) {
		var controller = new CMVC.Controller();
		def.call(controller);

		var cname = _.camelize(name);
		controller.setName(cname);
	        controllers[name] = controller;
	};

	CMVC.action = function(controller,name,def) {
		var action = new CMVC.Action();
		def.call(action);

		var aname = _.camelize(name);
		action.setName(aname);
		action.setController(CMVC.getController(controller));
		if (!actions[controller]) actions[controller] = {};
	        actions[controller][name] = action;
	};

	CMVC.getAction = function(controller,name) {
		if (!actions[controller]) return undefined;
		return actions[controller][name];
	};

	CMVC.getController = function(name) {
		return controllers[name];
	};

	CMVC.load = function(controller, action, state) {
		
		CMVC.trigger('pre_load',[controller, action, state]);

		if (!first_load) {
			var load_timer = setTimeout(function() {
				CMVC.trigger('display_indicator',[controller, action, state]);
			},CMVC.options.load_indicator_timeout);
		} else {
			CMVC.trigger('display_indicator',[controller, action, state]);	
		}

		CMVC.trigger('pre_controller',[controller, action, state]);
		dominoes( "controller." + controller,function () {

			controller = CMVC.getController(controller);

			CMVC.trigger('pre_action',[controller, action, state],function(load) {
				if (!load) return;
				CMVC.trigger('pre_render',[controller, action, state]);
				controller.callAction(action, state, function(contents) {
					CMVC.trigger('post_render',[controller, action, state, contents],function(new_contents) {											
						if (new_contents !== true) contents = new_contents;
	
						var class_name = _.underscore(controller.getName() + '_' + action);
						CMVC.options.target.removeAttr('class').addClass(class_name);
						
						CMVC.options.target.html(contents);
						
						CMVC.trigger('hide_indicator',[controller, action, state]);
						clearTimeout(load_timer);

						first_load = false;
						
						CMVC.trigger('post_action',[controller, action, state]);
						CMVC.trigger('post_controller',[controller, action, state]);
					});
				}); 
			});
		});
	};
	
})(window, window.jQuery);
