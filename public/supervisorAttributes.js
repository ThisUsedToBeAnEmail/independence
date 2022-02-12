(function (window) {
	let SupervisorAttributes = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, SupervisorLocales = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, SupervisorIcons = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, data = {
		api: {}
	};

	let proto = {
		setData: function (options) {
			if (options) {
				for (let key in options) {
					data[key] = options[key];
				}
			}
		},
		gs: function (key, val) {
			if (val) data[key] = val;
			return data[key];
		},
		lgs: function (level, key, val) {
			if (val) data[level][key] = val;
			return data[level][key];
		},
		mgs: function (level, keys, val) {
			let nested = data[level];
			keys.forEach(function(k, index) { if (keys.length - 1 !== index) nested = nested[k] });
			let key = keys[keys.length - 1];
			if (val) nested[key] = val;
			return nested[key];
		},
		gsApi: function (key, val) {
			return this.lgs('api', key, val);
		},
		gsImage: function (key, val) {
			return this.lgs('images', key, val);
		},
		gsLocale: function (keys, val) {
			return this.mgs('locales', keys, val);
		},
		gsColors: function (key, val) {
			return this.lgs('colors', key, val);
		}
	};

	[
		"organisation",
		"menu",
		"show_errors"
	].forEach(function (k) {
		proto[k] = function (val) {
			return proto.gs(k, val);
		};
	});

	[
		"authentication",
		"login",
		"logout"
	].forEach(function (k) {
		proto[k] = function (val) {
			return proto.gsApi(k, val);
		};
	});

	// THESE ARE SET DYNAMICALLY BY CODE AND NOT VIA THE CONFIG, THEY WILL OFTEN CONTAIN HTMLNODES/ELEMENTS.
	[
		"application_wrapper",
		"menu_wrapper",
		"user_page",
		"person_page",
		"monitor_page",
		"home_page"
	].forEach(function (k) {
		proto[k] = function (val) {
			return proto.gs(k, val);
		};
	});

	window.supervisor.factory('attribute', SupervisorAttributes, proto);

	let proto2 = {};

	[
		[
			"application",
			[
				"title",
				"required",
				"integer",
				"float",
				"email",
				"phone",
				"noXSS",
				"form_validation_error_title",
				"form_validation_error_description"
			]
		],
		[
			"login_page",
			[
				"username",
				"password",
				"login"
			]
		],
		[
			"nav_menu",
			[
				"home",
				"monitor",
				"person",
				"create_person",
				"user",
				"create_user",
			]
		],
		[
			"cards",
			[
				"ascending",
				"descending",
				"first",
				"prev",
				"next",
				"last",
				"filter",
				"sort",
				"create"
			]
		],
		[
			"user_cards",	
			[
				"cards_title",
				"cards_description",
				"create_modal_header",
				"create_modal_title",
				"create_modal_description",
				"create_modal_error_title",
				"create_modal_error_description",
				"create_modal_success_title",
				"create_modal_success_description",
				"edit_modal_header",
				"edit_modal_title",
				"edit_modal_description",
				"edit_modal_error_title",
				"edit_modal_error_description",
				"edit_modal_success_title",
				"edit_modal_success_description",
				"delete_modal_header",
				"delete_modal_title",
				"delete_modal_description",
				"delete_modal_error_title",
				"delete_modal_error_description",
				"delete_modal_success_title",
				"delete_modal_success_description",
				"id",
				"username",
				"first_name",
				"last_name",
				"email",
				"admin",
				"active",
				"mobile",
				"landline",
				"address_line_1",
				"address_line_2",
				"address_line_3",
				"address_line_4",
				"last_login",
				"last_action",
				"id_info",
				"username_info",
				"first_name_info",
				"last_name_info",
				"email_info",
				"admin_info",
				"active_info",
				"mobile_info",
				"landline_info",
				"address_line_1_info",
				"address_line_2_info",
				"address_line_3_info",
				"address_line_4_info",
				"last_login_info",
				"last_action_info"
			]
		]
	].forEach(function (k) {
		let [key, keys] = [k[0], k[1]];
		proto2[key] = {}
		keys.forEach(function (k) {
			proto2[key][k] = function (data, locale, val) {
				locale ||= proto.gs('default_locale');
				let str = proto.gsLocale([key, k], val)[locale];
				str = str.replace(/\[\%\s*(\S*)\s*\%\]/g, function (a, b) {
					return data[b] || b;
				});
				return str;
			};
		});
	});

	window.supervisor.factory('locale', SupervisorLocales, proto2);

	let proto3 = {
		render: function (type) {
			let self = this;
			let base = data.icons.base_class, icon = data.icons[type];
			if (base == "text") {
				return self.sv.util.createNode({
					tag: "i",
					text: icon
				});
			} else {
				let classes = base.split(" ");
				classes.push(icon);
				return self.sv.util.createNode({
					tag: "i",
					class: classes
				});
			}

		}
	};

	window.supervisor.factory("icon", SupervisorIcons, proto3);

})(window);
