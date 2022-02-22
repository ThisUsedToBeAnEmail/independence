(function (window) {
	let prototype = {
		init: function (attribute) {
			let self = this;
			self.attribute.setData(conf);
			self.util.renderStyles(this.document.querySelector('#dynamic-styles'), conf.colors);
			window.addEventListener("hashchange", self.changePage.bind(self), false);
			self.checkLogin();
		},
		checkLogin: function (options) {
			let self = this;
			self.util.fetch({
				type: "GET",
				endpoint: self.attribute.authentication(),
				cb: function (res) {
					if (! res.authenticated) {
						return self.renderLogin();
					}
					return self.renderApplication();
				}
			});
		},
		renderLogin: function () {
			let self = this;
			// render the login page

			let wrapper = self.util.createNode({
				tag: "div",
				id: "login",
				class: "full-screen"
			}, this.document.body);
			
			let form = self.util.createNode({
				tag: "form",
				attributes: {
					type: "POST",
				},
				events: {
					submit: function (evt) {
						evt.preventDefault();
						let data = self.util.formData(evt.target);
						if (!data.password) return self.util.raiseError('Failed to login', 'Please insert a valid password before you submit the form.', wrapper, 'first');
						self.util.fetch({
							type: "POST",
							endpoint: self.attribute.login(),
							params: data,
							cb: function (res) {
								if (! res.authenticated) {
									evt.target.querySelector('input[name="password"]').value = '';
									self.util.clearErrors(wrapper);
									self.util.raiseError("Failed to login", "Re-insert your credentials to try again.", wrapper, 'first');
									return;
								}
								self.removeLogin();
								self.renderApplication();
							},
							ecb: function (res) {
								evt.target.querySelector('input[name="password"]').value = '';
								self.util.clearErrors(wrapper);
								self.util.raiseError("Failed to login", "Re-insert your credentials to try again.", wrapper, 'first');
							}
						});
					}
				}
			}, wrapper);

			self.util.createNode({
				tag: "h2",
				class: "login-header",
				text: self.locale.application.title()
			}, form);

			self.util.createNode({
				tag: "img",
				class: "organisation-logo",
				attributes: {
					src: "/test.jpeg"
				} 
			}, form);

			self.util.createNode({
				tag: "div",
				class: ["form-field", "border-top"],
				children: [
					{
						tag: "label",
						text: self.locale.login_page.username()
					},
					{
						tag: "input",
						attributes: {
							type: "text",
							name: "username"
						}
					}
				]
			}, form);

			self.util.createNode({
				tag: "div",
				class: "form-field",
				children: [
					{
						tag: "label",
						text: self.locale.login_page.password()
					},
					{
						tag: "input",
						attributes: {
							type: "password",
							name: "password"
						}
					}
				]
			}, form);

			self.util.createNode({
				tag: "div",
				class: ["form-field", "pb-0"],
				children: [
					{
						tag: "input",
						attributes: {
							type: "submit"
						},
						text: self.locale.login_page.login()
					}
				]
			}, form);
		},
		removeLogin: function (options) {
			// remove the login after successfull login!
			this.document.querySelector('#login').remove();
		},
		renderApplication: function (options) {
			let self = this;

			self.attribute.application_wrapper(self.util.createNode({
				tag: "div",
				class: ["main", "full-screen"]
			}, self.document.body));

			self.renderMenu();
			// will probably need to add some events or something here
		},
		renderMenu: function (active, pages) {
			let self = this;

			active ||= 'home';
			pages ||= self.attribute.menu();

			self.attribute.menu_wrapper(self.util.createNode({
				tag: "div",
				id: "main-menu"
			}, self.attribute.application_wrapper()));

			pages.forEach(p => self.renderMenuItem(active, p));
		},
		renderMenuItem: function (active, page) {
			let self = this;
			console.log(page);
			let item = self.util.createNode({
				tag: "div",
				class: "menu-item",
				attributes: {
					"data-action": page.action,
					"data-page": page.page
				},
				children: [
					{
						tag: "a",
						attributes: {
							href: "#" + page.page
						},
						text: self.locale.nav_menu[page.page]()
					}
				]
			}, self.attribute.menu_wrapper());

			self[page.action](page);
	
			if (active == page.page) window.location.hash = '#' + page.page;
		},
		changePage: function () {
			let self = this;
			var page = window.location.hash.replace('#', '');
			if (! page) return;
			self.util.removeClass(self.attribute.menu_wrapper().querySelector('.menu-item.active'), 'active');
			self.util.addClass(self.attribute.menu_wrapper().querySelector('.menu-item[data-page="' + page + '"]'), 'active');
			self.util.removeClass(self.attribute.application_wrapper().querySelector('.application-page.active'), 'active');
			self.util.addClass(self.attribute[page + "_page"](), 'active');
		},
		renderHomePage: function () {
			let self = this;
			self.attribute.home_page(self.util.createNode({
				tag: "div",
				class: "application-page",
				id: "home_page"
			}, self.attribute.application_wrapper()));
		},
		renderMonitorPage: function () {
			let self = this;
			self.attribute.monitor_page(self.util.createNode({
				tag: "div",
				class: ["application-page", "p0"],
				id: "monitor_page"
			}, self.attribute.application_wrapper()));

			let wrapper = self.util.createNode({
				tag: "div",
				class: "monitor-wrapper",
			}, self.attribute.monitor_page());

			self.chat.create(wrapper, {
				endpoint: 'ws://localhost:3000/monitor/ws',
			});
		},
		renderAdminRoomPage: function () {
			let self = this;

			self.attribute.admin_room_page(self.util.createNode({
				tag: "div",
				class: ["application-page", "p0"],
				id: "admin_room_page"
			}, self.attribute.application_wrapper()));


		},
		renderRequestPage: function () {
			let self = this;
			self.attribute.request_page(self.util.createNode({
				tag: "div",
				class: "application-page",
				id: "request_page"
			}, self.attribute.application_wrapper()));

			let wrapper = self.util.createNode({
				tag: "div",
				class: "card-wrapper",
			}, self.attribute.request_page());

			var cards = self.cards.create(wrapper, {
				icon_mode: true,
				locale_section: 'all_request_cards',
				remove_empty: true,
				createable: {
					type: "POST",
					endpoint: "/requests/create",
					id: "create-request-form"
				},
				editable: {
					type: "POST",
					endpoint: "/requests",
					header_field: "title",
					id: "edit-request-form"
				},
				deleteable: {
					type: "DELETE",
					endpoint: "/requests",
					header_field: "title",
				},
				fetch_data: { // TODO add support for serverside filters/sorting/streaming
					method: "GET",
					endpoint: "/requests",
				},	
				pagination: {},
				headers:[
 					{
						name: "id",
						no_render: true,
						sortable: true,
						filterable: true,
					},
					{
						name:"title",
						sortable: { active: true, direction: "desc" },
						filterable: true,
						field: {
							attributes: {
								required: true,
							},
						}
					},
					{
						name: "description",
						sortable: true,
						filterable: true,
						field: {
							attributes: {
								required: true,
							}
						}
					},
					{
						name: "priority",
						sortable: true,
						filterable: true,
						field: {
							attributes: {
								required: true,
							}
						}
					}
				],
			});
		},
		renderUserPage: function () {
			let self = this;
			self.attribute.user_page(self.util.createNode({
				tag: "div",
				class: "application-page",
				id: "user_page"
			}, self.attribute.application_wrapper()));

			let wrapper = self.util.createNode({
				tag: "div",
				class: "card-wrapper",
			}, self.attribute.user_page());
	
			var cards = self.cards.create(wrapper, {
				icon_mode: true,
				locale_section: 'user_cards',
				remove_empty: true,
				createable: {
					type: "POST",
					endpoint: "/users/create",
					id: "create-user-form"
				},
				editable: {
					type: "POST",
					endpoint: "/users",
					header_field: "username",
					id: "edit-user-form"
				},
				deleteable: {
					type: "DELETE",
					endpoint: "/users",
					header_field: "username",
				},
				fetch_data: { // TODO add support for serverside filters/sorting/streaming
					method: "GET",
					endpoint: "/users",
				},	
				pagination: {},
				headers:[
 					{
						name: "id",
						no_render: true,
						sortable: true,
						filterable: true,
					},                
					{
						name:"username",
						sortable: { active: true, direction: "desc" },
						filterable: true,
						field: {
							attributes: {
								required: true,
							},
							editable: {
								attributes: {
									readonly: true
								}
							}
						}
					},
					{
						name: "first_name",
						sortable: true,
						filterable: true,
						field: {
							attributes: {
								required: true,
							}
						}
					},
					{
						name: "last_name",
						sortable: true,
						filterable: true,
						field: {
							attributes: {
								required: true,
							}
						}
					},
					{
						name: "email",
						sortable: true,
						filterable: true,
						field: {
							type: "email",
							validate: "email",
							attributes: {
								required: true
							}
						}
					},
					{
						name: "admin",
						type: "boolean",
						sortable: true,
						filterable: true,
						field: {
							type: "switch"
						}
					},
					{
						name: "active",
						type: "boolean",
						sortable: true,
						filterable: true,
						field: {
							type: "switch"
						}
					},
					{
						name: "mobile",
						filterable: true,
						field: {
							validate: "phone"
						}
					},
					{
						name: "landline",
						filterable: true,
						field: {
							validate: "phone"
						}
					},
					{
						name: "address_line_1",
						filterable: true
					},
					{
						name: "address_line_2",
						filterable: true
					},
					{
						name: "address_line_3",
						filterable: true
					},
					{
						name: "address_line_4",
						filterable: true
					},
					{
						name: "last_login",
						format: "YYYY-MM-DD hh:mm:ss",
						sortable: true,
						filterable: true,
						field: {
							type: "none"
						}
					},
					{
						name: "last_action",
						format: "YYYY-MM-DD hh:mm:ss",
						sortable: true,
						filterable: true,
						field: {
							type: "none"
						}
					}
				],
			});

		},
	};

	window.supervisor.factory('', window.Supervisor, prototype);
})(window);
