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
				label: 'Tally address',
				id: 'address',
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
				choices: [{ label: 'red', id: 'red'},{ label: 'green', id: 'green'},{ label: 'off', id: 'off'}]
			},{
				type: 'textinput',
				label: 'UMD message',
				id: 'message',
				default: 'CAM 1'
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

		// Build array of sending bytes
		var uint8 = new Uint8Array(22);
		uint8[0] =  0x80 + parseInt(opt.address, 16) - 0x01; //Address + 0x80
		uint8[1] = 0x03; //Tally Information V3.0
		uint8[2] = 0x20; //start of 16 bytes message for UMD
		uint8[3] = 0x20;
		uint8[4] = 0x20;
		uint8[5] = 0x20;
		uint8[6] = 0x20;
		uint8[7] = 0x20;
		uint8[8] = 0x20;
		uint8[9] = 0x20;
		uint8[10] = 0x20;
		uint8[11] = 0x20;
		uint8[12] = 0x20;
		uint8[13] = 0x20;
		uint8[14] = 0x20;
		uint8[15] = 0x20;
		uint8[16] = 0x20;
		uint8[17] = 0x20; //Last part of message
		uint8[18] = 0x23; //CHECKSUM
		uint8[19] = 0x27; //CHECKSUM
		uint8[20] = 0x01; //Byte count of XDATA & Version
		uint8[21] = 0x11; //XDATA

		// Put UMD Text in, max 16 characters
		function message_to_hexa(message) {
			for (var n = 0; n < 15; n ++) {
				//[code & 0xff, code / 256 >>> 0]
				if (n < message.length) {
					uint8[n+2] = message.charCodeAt(n);
				} else {
					uint8[n+2] = 0x20;
				}
			}
		}

		if(opt.message !== undefined) {
			message_to_hexa(opt.message);
		}

		switch (id) {

			case 'tally':
				if (opt.tallySide == 'left' && opt.color == 'red') {
					uint8[20] = 0x01;
					cmd = uint8;
				} else if ( opt.tallySide == 'right' && opt.color == 'red') {
					uint8[20] = 0x10;
					cmd = uint8;
				} else if ( opt.tallySide == 'left' && opt.color == 'green') {
					uint8[20] = 0x02;
					cmd = uint8;
				} else if ( opt.tallySide == 'right' && opt.color == 'green') {
					uint8[20] = 0x20;
					cmd = uint8;
				} else if (opt.color == 'off') {
					uint8[20] = 0x00;
					cmd = uint8;
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
