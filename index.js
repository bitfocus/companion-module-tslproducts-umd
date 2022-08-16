var instance_skel = require('../../instance_skel');
var udp = require('../../udp');
var TSL5 = require('tsl-umd-v5');
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
		}, {
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		}, {
			type: 'textinput',
			id: 'port',
			label: 'Target port',
			default: '40001',
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
		'tallyV3': {
			label: 'V3.1 Set text and single tally',
			options: [
				{
					type: 'textinput',
					label: 'Tally address',
					id: 'address',
					default: '0',
					regex: self.REGEX_NUMBER
				}, {
					type: 'dropdown',
					label: 'Tally number',
					id: 'tallyNumber',
					default: '1',
					choices: [{ label: '1', id: '1' }, { label: '2', id: '2' }, { label: '3', id: '3' }, { label: '4', id: '4' }, { label: 'off', id: 'off' }]
				}, {
					type: 'textinput',
					label: 'UMD message',
					id: 'message',
					default: 'CAM 1'
				}]
		},
		'tallyV3Multi': {
			label: 'V3.1 Set text and multiple tallies',
			options: [
				{
					type: 'textinput',
					label: 'Tally address',
					id: 'address',
					default: '0',
					regex: self.REGEX_NUMBER
				}, {
					type: 'checkbox',
					label: 'Tally 1',
					id: 'tally1',
				}, {
					type: 'checkbox',
					label: 'Tally 2',
					id: 'tally2',
				}, {
					type: 'checkbox',
					label: 'Tally 3',
					id: 'tally3',
				}, {
					type: 'checkbox',
					label: 'Tally 4',
					id: 'tally4',
				}, {
					type: 'textinput',
					label: 'UMD message',
					id: 'message',
					default: 'CAM 1'
				}]
		},

		'tallyV4': {
			label: 'V4 Set text and multiple tallies',
			options: [{
				type: 'textinput',
				label: 'Tally address',
				id: 'address',
				default: '0',
				regex: self.REGEX_NUMBER
			}, {
				type: 'dropdown',
				label: 'Tally 1',
				id: 'tally1',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Tally 2',
				id: 'tally2',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Tally 3',
				id: 'tally3',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Tally 4',
				id: 'tally4',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Text Color',
				id: 'textColor',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }]
			},
			{
				type: 'textinput',
				label: 'UMD message',
				id: 'message',
				default: 'CAM 1'
			}]
		},
		'tallyV5UDP': {
			label: 'V5 UDP Set text and multiple tallies',
			options: [{
				type: 'number',
				label: 'Tally address',
				id: 'address',
				default: 1
			},
			{
				type: 'number',
				label: 'Screen',
				id: 'screen',
				default: 0
			},
			{
				type: 'dropdown',
				label: 'Text Tally',
				id: 'text_tally',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Right Tally',
				id: 'rh_tally',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Left Tally',
				id: 'lh_tally',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'number',
				label: 'Brightness',
				id: 'brightness',
				default: 3,
				min: 0,
				max: 3
			},
			{
				type: 'textinput',
				label: 'UMD message',
				id: 'message',
				default: 'CAM 1'
			},
			{
				type: 'dropdown',
				label: 'DLE/STX',
				id: 'sequence',
				default: 'default',
				choices: [{ label: 'On', id: 'on' }, { label: 'Off', id: 'off' }, { label: 'Default', id: 'default' }]
			}]
		},
		'tallyV5TCP': {
			label: 'V5 TCP Set text and multiple tallies',
			options: [{
				type: 'number',
				label: 'Tally address',
				id: 'address',
				default: 1
			},
			{
				type: 'number',
				label: 'Screen',
				id: 'screen',
				default: 0
			},
			{
				type: 'dropdown',
				label: 'Text Tally',
				id: 'text_tally',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Right Tally',
				id: 'rh_tally',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'dropdown',
				label: 'Left Tally',
				id: 'lh_tally',
				default: 'red',
				choices: [{ label: 'red', id: 'red' }, { label: 'green', id: 'green' }, { label: 'amber', id: 'amber' }, { label: 'off', id: 'off' }]
			},
			{
				type: 'number',
				label: 'Brightness',
				id: 'brightness',
				default: 3,
				min: 0,
				max: 3
			},
			{
				type: 'textinput',
				label: 'UMD message',
				id: 'message',
				default: 'CAM 1'
			},
			{
				type: 'dropdown',
				label: 'DLE/STX',
				id: 'sequence',
				default: 'default',
				choices: [{ label: 'On', id: 'on' }, { label: 'Off', id: 'off' }, { label: 'Default', id: 'default' }]
			}]
		}
	};
	self.setActions(actions);
};

