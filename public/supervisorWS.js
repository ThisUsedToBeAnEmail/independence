(function (window) {
	let SupervisorUtils = function (supervisor) {
		this.sv = supervisor;
		return this;
	};

	window.supervisor.factory('util', SupervisorUtils, {
		createNode: function (options) {
			let self = this;
			// window.document *\o/*
			let node = this.sv.document.createNode("div");
			if (options.class) self.addClass(node, options.class);
			if (options.text) node.innerText = options.text;
		},
		addClass: function (node, clss) {
			let self = this;
			(clss instanceof Array ? clss.forEach(function (c) { self.addClass(c) }) : node.addClass(clss));
		},
		fetch: function (options) {
			// TODO fallback when fetch is not available!!!!
			let self = this;
			if (options.type == 'POST' || options.type == 'PUT') {
				fetch(options.endpoint, {
					method: options.type, // or 'PUT'
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(options.params),
				})
				.then(response => response.json())
				.then(function (data) {
					self.spinnerOff();
					if (options.cb) options.cb(data);
				})
				.catch(function (err) {
					self.spinnerOff();
					if (options.ecb) options.ecb(err);
				});
			} else if (options.type == 'GET') {
				options.endpoint += self.urlEncode(options.params);
				fetch(options.endpoint)
				.then(response => response.json())
				.then(options.cb)
				.catch(options.ecb);
			}
		}
	});
})(window);
