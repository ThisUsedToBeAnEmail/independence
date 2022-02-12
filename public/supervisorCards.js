(function (window) {
	let MinimalCards = function (wrapper, options, supervisor) {
		let self = this;
		self.wrapper = wrapper;
		
		if (options.pagination) {
			if ( !(options.pagination instanceof Object) ) options.pagination = {};
			if ( !options.pagination.length ) options.pagination.length = 10;
			self.current_page = 1;
		}

		options.headers.forEach(function (h) {
			if (h.sortable) {
				if (!(h.sortable instanceof Object)) {
					h.sortable = {};
				} else if ( h.sortable.active ) {
					self.current_sort_column = h;
				}
			}
			if (h.filterable) {
				if (!(h.filterable instanceof Object)) {
					h.filterable = {};
				} else if ( h.filterable.active ) {
					self.current_filter_column = h;
				}
			}
		});
		
		if ( ! self.current_sort_column ) {
			self.current_sort_column = options.headers.find(h => h.sortable);
			self.current_sort_column.sortable.active = true;
			self.current_sort_column.sortable.direction = 'asc';
		}
		if ( ! self.current_filter_column ) {
			self.current_filter_column = options.headers.find(h => h.filterable);
			self.current_filter_column.filterable.active = true;
		}
		self.options = options;
		self.data = options.data || [];
		self.sv = supervisor;
		
		["pagination", "pagination_first", "pagination_prev", "pagination_last", "pagination_next"].forEach(function (c) {
			self[c] = [];
		});
		
		self.init();
	}, SupervisorCards = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, context = {}, current;

	window.supervisor.util.createObject(MinimalCards, {
		init: function () {
			let self = this;
			if ( self.options.fetch_data ) {
				self.sv.util.fetch({
					type: "GET",
					endpoint: self.options.fetch_data.endpoint,
					cb: function (res) {
						self.data = self.options.data = res.data;
						self.create();
					}
				});
			} else if ( self.options.serverside ) {

			} else self.create();
		},
		create: function () {
			let self = this;
		
			self.card = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card"
			}, self.wrapper);

			self.renderHeader();
			self.renderBody();
			self.renderFooter();
		},
		renderHeader: function () {
			let self = this;

			let title = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-title",
				children: [
					{
						tag: "h1",
						text: self.sv.locale[self.options.locale_section].cards_title()
					},
					{
						tag: "p",
						text: self.sv.locale[self.options.locale_section].cards_description()
					}
				]
			}, self.card);

			let header = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-header",
			}, self.card);

			let pc = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-header-pagination-create"
			}, header);
			
			if (self.options.pagination) {
				self.header_pagination = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-card-header-pagination"
				}, pc);
				self.renderPagination(self.header_pagination);
			}

			self.sv.util.createNode({
				tag: "button",
				text: "+ " + self.sv.locale.cards.create(),
				events: {
					click: function (evt) {
						evt.preventDefault();
						self.renderCreateModal();
					}
				}
			}, pc);

			let header_sf = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-header-sort-filter"
			}, header);

			let sort_options = [];
			let filter_options = [];
			self.options.headers.forEach(function (h) {
				let o = {
					tag: "option",
					value: h.name,
					text: self.sv.locale[self.options.locale_section][h.name](),
					attributes: {}
				};
				if (h.sortable) {
					if (self.current_sort_column.name == h.name) o.attributes.selected = true;
					sort_options.push(o);
					delete o.attributes.selected;
				}
				if (h.filterable) {
					if (self.current_filter_column.name == h.name) o.attributes.selected = true;
					 filter_options.push(o);
				}
			});
			
			self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-sort",
				children: [
					{
						tag: "label",
						text: self.sv.locale.cards.sort()
					},
					{
						tag: "select",
						class: "supervisor-card-sort-header",
						children: sort_options,
						events: {
							change: function (evt) {
								//evt.preventDefault();
								let value = evt.target.value;
								let current = self.current_sort_column;
								current.sortable.active = false;
								let next = self.options.headers.find(n => n.name === value);
								next.sortable.direction = current.sortable.direction;
								next.sortable.active = true;
								self.current_sort_column = next;
								self.redrawCards();
							}
						}
					},
					{
						tag: "select",
						class: "supervisor-card-sort-header-direction",
						children: [
							{
								tag: "option",
								text: self.sv.locale.cards.ascending(),
								value: "asc",
								attributes: {
									selected: self.current_sort_column.sortable.direction == 'asc' ? true : false
								}
							},
							{
								tag: "option",
								text: self.sv.locale.cards.descending(),
								value: "desc",
								attributes: {
									selected: self.current_sort_column.sortable.direction == 'desc' ? true : false
								}
							}
						],
						events: {
							change: function (evt) {
								evt.preventDefault();
								self.current_sort_column.sortable.direction = evt.target.value;
								self.redrawCards();
							}
						}
					}
				]
			}, header_sf);
	
			self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-filter",
				children: [
					{
						tag: "label",
						text: self.sv.locale.cards.filter()
					},
					{
						tag: "select",
						class: "supervisor-card-filter-header",
						children: filter_options,
						events: {
							change: function (evt) {
								// evt.preventDefault();
								let value = evt.target.value;
								let current = self.options.headers.find(n => n.filterable && n.filterable.active);
								current.filterable.active = false;
								let next = self.options.headers.find(n => n.name === value);
								next.filterable.text = current.filterable.text;
								next.filterable.active = true;
								self.current_filter_column = next;
								self.redrawCards();
							}
						}
					},
					{
						tag: "input",
						attributes: {
							type: "search",
						},
						events: {
							keyup: function (evt) {
								let value = evt.target.value;
								// TODO some check for valid input.
								self.current_filter_column.filterable.text = value;
								self.redrawCards();
							}
						}
					}
				]
			}, header_sf);
		
		},
		renderBody: function () {
			let self = this;

			self.body = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-body"
			}, self.card);

			if (self.options.data) self.renderRows(self.options.data);
		},
		renderFooter: function () {
			let self = this;

			if (self.options.pagination) {
				let footer = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-card-footer"
				}, self.card);
				self.renderPagination(footer);
			}
		},
		renderRows: function (data) {
			let self = this;
			
			if (!data) data = self.data;			

			if ( !self.options.serverside ) {
				let filter_column = self.current_filter_column;
				if (
					!self.currently_filtered
						|| self.currently_filtered.name !== filter_column.name 
						|| self.currently_filtered.filterable.text !== filter_column.filterable.text
				) {
					if (filter_column.filterable.text == "" || filter_column.filterable.text == undefined)
						self.filtered_data = undefined;
					else { 
						data = data.filter(a => new String(a[filter_column.name]).match(new RegExp(filter_column.filterable.text)));
						self.currently_filtered = self.sv.util.clone(filter_column);
						self.filtered_data = data;
					}
				} else data = self.filtered_data;			

				let sort_column = self.current_sort_column;
				if (
					!self.currently_sorted 
						|| self.currently_sorted.name !== sort_column.name 
						|| self.currently_sorted.sortable.directrion !== sort_column.sortable.direction
				) {
					let [ret1, ret2] = sort_column.sortable.direction == 'asc' ? [ 1, -1] : [-1, 1];

					data = data.sort(function (a, b) {
						if ( a[sort_column.name] > b[sort_column.name] ) {
							return ret1;
						}
						return ret2;
					});

					if (filter_column.filterable.text) self.filtered_data = data;
					else self.data = data;

					self.currently_sorted = self.sv.util.clone(sort_column);
				}
				
				
			}

			if (self.options.pagination) {
				if (self.options.pagination.fit_on_screen) {

				} else {
					let current_page = self.current_page;
					let length = self.options.pagination.length;
					let start = length * (current_page - 1);
					for (let i = start; i < start + length; i++) {
						if (!data[i]) break;
						self.renderRow(data[i]);
					}
					self.redrawPagination();
				}
			} else { 
				data.forEach(d => self.renderRow(d));
			}
		},
		renderRow: function (row) {
			let self = this;

			let wrapper_classes = ["supervisor-card-row"];
			if (self.options.editable) wrapper_classes.push("supervisor-card-row-editable");

			let children = [];

			if (self.options.deleteable) {
				children.push({
					tag: "div",
					class: "supervisor-card-row-delete",
					children: [
						{
							tag: "button",
							text: "⌦ Delete",
							events: {
								click: function (evt) {
									evt.preventDefault();
									evt.stopPropagation();
									self.renderDeleteModal(row);
								}
							}
						}
					]
				});
			}

			children.push({
				tag: "div",
				return: true,
				class: "supervisor-card-row-content"
			});

			let r = self.sv.util.createNode({
				tag: "div",
				class: wrapper_classes,
				events: {
					click: function (evt) {
						evt.preventDefault();
						self.renderEditModal(row);
					}
				},
				children: children
			}, self.body);

			self.options.headers.forEach(function (h) {
				self.renderRowCell(r, h, row, 0);
			});
		},
		renderRowCell: function (wrapper, header, row, no_info) {
			let self = this;
			if (header.no_render) return;
			if (self.options.remove_empty && (row[header.name] === undefined || row[header.name] == '')) return;

			let attr = {}, info = self.sv.locale[self.options.locale_section][header.name + "_info"]();
			if (!no_info && info) attr["data-tooltip-inline"] = info;

			let cell = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-row-cell",
				children: [
					{
						tag: "b",
						class: "supervisor-card-row-header",
						text: self.sv.locale[self.options.locale_section][header.name]() + ':',
						attributes: attr
					},
					{
						tag: "span",
						text: row[header.name]
					}
				]
			}, wrapper);
		},
		renderPagination: function (wrapper) {
			let self = this;		
		
			let length = self.options.pagination.length;
			let filtered = self.options.pagination.filtered;
			if ( ! filtered ) filtered = self.data.length;
			let total_pages = Math.ceil(filtered / length) || 1;

			self.pagination_first.push(self.sv.util.createNode({ 
				tag: "button",
				children: self.iconOrText('first'),
				attributes: {
					"disabled": true
				},
				events: {
					"click": function (evt) {
						evt.preventDefault();
						self.current_page = 1;
						self.redrawCards();
					}
				}
			}, wrapper));

			self.pagination_prev.push(self.sv.util.createNode({ 
				tag: "button",
				children: self.iconOrText('prev'),	
				attributes: {
					"disabled": true
				},
				events: {
					"click": function (evt) {
						evt.preventDefault();
						self.current_page--;
						self.redrawCards();
					}
				}
			}, wrapper));

			self.pagination.push(self.sv.util.createNode({
				tag: "div",
				class: "supervisor-card-pagination"
			}, wrapper));

			self.renderPaginationPages(total_pages);

			self.pagination_next.push(self.sv.util.createNode({ 
				tag: "button",
				children: self.iconOrText('next'),	
				attributes: {
					"disabled": total_pages > 1 ? false : true
				},
				events: {
					"click": function (evt) {
						evt.preventDefault();
						self.current_page++;
						self.redrawCards();
					}
				}
			}, wrapper));

			self.pagination_last.push(self.sv.util.createNode({ 
				tag: "button",
				children: self.iconOrText('last'),	
				attributes: {
					"disabled": total_pages > 1 ? false : true
				},
				events: {
					"click": function (evt) {
						evt.preventDefault();
						self.current_page = self.total_pages;
						self.redrawCards();
					}
				}
			}, wrapper));

			let options = self.calculateLengthOptions();

			self.sv.util.createNode({
				tag: "select",
				class: "pagination",
				children: options,
				events: {
					change: function (evt) {
						self.options.pagination.length = parseInt(evt.target.value);

						let new_total = self.options.pagination.total_pages || Math.ceil(self.data.length / self.options.pagination.length) || 1;
						if (self.current_page > new_total) self.current_page = new_total;

						self.card.querySelectorAll('.pagination option[value="' + evt.target.value + '"]').forEach(function (p) {
							p.selected = true;
						});
						self.redrawCards();	
					}
				}
			}, wrapper);

		},
		renderPaginationPages: function (total_pages) {
			let self = this;
				
			self.total_pages = total_pages;
	
			self.sv.util.clear(self.pagination);
			
			console.dir(self.sv.document.body.clientWidth);
			
			let show = self.sv.document.body.clientWidth > 500 ? 7 : 3;

			let half = ((show - 1) / 2);

			let start = self.current_page - half, last = self.current_page + half;

			if (start <= 0) {
				start = 1;
				last = show;
			}

			if (last >= total_pages) {
				last = total_pages;
				start = (last - show) + 1;
				if (start <= 0) start = 1;
			}
	
			for (let i = start; i <= last; i++) {
				let p = {
					tag: "button",
					text: i,
					events: {
						click: function (evt) {
							evt.preventDefault();
							self.current_page = parseInt(evt.target.innerText);
							self.redrawCards();	
						}
					}
				};
		
				if ( i == self.current_page ) {
					p.class = "supervisor-current-page";
				}
	
				self.sv.util.createNode(p, self.pagination);
			}
		},
		calculateLengthOptions: function () {
			let self = this;
			// todo calculate based on screen width
			let options = [];
			[5, 10, 15, 20, 25, 30].forEach(function (n) {
				let o = {
					tag: "option",
					text: n,
					value: n
				};
				if (self.options.pagination.length == n) {
					o.attributes = {}; 
					o.attributes.selected = true;
				}
				options.push(o);
			});
			return options;
		},
		redrawCards: function () {
			let self = this;
			self.body.innerHTML = '';
			if (self.options.serverside) {
				// TODO ajax/fetch logic here 
			} else {
				self.renderRows();
			}
		},
		redrawPagination: function () {
			let self = this;

			let length = self.options.pagination.length;
			let cp = self.current_page;

			let total = self.options.pagination.total;
			let filtered = self.options.pagination.filtered;

			if ( ! total ) total = filtered = self.data.length;

			let tp = Math.ceil(filtered / length) || 1;

			self.renderPaginationPages(tp);
		
			if (cp == 1) {
				self.sv.util.setAttributes(self.pagination_first, { disabled:  true });
				self.sv.util.setAttributes(self.pagination_prev, { disabled: true });
			} else {
				self.sv.util.setAttributes(self.pagination_first, { disabled: false });
				self.sv.util.setAttributes(self.pagination_prev, { disabled: false });
			}

			if (cp == tp) {
				self.sv.util.setAttributes(self.pagination_next, { disabled: true });
				self.sv.util.setAttributes(self.pagination_last, { disabled: true });
			} else {
				self.sv.util.setAttributes(self.pagination_next, { disabled: false });
				self.sv.util.setAttributes(self.pagination_last, { disabled: false });
			}
		},
		iconOrText: function (type) {
			let self = this;
			return [
				(
					self.options.icon_mode 
						? self.sv.icon.render(type)
						: {
							tag: "span",
							text: self.sv.locale.cards[type]()
						}
				)
			];
		},
		renderCreateModal: function () {
			let self = this;
			let row;
			self.sv.util.renderModal({
				renderHeader: function (header) {
					let h = self.sv.locale[self.options.locale_section].create_modal_header();
					this.createNode({
						tag: "h3",
						text: h
					}, header);
				},
				renderBody: function (body) {
					let ecb = function (res) {
						self.sv.util.raiseError(
							self.sv.locale[self.options.locale_section].create_modal_error_title(row), 
							self.sv.locale[self.options.locale_section].create_modal_error_description(row)
						);
					};

					self.sv.form.render({
						mode: "create",
						wrapper: body, 
						errors: self.sv.attribute.show_errors(),
						id: self.options.createable.id,
						title: self.sv.locale[self.options.locale_section].create_modal_title(),
						description: self.sv.locale[self.options.locale_section].create_modal_description(),
						fields: self.options.headers,
						locale_section: self.options.locale_section,
						data: {},
						submit_button: false,
						cancel_button: false,
						submit: function (evt) {
							evt.preventDefault();
							let formData = row = self.sv.util.formData(evt.target);
							if (typeof formData == "string") {
								return self.sv.util.raiseError(
									self.sv.locale.application.form_validation_error_title(),
									self.sv.locale.application.form_validation_error_description({ fields: formData })
								);
							}
							self.sv.util.fetch({
								type: self.options.createable.type,
								endpoint: self.options.createable.endpoint,
								params: formData,
								cb: function (res) {
									if (res.success) {
										if (res.password_link) row.password_link = window.location.origin + res.password_link;
										self.sv.document.querySelector('.supervisor-modal-close').click();
										self.sv.util.notify(
											"success",
											self.sv.locale[self.options.locale_section].create_modal_success_title(row), 
											self.sv.locale[self.options.locale_section].create_modal_success_description(row),
										);
										self.data = res.users;
										self.redrawCards();
									} else ecb(res);
								},
								ecb: ecb
							});
						}
					});
				},
				renderFooter: function (footer) {
					self.sv.form.renderSubmitField(footer, { 
						events: {
							click: function (evt) {
								evt.preventDefault();
								let submit = self.sv.document.querySelector('#' + self.options.createable.id);
								self.sv.util.triggerEvent('submit', submit);
							}
						}
					});
					self.sv.form.renderCancelField(footer, {
						events: {
							click: function (evt) {
								evt.preventDefault();
								self.sv.document.querySelector('.supervisor-modal-close').click();
							}
						}
					});
				}
			});
		},
		renderDeleteModal: function (row) {
			let self = this;

			self.sv.util.renderModal({
				renderHeader: function (header) {
					let h = self.sv.locale[self.options.locale_section].delete_modal_header(row);
					this.createNode({
						tag: "h3",
						text: h
					}, header);
				},
				renderBody: function (body) {
					let title = self.sv.locale[self.options.locale_section].delete_modal_title(row);

					if (title) {
						self.sv.util.createNode({
							tag: "h3",
							text: title
						}, body);
					}

					self.sv.util.createNode({
						tag: "p",
						text: self.sv.locale[self.options.locale_section].delete_modal_description(row)
					}, body);

					let wrapper = self.sv.util.createNode({
						tag: "div",
						class: "supervisor-delete-modal-content"
					}, body);

					self.options.headers.forEach(function (h) {
						self.renderRowCell(wrapper, h, row, 1); 
					});
				},
				renderFooter: function (footer) {
					let ecb = function (res) {
						self.sv.util.raiseError(
							self.sv.locale[self.options.locale_section].delete_modal_error_title(row), 
							self.sv.locale[self.options.locale_section].delete_modal_error_description(row)
						);
					};

					self.sv.form.renderSubmitField(footer, {
						value: "Yes", 
						events: {
							click: function (evt) {
								evt.preventDefault();
								self.sv.util.fetch({
									type: self.options.deleteable.type,
									endpoint: self.options.deleteable.endpoint, 
									params: row,
									cb: function (res) {
										if (res.success) {
											self.sv.document.querySelector('.supervisor-modal-close').click();
											self.data = res.users;
											self.redrawCards();
										} else ecb(res);
									},
									ecb: ecb
								});
							}
						}
					});
					self.sv.form.renderCancelField(footer, {
						value: "No",
						events: {
							click: function (evt) {
								evt.preventDefault();
								self.sv.document.querySelector('.supervisor-modal-close').click();
							}			
						} 
					});
				}
			});
		},
		renderEditModal: function (row) {

			let self = this;

			self.sv.util.renderModal({
				renderHeader: function (header) {
					let h = self.sv.locale[self.options.locale_section].edit_modal_header();
					if (self.options.editable.header_field) h += ' - ' + row[self.options.editable.header_field];
					this.createNode({
						tag: "h3",
						text: h
					}, header);
				},
				renderBody: function (body) {
					let ecb = function (res) {
						self.sv.util.raiseError(
							self.sv.locale[self.options.locale_section].edit_modal_error_title(row), 
							self.sv.locale[self.options.locale_section].edit_modal_error_description(row)
						);
					};

					self.sv.form.render({
						mode: "edit",
						wrapper: body, 
						errors: self.sv.attribute.show_errors(),
						id: self.options.editable.id,
						title: self.sv.locale[self.options.locale_section].edit_modal_title(),
						description: self.sv.locale[self.options.locale_section].edit_modal_description(),
						fields: self.options.headers,
						locale_section: self.options.locale_section,
						data: row,
						submit_button: false,
						cancel_button: false,
						submit: function (evt) {
							evt.preventDefault();
							let formData = self.sv.util.formData(evt.target);
							if (typeof formData == "string") {
								return self.sv.util.raiseError(
									self.sv.locale.application.form_validation_error_title(),
									self.sv.locale.application.form_validation_error_description({ fields: formData })
								);
							}
							self.sv.util.fetch({
								type: self.options.editable.type,
								endpoint: self.options.editable.endpoint,
								params: formData,
								cb: function (res) {
									if (res.success) {
										self.sv.document.querySelector('.supervisor-modal-close').click();
										self.sv.util.notify(
											"success",
											self.sv.locale[self.options.locale_section].edit_modal_success_title(row), 
											self.sv.locale[self.options.locale_section].edit_modal_success_description(row),
										);
										self.data = res.users;
										self.redrawCards();
									} else ecb(res);
								},
								ecb: ecb
							});
						}
					});
				},
				renderFooter: function (footer) {
					self.sv.form.renderSubmitField(footer, { 
						events: {
							click: function (evt) {
								evt.preventDefault();
								let submit = self.sv.document.querySelector('#' + self.options.editable.id);
								self.sv.util.triggerEvent('submit', submit);
							}
						}
					});
					self.sv.form.renderCancelField(footer, {
						events: {
							click: function (evt) {
								evt.preventDefault();
								self.sv.document.querySelector('.supervisor-modal-close').click();
							}			
						} 
					});
				}
			});



		},
		loadData: function () {
		
		}
	});

	window.supervisor.factory('cards', SupervisorCards, {
		create: function (wrapper, options) {
			let self = this;
			let uuid = self.sv.util.generateUUID();
			self.sv.util.setAttributes(wrapper, { "data-uuid": uuid });
			context[uuid] = new MinimalCards(wrapper, options, supervisor);
			return context[uuid];
		},
		redraw: function (wrapper) {
			let uuid = wrapper.getAttribute('data-uuid');
			return context[uuid].redraw();
		},
		context: function (wrapper) {
			let uuid = wrapper.getAttribute('data-uuid');
			return context[uuid];
		}
	});
})(window);
