var instance_skel = require('../../instance_skel');
var udp = require('../../udp');
var debug;
var log;

function instance(system, id, config) {
		var self = this;

		// super-constructor
		instance_skel.apply(this, arguments);
		self.actions(); // export actions
		return self;
}

instance.prototype.init = function () {
		var self = this;

		debug = self.debug;
		log = self.log;

		self.status(self.STATUS_UNKNOWN);

		if (self.config.host !== undefined) {
			self.udp = new udp(self.config.host, self.config.port);

			self.udp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.udp.on('error', function () {
				// Ignore
			});
		}
};

instance.prototype.updateConfig = function (config) {
		var self = this;
		self.config = config;

		if (self.udp !== undefined) {
			self.udp.destroy();
			delete self.udp;
		}

		if (self.config.host !== undefined) {
			self.udp = new udp(self.config.host, self.config.port);

			self.udp.on('status_change', function (status, message) {
				self.status(status, message);
			});

			self.udp.on('error', function (message) {
				// ignore for now
			});
		}
};

instance.prototype.CHOICES_VERSIONS = [
	{ label: 'v3.1', id: '3' },
	{ label: 'v4.0', id: '4' },
	{ label: 'v5.0', id: '5' }
];

// Return config fields for web config
instance.prototype.config_fields = function () {
		var self = this;
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the TSL protocol'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: self.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target port',
				default: '40001',
				width: 6
			},
			{
				type: 'dropdown',
				id: 'version',
				label: 'Version of Protocol',
				choices: self.CHOICES_VERSIONS,
				default: '3',
				width: 6
			}
		]
};

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;

		if (self.udp !== undefined) {
			self.udp.destroy();
		}
		debug("destroy", self.id);
};

instance.prototype.actions = function (system) {
	var self = this;

	var actions = {
		'tally': {
			label: 'Select Tally and color',
			options: [ {
				type: 'textinput',
				label: 'Tally id',
				id: 'id',
				default: '0',
				regex: self.REGEX_NUMBER
			},{
				type: 'dropdown',
				label: 'Tally number',
				id: 'tallySide',
				default: 'left',
				choices: [{ label: 'Left', id: 'left'},{ label: 'Right', id: 'right'}]
			},{
				type: 'dropdown',
				label: 'Tally color',
				id: 'color',
				default: 'red',
				choices: [{ label: 'red', id: 'red'},{ label: 'green', id: 'green'}]
			} ]
		}
	};
	self.setActions(actions);
};


instance.prototype.action = function (action) {
		var self = this;
		var id = action.action;
		var cmd;
		var opt = action.options;

		switch (id) {

			case 'tally':
				if (opt.tallySide == 'left' && opt.color == 'red') {
					var b = new Buffer([0x80,0x03,0x43,0x61,0x6d,0x20,0x32,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x23,0x27,0x01,0x11]);
					console.log(b[3]);
					cmd = b;
				} else if ( opt.tallySide == 'right' && opt.color == 'red') {
					cmd = new Buffer([0x80,0x03,0x43,0x61,0x6d,0x20,0x32,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x23,0x27,0x10,0x11]);
				} else if ( opt.tallySide == 'left' && opt.color == 'green') {
					cmd = new Buffer([0x80,0x03,0x43,0x61,0x6d,0x20,0x32,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x23,0x27,0x02,0x11]);
				} else if ( opt.tallySide == 'right' && opt.color == 'green') {
					cmd = new Buffer([0x80,0x03,0x43,0x61,0x6d,0x20,0x32,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x23,0x27,0x20,0x11]);
				}

				break;

		}

		if (cmd !== undefined) {
			if (self.udp !== undefined) {
				debug('sending ', cmd, "to", self.udp.host);
				self.udp.send(cmd);
			}
		}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;