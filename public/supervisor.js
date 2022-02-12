(function (window) {
	let Supervisor = function (document) {
		this.document = document;
		return this;
	};

	let prototype = {
		factory: function (name, obj, prototype) {
			for (let pro in prototype) {
				Object.defineProperty(obj.prototype, pro, {
					value: prototype[pro],
					configurable: false,
					writeable: false
				});
			}
			if (name) Object.defineProperty(Supervisor.prototype, name, {
				get: function () {
					Object.defineProperty(this, name, {
						value: new obj(this),
						configurable: false,
						writeable: false
					});
					return this[name];
				},
				configurable: true,
				writeable: false
			});
		}
	};

	for (let pro in prototype) {
		Object.defineProperty(Supervisor.prototype, pro, {
			value: prototype[pro],
			writable: false,
			configurable: false,
			enumerable: false
		});
	}

	window.Supervisor = Supervisor;
	window.supervisor = new Supervisor(window.document);
})(window);
