(function (window) {
	let SupervisorUtils = function (supervisor) {
		this.sv = supervisor;
		return this;
	};

	window.supervisor.factory('util', SupervisorUtils, {
		createNode: function (options, wrapper, next) {
			let self = this;
			// window.document *\o/*
			let node;
			if (options.tag) node = this.sv.document.createElement(options.tag)
			else if (wrapper) {
				node = wrapper;
				wrapper = undefined;
			} else return console.warn("No tag or wrapper node passed to createNode");

			if (options.class) self.addClass(node, options.class);
			if (options.text) node.innerText = options.text;
			if (options.value) node.value = options.value;
			if (options.id) node.id = options.id;
			if (options.attributes) self.setAttributes(node, options.attributes);
			if (options.styles) self.addStyles(node, options.styles);
			if (options.children) options.children.forEach(function (c) {
				let child;
				if (c instanceof HTMLElement) child = node.appendChild(c)
				else child = self.createNode(c, node, next);
				if ( c.return ) next = child;
			});
			if (wrapper) {
				if (wrapper instanceof Array) wrapper.forEach(function (w) {
					let n = node.cloneNode(true);	
					if (options.events) self.addEvents(n, options.events);
					w.appendChild(n);
				})
				else {
					if (options.events) self.addEvents(node, options.events);
					wrapper.appendChild(node);
				}
			}
			return next || node;
		},
		insertNode: function (index, options, wrapper) {
			let self = this;
			let node = self.createNode(options);
			let find = wrapper.firstChild;
			for (let i = 0; i < index; i++) {
				find = find.nextChild;
			}
			wrapper.insertBefore(node, find);
			return node;
		},
		clear: function (node) {
			((node instanceof Array) ? node : [ node ]).forEach(function (n) {
				n.innerHTML = '';
			});
			return self.sv;
		},
		setAttributes: function (node, attributes) {
			let self = this;
			((node instanceof Array) ? node : [ node ]).forEach(function (n) {
				for (let attr in attributes) {
					if (attr.match(new RegExp('^(disabled|required|selected|checked)$'))) n[attr] = attributes[attr];
					else n.setAttribute(attr, attributes[attr]);
				}
			});
			return self.sv;
		},
		removeAttributes: function (node, attributes) {
			let self = this;
			if (attributes instanceof Array) {
				attributes.forEach( function (a) {
					self.removeAttributes(node, a);
				});
				return self.sv;
			}
			((node instanceof Array) ? node : [node]).forEach(function (n) {
				n.removeAttribute(attributes);
			});
			return self.sv;
		},
		addStyles: function (node, styles) {
			let self = this;
			((node instanceof Array) ? node : [node]).forEach(function (n) {
				for (let style in styles) {
					n.style[style] = styles[style];
				}
			});
			return self.sv;
		},
		removeStyles: function (node, styles) {
			let self = this;
			((node instanceof Array) ? node : [node]).forEach(function (n) {
				styles.forEach(s => delete node.style[s]);
			});
			return self.sv;
		},
		addClass: function (node, cls) {
			let self = this;
			if (!node) return;
			if (cls instanceof Array) {
				cls.forEach(function (c) {
					self.addClass(node, c);	
				});
				return self.sv;
			}
			((node instanceof Array) ? node : [node]).forEach(function (n) {
				n.classList.add(cls);
			});
			return self.sv;
		},
		removeClass: function (node, cls) {
			let self = this;
			if (!node) return;
			if (cls instanceof Array) {
				cls.forEach(function (c) {
					self.removeClass(node, c);
				});
				return self.sv;
			}
			((node instanceof Array) ? node : [node]).forEach(function (n) {
				n.classList.remove(cls);
			});
			return self.sv;
		},
		addEvents: function (node, events) {
			let self = this;
			if (!node) return;
			((node instanceof Array) ? node : [node]).forEach(function (n) {
				for (let evt in events) {
					n.addEventListener(evt, events[evt]);
				}
			});
			return self.sv;
		},
		fetch: function (options) {
			// TODO fallback when fetch is not available!!!!
			let self = this;
			if (options.type.match(/^(POST|PUT|DELETE)$/)) {
				fetch(options.endpoint, {
					method: options.type, // or 'PUT'
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(options.params),
				})
				.then(response => response.json())
				.then(function (data) {
					//self.spinnerOff();
					if (options.cb) options.cb(data);
				})
				.catch(function (err) {
					console.log(err);
					//self.spinnerOff();
					if (options.ecb) options.ecb(err);
				});
			} else if (options.type == 'GET') {
				options.endpoint += self.urlEncode(options.params);
				fetch(options.endpoint)
				.then(response => response.json())
				.then(options.cb)
				.catch(options.ecb);
			}
		},
		urlEncode: function (params) {
			let string = '';
			if (!params) return string;
			for (let key in params) {
				if (string !== '') string += '&';
				string += key + '=' + encodeURIComponent(params[key]);
			}
			return '?' + string;
		},
		renderStyles: function (wrapper, styles) {
			let css = ':root { ';
			for (let style in styles) {
				css += style + ': ' + styles[style] + '; ';
			}
			css += '}';
			wrapper.innerText = css;
			return self.sf;
		},
		formData: function (form) {
			let self = this;
			let data = {}, error_fields = '';
		
			for (var i = 0; i < form.elements.length; i++) {
				var field = form.elements[i];
				self.triggerEvent("keyup", field);
				if (field.getAttribute('required')) self.triggerEvent("change", field);
				if ( field.name !== undefined && field.name !== '') {
					var val = (field.type == "radio" || field.type == "checkbox" ? (field.checked ? field.value !== "" && field.value !== 'on' ? field.value : true : false) : field.value);
					if ( val !== undefined && val !== '') data[field.name] = val;
				}
			
				if (field.getAttribute("data-error")) error_fields += (error_fields ? ', ' : '') + field.parentNode.querySelector('label').innerText;
			}
			return error_fields ? error_fields : data;
		},
		clearErrors: function (wrapper) {
			wrapper.querySelectorAll('.notify.error').forEach(n => n.remove());
			return this.sf;
		},
		raiseError: function (title, message, wrapper, placement) {
			this.notify('error', title, message, undefined, wrapper, placement);
		},
		notify: function (type, title, message, time, wrapper, placement) {
			let self = this;
			if (!wrapper) {
				time = 10000;
				wrapper = self.sv.document.querySelector('#raise-errors');
			}
			if (!placement) placement = 'append';
			let error = self.createNode({
				tag: "div",
				class: ["notify", type],
				children: [
					{
						tag: "h3",
						text: title
					},
					{
						tag: "div",
						text: message
					}
				]
			});
			if (placement == 'first') wrapper.insertBefore(error, wrapper.firstChild);
			else wrapper.appendChild(error);
			if (time) setTimeout(function () { error.remove(); }, time);
		},
		createObject: function (object, prototype) {
			for (let pro in prototype) {
				Object.defineProperty(object.prototype, pro, {
					value: prototype[pro],
					writable: false,
					configurable: false,
					enumerable: false
				});
			}
			return object;
		},
		generateUUID: function () {
           		var d = new Date().getTime();
			if(window.performance && typeof window.performance.now === "function"){
				d += performance.now();; //use high-precision timer if available
			}
			var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return 'a' + (c=='x' ? r : (r&0x3|0x8)).toString(16);
			});
			return 'a' +  uuid;
		},
		clone: function (data) {
			return JSON.parse(JSON.stringify(data));
		},
		renderModal: function (options) {
			let self = this;

			let overlay = self.createNode({
				tag: "div",
				class: "supervisor-modal-overlay"
			}, self.sv.document.body);

			let close = self.createNode({
				tag: "div",
				class: "supervisor-modal-close",
				children: [self.sv.icon.render("close")],
				events: {
					click: function (evt) {
						evt.preventDefault();
						overlay.remove();
					}
				}
			}, overlay);

			let modal = self.createNode({
				tag: "div",
				class: "supervisor-modal"
			}, overlay);
	
			let header = self.createNode({
				tag: "div",
				class: "supervisor-modal-header"
			}, modal);

			options.renderHeader.bind(self)(header)

			let body = self.createNode({
				tag: "div",
				class: "supervisor-modal-body"
			}, modal);

			options.renderBody.bind(self)(body);

			let footer = self.createNode({
				tag: "div",
				class: "supervisor-modal-footer"
			}, modal);

			options.renderFooter.bind(self)(footer);
		},
		triggerEvent: function (e, node) {
			if ("createEvent" in document) {
				var evt = document.createEvent("HTMLEvents");
				evt.initEvent(e, false, true);
				node.dispatchEvent(evt);
			}
			else node.fireEvent(e);
		},
		flat_merge: function (d1, d2) {
			let d3 = {};
			for ( let d in d1 ) d3[d] = d1[d];
			for ( let d in d2 ) d3[d] = d2[d];
			return d3;
		}
	});
})(window);
