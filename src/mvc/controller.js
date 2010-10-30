var CMVC = CMVC || {};

(function($) {
	
	CMVC.Controller = function() {
				
		var name = name; 
		var that = this;
		
		this.getName = function() {
			return name;
		};
		
		this.setName = function(new_name) {
			name = new_name;
		};
		
		this.preAction = function(callback) { callback(); };		
		this.postAction = function() {};
		
		this.callAction = function(action,state,callback) {
			var mod = _.underscore(name) + '.' + action;
			dominoes(mod,function() {
				action = _.camelize(action);	
				if (!CMVC[name][action]) throw (name + '.' + action + " is not defined.");
				
				that.preAction(function() {
					var actobj = new CMVC[name][action]();			
					actobj.setModule(that);
					actobj.setName(action);
					actobj.exec(state,function(contents) {
						callback(contents);
						actobj.postRender(function() {
							if (state.action && actobj[state.action]) {
								actobj[state.action](function() { that.postAction(); });
							} else {
								that.postAction();
							}
						});
					});
				});
			});			
		};		
	};
	
}(jQuery));
