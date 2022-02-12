(function (window) {
	let MinimalTable = function (wrapper, options, supervisor) {
		this.wrapper = wrapper;
		this.options = options;
		this.sv = supervisor;
		this.create();
	}, SupervisorTable = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, context = {}, current;

	window.supervisor.util.createObject(MinimalTable, {
		create: function () {
			let self = this;
			
			self.table = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-table"
			}, self.wrapper);

			self.renderHeaders(self.table);
			self.renderBody(self.table);
			self.renderFooter(self.table);
		},
		renderHeaders: function  (table) {
			let self = this;
			if (self.options.headers) {
				let headers = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-table-headers"
				}, table);

				self.options.headers.forEach(h => self.renderHeader(headers, h));
			}
		},
		renderHeader: function (headers, h) {
			let self = this;

			console.log(headers, h);

			let header = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-table-header",
				attributes: {
					name: h.name,
				},
				styles: {
					width: "100px"
				},
				children: [
					{
						tag: "span",
						text: self.sv.locale.user_table[h.name]()
					}
				]
			}, headers);

			if (h.sortable) {
				self.sv.util.createNode({
					tag: "span",
					class: "supervisor-table-sort-none"
				}, header);
			}
		
			if (h.filterable) {
				self.sv.util.createNode({
					tag: "div",
					class: "supervisor-table-filter-drop-down"
				}, header);
			}
		},
		renderBody: function (table) {
			let self = this;

			self.body = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-table-body"
			}, table);

			if (self.options.data) self.renderRows(self.options.data);
		},
		renderFooter: function (table) {
			let self = this;

			if (self.options.pagination) {
				let footer = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-table-footer"
				}, table);

				self.sv.util.createNode({ 
					tag: "button",
					text: "First",
					attibutes: {
						"disabled": true
					}
				}, footer);

				self.sv.util.createNode({ 
					tag: "button",
					text: "Prev",
					attibutes: {
						"disabled": true
					}
				}, footer);

				let pagination = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-table-pagination"
				}, footer);

				self.sv.util.createNode({
					tag: "button",
					text: "1",
					attibutes: {
						"disabled": true
					}
				}, pagination);

				self.sv.util.createNode({ 
					tag: "button",
					text: "Next",
					attibutes: {
						"disabled": true
					}
				}, footer);

				self.sv.util.createNode({ 
					tag: "button",
					text: "Last",
					attibutes: {
						"disabled": true
					}
				}, footer);
			}
		},
		renderRows: function (data) {
			let self = this;
			data.forEach(d => self.renderRow(d));
		},
		renderRow: function (row) {
			let self = this;

			let r = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-table-row"
			}, self.body);

			console.log(self);

			self.options.headers.forEach(function (h) {
				let cell = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-table-row-cell",
					styles: {
						width: "100px"
					},
					children: [
						{
							tag: "span",
							text: row[h.name]
						}
					]
				}, r);
			});
		},
		redrawTable: function () {
			self.body.innerHTML = '';
		},
		redrawPagination: function () {

		},
		loadData: function () {
		
		}
	});

	// minimal JS table
	window.supervisor.factory('table', SupervisorTable, {
		create: function (wrapper, options) {
			let self = this;
			let uuid = self.sv.util.generateUUID();
			self.sv.util.setAttributes(wrapper, { "data-uuid": uuid });
			context[uuid] = new MinimalTable(wrapper, options, supervisor);
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
