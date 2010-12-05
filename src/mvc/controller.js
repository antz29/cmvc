// #PACKAGE: cmvc
// #MODULE: controller
// #DEPENDS: lib:jquery

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
			var cname = _.underscore(name);
			var mod = 'controller' + '.' + cname + '.' + action;
			dominoes(mod,function() {
				var actobj = CMVC.getAction(cname,action);	
				if (!actobj) throw (name + '.' + action + " is not defined.");
				
				that.preAction(function() {
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
