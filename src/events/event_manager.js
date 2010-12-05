// #PACKAGE: cmvc
// #MODULE: event_manager
// #DEPENDS: lib:jquery, lib:underscore

var CMVC = CMVC || {};

(function ($) {
	
	CMVC.EventManager = function () {
		
		var that, events, observers, trigger, bind;
		
		that = this;		
		events = {};
		observers = {};		
		
		trigger = function (name, event, args, callback) {

			if (!callback && _.isFunction(args)) {
				callback = args;
				args = [];
			}

			args = args ? args : [];

			if (!observers[name] || !observers[name][event]) {
				if (_.isFunction(callback)) { return callback(true); }
		    		return;
			}

			var ret = true;
			var remain = 0;

			_.each(observers[name][event],function(v) {
				remain++;
				setTimeout(function() {
					ret = v.callback.apply((v.context ? v.context : {}),data);
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

			checkReady();
		};
		
		bind = function (name, event, callback, context) {
			if (!events[name] || !events[name][event]) {
				throw ("Error setting event handler. Event " + event + " or identifier " + name + " not defined.");
			}

			observers[name][event] = observers[name][event] || {};
			
			observers[name][event][callback.toString()] = {
				callback : callback,
				context : context
			};
		};
		
		this.makeObservable = function (name, obj, events) {
			
			$.each(function (i, event) {
				events[name][event] = true;
			});
			
			$.extend(obj, {
				on : function (event, callback, context) {
					context = context || obj;
					bind(name, event, callback, context);
				},
				trigger : function (event, args, callback) {
					trigger(name, event, args, callback);					
				}
			});
		};
	};
	
	CMVC.EventManager = new CMVC.EventManager();
	
}(jQuery));