function colorToBits(c) {
	let col = 0;
	//set tally light for version 4.0
	if (c == 'red') {
		return 1;
	} else if (c == 'green') {
		return 2;
	} else if (c == 'amber') {
		return 3;
	}
	else return 0;
}

instance.prototype.action = function (action) {
	var self = this;
	const id = action.action;
	const opt = action.options;
	var cmd;

	var bufUMD = Buffer.alloc(18, 0); //ignore spec and pad with 0 for better aligning on Decimator etc
	bufUMD[0] = 0x80 + parseInt(opt.address); //Address + 0x80
	bufUMD.write(opt.message, 2);

	let bufTally = 0;

	switch (id) {

		case 'tallyV4': {
			let textCol = colorToBits(opt.textColor) << 2;

			bufTally = (colorToBits(opt.tally2) << 4) | textCol | colorToBits(opt.tally1);
			let bufTally2 = (colorToBits(opt.tally4) << 4) | textCol | colorToBits(opt.tally3);

			let sum = (- bufUMD.reduce((a, b) => a + b, 0)) & 0x7f;

			cmd = Buffer.concat([bufUMD, Buffer.from([sum, 2, bufTally, bufTally2])]);

			break;
		}
		case 'tallyV3': {
			//set tally light for version 3.1
			if (opt.tallyNumber == '1') {
				bufTally = 0x31;
			} else if (opt.tallyNumber == '2') {
				bufTally = 0x32;
			} else if (opt.tallyNumber == '3') {
				bufTally = 0x34;
			} else if (opt.tallyNumber == '4') {
				bufTally = 0x38;
			} else {
				bufTally = 0x30;
			}

			bufUMD[1] = bufTally;
			cmd = bufUMD;

			break;
		}
		case 'tallyV3Multi': {
			//set tally light for version 3.1
			bufTally = 0x30;
			if (opt.tally1) {
				bufTally |= 1;
			}
			if (opt.tally2) {
				bufTally |= 2;
			}
			if (opt.tally3) {
				bufTally |= 4;
			}
			if (opt.tally4) {
				bufTally |= 8;
			}
			bufUMD[1] = bufTally;
			cmd = bufUMD;

			break;
		}
		case 'tallyV5UDP': {
			let umd5 = new TSL5();
			let sequence = null;

			let tally = {
				"screen": opt.screen,
				"index": opt.address,
				"display": {
					"rh_tally": colorToBits(opt.rh_tally),
					"text_tally": colorToBits(opt.text_tally),
					"lh_tally": colorToBits(opt.lh_tally),
					"brightness": opt.brightness,
					"text": opt.message
				}
			}

			if (opt.sequence == 'on') {
				sequence = true
			} else if (opt.sequence == 'off') {
				sequence = false
			}

			debug('sending TSL5 UDP to', self.config.host, ':', self.config.port);
			umd5.sendTallyUDP(self.config.host, self.config.port, tally, sequence);

			break;
		}
		case 'tallyV5TCP': {
			let umd5 = new TSL5();
			let sequence = null

			let tally = {
				"screen": opt.screen,
				"index": opt.address,
				"display": {
					"rh_tally": colorToBits(opt.rh_tally),
					"text_tally": colorToBits(opt.text_tally),
					"lh_tally": colorToBits(opt.lh_tally),
					"brightness": opt.brightness,
					"text": opt.message
				}
			}

			if (opt.sequence == 'on') {
				sequence = true
			} else if (opt.sequence == 'off') {
				sequence = false
			}

			debug('sending TSL5 TCP to', self.config.host, ':', self.config.port);
			umd5.sendTallyTCP(self.config.host, self.config.port, tally, sequence);

			break;
		}
	}

	if ((cmd !== undefined) && (self.udp !== undefined)) {
		debug('sending ', cmd, "to", self.udp.host);
		self.udp.send(cmd);
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
