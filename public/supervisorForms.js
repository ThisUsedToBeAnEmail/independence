(function (window) {
	let SupervisorForms = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, fields = {
		text: "renderTextField",
		number: "renderNumberField",
		checkbox: "renderCheckboxField",
		radio: "renderRadioField",
		date: "renderDateField",
		email: "renderEmailField",
		textarea: "renderTextareaField",
		select: "renderSelectField",
		switch: "renderSwitchField",
		daterange: "renderDateRangeField"
	};

	window.supervisor.factory('form', SupervisorForms, {
		render: function (options) {
			let self = this;
	
			if (options.title) {
				self.sv.util.createNode({
					tag: "h3",
					text: options.title
				}, options.wrapper);
			}

			if (options.description) {
				self.sv.util.createNode({
					tag: "p",
					text: options.description
				}, options.wrapper);
			}

			let events;
			if (options.submit) {
				events = { submit: options.submit };
			}

			let form = self.sv.util.createNode({
				tag: "form",
				id: options.id,
				events: events,
				attributes: {
					autofocus: true
				}
			}, options.wrapper);

			options.fields.forEach(f => self.renderField(form, f, options));
		},
		renderField: function (form, field, options) {
			let self = this;

			if ( field.no_render || field.field && field.field.type == "none") return;
			
			let form_field = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-form-field",
				children: [
					{
						tag: "label",
						text: self.sv.locale[options.locale_section][field.name]()
					},	
				]
			}, form);

			let element;
			if ( field.field ) {
				field.field.type ||= "text";
				element = self[fields[field.field.type]](form_field, field, options);
			} else element = self.renderTextField(form_field, field, options);
		
			let field_events = {};

			field_events.keyup = function (evt) {
				self.clearFieldError(evt)
				let valid = self.noXSS(evt);
				if (valid instanceof Array && !valid[0]) {
					self.renderFieldError(evt, valid, options);
					return;
				}

				if (((field.field || {}).attributes || {}).required) {
					let valid = self.required(evt);
					if (valid instanceof Array && !valid[0]) {
						self.renderFieldError(evt, valid, options);
						return;
					}
				}

				if ((field.field || {}).validate) {
					if (evt.target.value) {
						console.log(field);
						let valid = self[field.field.validate](evt);
						console.log(valid);
						if (valid instanceof Array && !valid[0]) {
							console.log('kaput');
							self.renderFieldError(evt, valid, options);
						}
					}
				}
			};

			self.sv.util.addEvents(element, field_events);

			self.sv.util.createNode({
				tag: "p",
				text: self.sv.locale[options.locale_section][field.name + '_info']()	
			}, form_field);
		},
		buildAttributes: function (field, options, type) {
			let self = this;
			let attributes = (field.field && field.field.attributes) || {};
			attributes.name = field.name;
			if (type) attributes.type = type;
			if (! field.field ) return attributes;
			if (options.mode == 'create' && field.field.createable) self.sv.util.flat_merge(attributes, field.field.createable.attributes);
			if (options.mode == 'edit' && field.field.editable) self.sv.util.flat_merge(attributes, field.field.editable.attributes);
			return attributes;
		},
		renderInputField: function (type, field, f, options) {
			let self = this;
			let attributes = self.buildAttributes(f, options, type);	
			return self.sv.util.createNode({
				tag: "input",
				value: options.data[f.name],			
				attributes: attributes,
				events: f.events
			}, field);
		},
		renderTextField: function (field, f, options) {
			return this.renderInputField('text', field, f, options);	
		},
		renderNumberField: function (field, f, options) {
			return this.renderInputField('number', field, f, options);	
		},
		renderCheckboxField: function (field, f, options) {
			return this.renderInputField('checkbox', field, f, options);	
		},
		renderRadioField: function (field, f, options) {
			return this.renderInputField('radio', field, f, options);	
		},
		renderDateField: function (field, f, options) {
			return this.renderInputField('date', field, f, options);	
		},
		renderEmailField: function (field, f, options) {
			return this.renderInputField('email', field, f, options);	
		},
		renderTextareaField: function (field, f, options) {
			let self = this;
			let attributes = self.buildAttributes(f, options);
			return self.sv.util.createNode({
				tag: "textarea",
				value: options.data[f.name],
				attributes: attributes
			}, field);
		},
		renderSelectField: function (field, f, options) {
			let self = this;
			
			let opts = [];
			f.field.options.forEach(function (o) {
				opts.push({
					tag: "option",
					name: f.name,
					value: o,
					text: self.sv.locale[options.locale_section][o]()
				});
			});

			let attributes = self.buildAttributes(f, options);

			return self.sv.util.createNode({
				tag: "select",
				value: options.data[f.name],
				attributes: attributes,
				events: f.events,
				children: opts
			}, field);
		},
		renderSwitchField: function (field, f, options) {
			let self = this;
			
			let attributes = self.buildAttributes(f, options, "checkbox");
		
			attributes.checked = options.data[f.name];
	
			return self.sv.util.createNode({
				tag: "label",
				class: "supervisor-switch",
				children: [
					{
						tag: "input",
						attributes: attributes,
						return: true,
						events: f.events || {}
					},
					{
						tag: "span",
					}
				]
			}, field);
		},
		renderDateRangeField: function (field, f, options) {
			let self = this;

			
			
		},
		renderSubmitField: function (field, options) {
			let self = this;

			return self.sv.util.createNode({
				tag: "input",
				value: options.value || "Save",
				attributes: {
					type: "submit"
				},
				events: options.events
			}, field);
		},
		renderCancelField: function (field, options) {
			let self = this;

			return self.sv.util.createNode({
				tag: "input",
				value: options.value || "Cancel",
				attributes: {
					type: "button"
				},
				events: options.events
			}, field);
		},
		required: function (evt) {
			let self = this;
				
			if (evt.target.value == "" || evt.target.value === undefined || evt.target.value === null)
				return [false, self.sv.locale.application.required()];

			return true;
		},
		integer: function (evt) {
			let self = this;
			let value = evt.target.value;
			return value.match(/^\d+$/) ? true : [false, self.sv.locale.application.integer({ value: value })];
		},
		float: function (evt) {
			let self = this;
			let value = evt.target.value;
			return value.match(/^\d+\.\d+$/) ? true : [false, self.sv.locale.application.float({ value: value })];
		},
		email: function (evt) {
			let self = this;
			let value = evt.target.value;
			console.log(value);
			return value.match(/^[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|"[^\\\x80-\xff\n\015"]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015"]*)*")[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:\.[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|"[^\\\x80-\xff\n\015"]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015"]*)*")[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)*@[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:\.[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)*|(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|"[^\\\x80-\xff\n\015"]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015"]*)*")[^()<>@,;:".\\\[\]\x80-\xff\000-\010\012-\037]*(?:(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)|"[^\\\x80-\xff\n\015"]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015"]*)*")[^()<>@,;:".\\\[\]\x80-\xff\000-\010\012-\037]*)*<[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:@[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:\.[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)*(?:,[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*@[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:\.[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)*)*:[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)?(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|"[^\\\x80-\xff\n\015"]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015"]*)*")[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:\.[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|"[^\\\x80-\xff\n\015"]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015"]*)*")[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)*@[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:\.[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*(?:[^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff]+(?![^(\040)<>@,;:".\\\[\]\000-\037\x80-\xff])|\[(?:[^\\\x80-\xff\n\015\[\]]|\\[^\x80-\xff])*\])[\040\t]*(?:\([^\\\x80-\xff\n\015()]*(?:(?:\\[^\x80-\xff]|\([^\\\x80-\xff\n\015()]*(?:\\[^\x80-\xff][^\\\x80-\xff\n\015()]*)*\))[^\\\x80-\xff\n\015()]*)*\)[\040\t]*)*)*>)$/) ? true : [false, self.sv.locale.application.email({ value: value })];
		},
		phone: function (evt) {
			let self = this;
			let value = evt.target.value;
			return value.match(/\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/) ? true : [false, self.sv.locale.application.phone({ value: value })];
		},
		noXSS: function (evt) {
			let self = this;
			var fragment = document.createDocumentFragment();
			var node = fragment.appendChild(document.createElement('div'));
			node.innerHTML = evt.target.value;
			for (var c = node.childNodes, i = c.length; i--;) {
				if (c[i].nodeType != 3) return [false, self.sv.locale.application.noXSS()];
			}
			return true;
		},
		clearFieldError: function (evt) {
			let self = this;
			let has_error = evt.target.getAttribute("data-error");
			if (!has_error) return;
			let err = self.sv.document.querySelector('#' + has_error);
			err.remove();
			evt.target.removeAttribute("data-error");
		},
		renderFieldError: function (evt, error, options) {
			let self = this;
			let uuid = self.sv.util.generateUUID();
		
			
			let style = {}, style2 = {};

			if (options.errors == "above_field") {
				style.top = "-20%";
				style2["margin-top"] = "-5.5em";
				style2["box-shadow"] = "inset -2px -2px 5px var(--application-form-field-error-box-color-1), -2px -2px 5px var(--application-form-field-error-box-color-2)";
			}

			let element = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-field-error",
				id: uuid,
				styles: style,
				children: [
					{
						tag: "div",
						class: "supervisor-field-error-pointer"
					},
					{
						tag: "div",
						class: "supervisor-field-error-text",
						styles: style2,
						children: [
							{
								tag: "span",
								text: error[1]
							}
						]
					}
				]
			});

			evt.target.setAttribute("data-error", uuid);
			evt.target.parentNode.insertBefore(element, evt.target.nextElementSibling);

		}	
	});
})(window);
