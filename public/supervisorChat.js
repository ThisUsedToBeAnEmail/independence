(function (window) {
	let SupervisorChat = function (supervisor) {
		this.sv = supervisor;
		return this;
	}, LiveChat = function (wrapper, options, supervisor) {
		let self = this;
		self.wrapper = wrapper;
		self.options = options;
		self.sv = supervisor;
		self.ws = undefined;
		self.user_list = undefined;
		self.user_chat = undefined;
		self.init();
	}, context = {};


	window.supervisor.util.createObject(LiveChat, {
		init: function () {
			let self = this;
			self.createWebsocket();
			self.renderLeft();
			self.renderRight();
	
			// TODO remove below and replace with callback from websocket
			[
				{
					name: "User One",
					log: [
						{
							user: "XYZ",
							time: "1645471717",
							image: "/images/blue.png",
							text: "The last 10 messages with a backwards scroll"
						},	
						{
							user: "XYZ",
							time: "1645481717",
							image: "/images/pink.png",
							text: "The last 10 messages with a backwards scroll"
						},

						{
							user: "XYZ",
							time: "1645481917",
							image: "/images/pink.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645502917",
							image: "/images/green.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645503417",
							image: "/images/blue.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645503917",
							image: "/images/green.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645511917",
							image: "/images/pink.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645512917",
							image: "/images/orange.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645513417",
							image: "/images/orange.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645513517",
							image: "/images/green.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645513617",
							image: "/images/pink.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645513717",
							image: "/images/orange.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645513817",
							image: "/images/blue.png",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							time: "1645513917",
							image: "/images/pink.png",
							text: "The last 10 messages with a backwards scroll"
						},
					]
				},
				{
					name: "User Two",
					log: [
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						},
						{
							user: "XYZ",
							text: "The last 10 messages with a backwards scroll"
						}
					]
				},		
			].forEach(function (e, id) {
				self.addUserChat(e, id);
			});
		},
		createWebsocket: function (name, options) {
			let self = this;
		
			self.ws = new WebSocket(self.options.endpoint);

			self.ws.onmessage = function (event) {
				self.onmessage(event, options);
			};

			self.ws.onopen = function (event) {
				self.onopen(event, options);
			};
		},
		onmessage: function (event) {
			let self = this;
			self.wrapper.innerHTML += event.data + '<br/>';
		},
		onopen: function (event) {
			let self = this;
		//	self.ws.send(
		//		JSON.stringify({ 
		//			msg: 'X user has joined the conversation',
		//			user: 'X'
		//		})
		//	);
		},
		send: function (message) {
			let self = this;
			self.ws.send(JSON.stringify(message));
		},
		renderLeft: function () {
			let self = this;

			let content_wrapper = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-chat-left-side"
			}, self.wrapper);

			var children = [
				{
					tag: "h3",
					text: "Monitoring"
				},
				{
					tag: "button",
					text: "+"
				}
			];

			// TODO some kind of super admin role that is the only role allowed 
			// to add users to be monitored and to create the relationship
			// for now any user can....

			self.sv.util.createNode({
				tag: "div",
				class: "supervisor-chat-left-heading",
				children: children
			}, content_wrapper);

			self.user_list = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-chat-left-users",
			}, content_wrapper);
		},
		addUserChat: function (chat, id) {
			let self = this;

			let did = self.sv.util.generateUUID() + '-' + chat.id;

			self.sv.util.createNode({
				tag: "div",
				class: "supervisor-user-list-item",
				id: did,
				children: [
					{
						tag: "h4",
						text: chat.name
					}
				]
			}, self.user_list);

			let cls = ["supervisor-specific-user-list-chat"];
			if (id != 0) cls.push('hiding');

			let chat_wrapper = self.sv.util.createNode({
				tag: "div",
				class: cls,
				attributes: {
					"data-id": did,
				}
			}, self.user_chat);

			let new_day;	

			chat.log.forEach(function (d, index) {
				let current_time = moment(d.time ? d.time * 1000 : 0);
				if (new_day && new_day < current_time.format('YYYY-MM-DD')) {
					self.sv.util.createNode({
						tag: "div",
						class: "supervisor-chat-new-day",
						children: [
							{
								tag: "p",
								text: 'Start of a new day: ' + current_time.format('DD-MM-YYYY')
							}
						]
					}, chat_wrapper);
				}
				new_day = current_time.format('YYYY-MM-DD');

				let cls2 = [ "supervisor-chat-item" ];

				let chat_item = self.sv.util.createNode({
					tag: "div",
					class: cls2,
					attributes: {
						"data-id": index
					},
				}, chat_wrapper);

				let user_card = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-chat-user-card",
					children: [
						{
							tag: "img",
							attributes: {
								src: d.image
							}
						},
						{
							tag: "h5",
							text: d.user
						}
					]
				}, chat_item);

				let text = self.sv.util.createNode({
					tag: "div",
					class: "supervisor-chat-text",
					children: [
						{ 
							tag: "div",
							class: "supervisor-chat-text-manage",
							children: [
								{
									tag: "p",
									text: d.text
								},
								{
									tag: "div",
									class: "supervisor-chat-manage-card",
									children: [
										{
											tag: "button",
											text: "Edit"
										},
										{
											tag: "button",
											text: "Delete"
										}
									]
								}
							]
						},
						{
							tag: "div",
							children: [
								{
									tag: "i",
									text: moment(d.time * 1000).format('DD-MM-YYYY HH:mm:ss')
								},
								{
									tag: "i",
									children: [
										{
											tag: "b",
											class: ["been_edited", "hide"],
											text: "Been Edited" 
										}
									]
								}
							]
						}
					]
				}, chat_item);
			});
			console.dir(chat_wrapper);
			self.user_chat.scrollTop = self.user_chat.scrollHeight;
		},
		renderRight: function () {
			let self = this;

			let content_wrapper = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-chat-right-side"
			}, self.wrapper);

			self.user_chat = self.sv.util.createNode({
				tag: "div",
				class: "supervisor-user-chat",
				events: {
					scroll: function (evt) {
						console.log(evt);
						self.loadUserChat();
					}
				}
			}, content_wrapper);

			self.renderInputArea(content_wrapper);
		},
		loadUserChat: function () {
			let self = this;

			if (self.user_chat.querySelector('.supervisor-chat-load-more')) return;

			let wrapper = self.sv.util.insertNode(0, {
				tag: "div",
				class: "supervisor-chat-load-more"
			}, self.user_chat);

			let spinner = self.sv.util.createNode({
				tag: "div",
				class: "lds-ellipsis",
				children: [
					{
						tag: "div"
					},
					{
						tag: "div"
					},
					{
						tag: "div"
					},
					{
						tag: "div"
					}
				]
			}, wrapper);

		},
		renderInputArea: function (wrapper) {
			let self = this;
				
			self.sv.util.createNode({
				tag: "div",
				class: "supervisor-chat-area",
				children: [
					{
						tag: "textarea",
					},
					{
						tag: "button",
						text: "Send"
					}
				]
			}, wrapper);	
		}
	});

	window.supervisor.factory('chat', SupervisorChat, {
		create: function (wrapper, options) {
	      		let self = this;
			let uuid = self.sv.util.generateUUID();
			self.sv.util.setAttributes(wrapper, { "data-uuid": uuid });
			context[uuid] = new LiveChat(wrapper, options, self.sv);
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
