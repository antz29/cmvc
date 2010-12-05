// #PACKAGE: cmvc
// #MODULE: action
// #DEPENDS: lib:jquery

var CMVC = CMVC || {};

(function($) {
	
	CMVC.Action = function() {
				
		var name = name;
		var controller = false;

		var view = {}; 
		var template = false; 
		var state = {};		
		
		this.getName = function() {
			return name;
		};
		
		this.getView = function() {
			return view;
		};
		
		this.setName = function(new_name) {
			name = new_name;
		};
		
		this.getTemplate = function() {
			return template;
		};
		
		this.setTemplate = function(new_template) {
                       	template = new CMVC.Template(CMVC.Action.options.view_path + new_template + '.tpl');
		};
		
		this.getState = function() {
			return state;
		};
		
		this.getController = function() {
			return controller;
		};
		
		this.setController = function(set_controller) {
			controller = set_controller;
		};
		
		this.go = function(callback) { callback(); };
		this.postRender = function() { }; 
		
		this.exec = function(new_state,callback) {
			this.setTemplate(_.underscore(this.getController().getName()) + '/' + _.underscore(this.getName()));
			
			state = new_state;

			this.go(function() {				
				template.render(view,function(contents) {
					callback(contents);
				});
			});
		};
		
	};

	CMVC.Action.options = {
		'view_path' : 'js/views/'
	};	

}(jQuery));
