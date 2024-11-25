module.exports = {
	initActions: function () {
		let self = this;
		let actions = {};

		actions.tallyV3 = {
			name: 'V3.1 Set text and single tally',
			options: [
				{
					type: 'textinput',
					label: 'Tally address',
					id: 'address',
					default: '0',
					regex: self.REGEX_NUMBER,
					useVariables: true,
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
					default: 'CAM 1',
					useVariables: true,
				}
			],
			callback: async function (action) {
				let opt = action.options;
		
				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}
		
				let message = await self.parseVariablesInString(opt.message);
		
				var bufUMD = Buffer.alloc(18, 0); //ignore spec and pad with 0 for better aligning on Decimator etc
				bufUMD[0] = 0x80 + address; //Address + 0x80
				bufUMD.write(message, 2);
		
				let bufTally = 0;
		
				//set tally light for version 3.1
				if (opt.tallyNumber == '1') {
					bufTally = 0x31;
				}
				else if (opt.tallyNumber == '2') {
					bufTally = 0x32;
				}
				else if (opt.tallyNumber == '3') {
					bufTally = 0x34;
				}
				else if (opt.tallyNumber == '4') {
					bufTally = 0x38;
				}
				else {
					bufTally = 0x30;
				}
		
				bufUMD[1] = bufTally;
				
				self.sendCommand(bufUMD);

				//now update the internal store
				let found = false;

				for (let i = 0; i < self.DATA.tallies.length; i++) {
					if (self.DATA.tallies[i].address == address) {
						if (opt.tallyNumber == '1') {
							self.DATA.tallies[i].tally1 = 1;
						}
						else if (opt.tallyNumber == '2') {
							self.DATA.tallies[i].tally2 = 1;
						}
						else if (opt.tallyNumber == '3') {
							self.DATA.tallies[i].tally3 = 1;
						}
						else if (opt.tallyNumber == '4') {
							self.DATA.tallies[i].tally4 = 1;
						}

						self.DATA.tallies[i].message = message;
						found = true;
						break;
					}
				}
				
				if (!found) {
					let tallyObj = {
						address: address,
						tally1: 0,
						tally2: 0,
						tally3: 0,
						tally4: 0,
						message: message,
					}

					if (opt.tallyNumber == '1') {
						tallyObj.tally1 = 1;
					}
					else if (opt.tallyNumber == '2') {
						tallyObj.tally2 = 1;
					}
					else if (opt.tallyNumber == '3') {
						tallyObj.tally3 = 1;
					}
					else if (opt.tallyNumber == '4') {
						tallyObj.tally4 = 1;
					}

					self.DATA.tallies.push(tallyObj);

					self.initVariables();
				}

				//update variables
				self.checkVariables();
			}
		};

		actions.tallyV3lastValues = {
			name: 'V3.1 Set single tally (using last sent for other tally values and UMD message)',
			options: [
				{
					type: 'textinput',
					label: 'Tally address',
					id: 'address',
					default: '0',
					regex: self.REGEX_NUMBER,
					useVariables: true,
				},
				{
					type: 'dropdown',
					label: 'Tally number',
					id: 'tallyNumber',
					default: '1',
					choices: [{ label: '1', id: '1' }, { label: '2', id: '2' }, { label: '3', id: '3' }, { label: '4', id: '4' }, { label: 'off', id: 'off' }]
				},
				{
					type: 'checkbox',
					label: 'On/Off',
					id: 'onOff',
					default: true
				}
			],
			callback: async function (action) {
				let opt = action.options;
		
				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}

				let data = {
					tally1: 0,
					tally2: 0,
					tally3: 0,
					tally4: 0,
					message: '',
				};

				//now find this tally address in the internal store
				let tally = self.DATA.tallies.find(t => t.address == address);
				if (tally) {
					data.tally1 = tally.tally1;
					data.tally2 = tally.tally2;
					data.tally3 = tally.tally3;
					data.tally4 = tally.tally4;
					data.message = tally.message;
				}

				switch(opt.tallyNumber) {
					case '1':
						data.tally1 = opt.onOff ? 1 : 0;
						break;
					case '2':
						data.tally2 = opt.onOff ? 1 : 0;
						break;
					case '3':
						data.tally3 = opt.onOff ? 1 : 0;
						break;
					case '4':
						data.tally4 = opt.onOff ? 1 : 0;
						break;
					default:
						break;
				}
		
				let bufTally = 0x30;
		
				if (data.tally1) {
					bufTally |= 1;
				}
				if (data.tally2) {
					bufTally |= 2;
				}
				if (data.tally3) {
					bufTally |= 4;
				}
				if (data.tally4) {
					bufTally |= 8;
				}

				let bufUMD = Buffer.alloc(18, 0); //ignore spec and pad with 0 for better aligning on Decimator etc
				bufUMD[0] = 0x80 + address; //Address + 0x80
				bufUMD.write(data.message, 2);

				bufUMD[1] = bufTally;
				
				self.sendCommand(bufUMD);

				//now update the internal store
				let found = false;

				for (let i = 0; i < self.DATA.tallies.length; i++) {
					if (self.DATA.tallies[i].address == address) {
						self.DATA.tallies[i].tally1 = data.tally1;
						self.DATA.tallies[i].tally2 = data.tally2;
						self.DATA.tallies[i].tally3 = data.tally3;
						self.DATA.tallies[i].tally4 = data.tally4;
						self.DATA.tallies[i].message = data.message;
						found = true;
						break;
					}
				}
				
				if (!found) {
					self.DATA.tallies.push({
						address: address,
						tally1: data.tally1,
						tally2: data.tally2,
						tally3: data.tally3,
						tally4: data.tally4,
						message: data.message,
					});

					self.initVariables();
				}

				//update variables
				self.checkVariables();
			}
		};

		actions.tallyV3lastValuesMessage = {
			name: 'V3.1 Set UMD message only (using last sent for other tally values)',
			options: [
				{
					type: 'textinput',
					label: 'Tally address',
					id: 'address',
					default: '0',
					regex: self.REGEX_NUMBER,
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'UMD message',
					id: 'message',
					default: 'CAM 1',
					useVariables: true,
				}
			],
			callback: async function (action) {
				let opt = action.options;
		
				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				let optMessage = await self.parseVariablesInString(opt.message);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}

				let data = {
					tally1: 0,
					tally2: 0,
					tally3: 0,
					tally4: 0,
					message: optMessage,
				};

				//now find this tally address in the internal store
				let tally = self.DATA.tallies.find(t => t.address == address);
				if (tally) {
					data.tally1 = tally.tally1;
					data.tally2 = tally.tally2;
					data.tally3 = tally.tally3;
					data.tally4 = tally.tally4;
				}
		
				let bufTally = 0x30;
		
				if (data.tally1) {
					bufTally |= 1;
				}
				if (data.tally2) {
					bufTally |= 2;
				}
				if (data.tally3) {
					bufTally |= 4;
				}
				if (data.tally4) {
					bufTally |= 8;
				}

				let bufUMD = Buffer.alloc(18, 0); //ignore spec and pad with 0 for better aligning on Decimator etc
				bufUMD[0] = 0x80 + address; //Address + 0x80
				bufUMD.write(data.message, 2);

				bufUMD[1] = bufTally;
				
				self.sendCommand(bufUMD);

				//now update the internal store
				let found = false;

				for (let i = 0; i < self.DATA.tallies.length; i++) {
					if (self.DATA.tallies[i].address == address) {
						self.DATA.tallies[i].tally1 = data.tally1;
						self.DATA.tallies[i].tally2 = data.tally2;
						self.DATA.tallies[i].tally3 = data.tally3;
						self.DATA.tallies[i].tally4 = data.tally4;
						self.DATA.tallies[i].message = data.message;
						found = true;
						break;
					}
				}
				
				if (!found) {
					self.DATA.tallies.push({
						address: address,
						tally1: data.tally1,
						tally2: data.tally2,
						tally3: data.tally3,
						tally4: data.tally4,
						message: data.message,
					});

					self.initVariables();
				}

				//update variables
				self.checkVariables();
			}
		};
		
		actions.tallyV3Multi = {
			name: 'V3.1 Set text and multiple tallies',
			options: [
				{
					type: 'textinput',
					label: 'Tally address',
					id: 'address',
					default: '0',
					regex: self.REGEX_NUMBER,
					useVariables: true,
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
					default: 'CAM 1',
					useVariables: true,
				}],
			callback: async function (action) {
				let opt = action.options;
		
				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}
		
				let message = await self.parseVariablesInString(opt.message);
		
				var bufUMD = Buffer.alloc(18, 0); //ignore spec and pad with 0 for better aligning on Decimator etc
				bufUMD[0] = 0x80 + address; //Address + 0x80
				bufUMD.write(message, 2);
		
				let bufTally = 0;
		
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
				
				self.sendCommand(bufUMD);

				//now update the internal store
				let found = false;

				for (let i = 0; i < self.DATA.tallies.length; i++) {
					if (self.DATA.tallies[i].address == address) {
						self.DATA.tallies[i].tally1 = opt.tally1 ? 1 : 0;
						self.DATA.tallies[i].tally2 = opt.tally2 ? 1 : 0;
						self.DATA.tallies[i].tally3 = opt.tally3 ? 1 : 0;
						self.DATA.tallies[i].tally4 = opt.tally4 ? 1 : 0;
						self.DATA.tallies[i].message = message;
						found = true;
						break;
					}
				}
				
				if (!found) {
					self.DATA.tallies.push({
						address: address,
						tally1: opt.tally1 ? 1 : 0,
						tally2: opt.tally2 ? 1 : 0,
						tally3: opt.tally3 ? 1 : 0,
						tally4: opt.tally4 ? 1 : 0,
						message: message,
					});

					self.initVariables();
				}

				//update variables
				self.checkVariables();
			}
		};
		
		actions.tallyV4 = {
			name: 'V4 Set text and multiple tallies',
			options: [{
				type: 'textinput',
				label: 'Tally address',
				id: 'address',
				default: '0',
				regex: self.REGEX_NUMBER,
				useVariables: true,
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
				default: 'CAM 1',
				useVariables: true,
			}],
			callback: async function (action) {
				let opt = action.options;
		
				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}
		
				let message = await self.parseVariablesInString(opt.message);
		
				var bufUMD = Buffer.alloc(18, 0); //ignore spec and pad with 0 for better aligning on Decimator etc
				bufUMD[0] = 0x80 + address; //Address + 0x80
				bufUMD.write(message, 2);
		
				let bufTally = 0;
		
				let textCol = self.colorToBits(opt.textColor) << 2;
		
				bufTally = (self.colorToBits(opt.tally2) << 4) | textCol | self.colorToBits(opt.tally1);
				let bufTally2 = (self.colorToBits(opt.tally4) << 4) | textCol | self.colorToBits(opt.tally3);
		
				let sum = (- bufUMD.reduce((a, b) => a + b, 0)) & 0x7f;
		
				let cmd = Buffer.concat([bufUMD, Buffer.from([sum, 2, bufTally, bufTally2])]);
		
				self.sendCommand(cmd);
			}
		};
		
		actions.tallyV5UDP = {
			name: 'V5 UDP Set text and multiple tallies',
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
			}],
			callback: async function (action) {
				let opt = action.options;
		
				let sequence = null;
		
				let optScreen = await self.parseVariablesInString(opt.screen);
				let screen = parseInt(optScreen);

				if (isNaN(screen)) {
					self.log('error', 'Screen is not a number: ' + optScreen);
					return;
				}

				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}

				let optBrightness = await self.parseVariablesInString(opt.brightness);
				let brightness = parseInt(optBrightness);

				if (isNaN(brightness)) {
					self.log('error', 'Brightness is not a number: ' + optBrightness);
					return;
				}
				
				let message = await self.parseVariablesInString(opt.message);
		
				let tally = {
					"screen": screen,
					"index": address,
					"display": {
						"rh_tally": self.colorToBits(opt.rh_tally),
						"text_tally": self.colorToBits(opt.text_tally),
						"lh_tally": self.colorToBits(opt.lh_tally),
						"brightness": brightness,
						"text": message
					}
				}
		
				if (opt.sequence == 'on') {
					sequence = true
				}
				else if (opt.sequence == 'off') {
					sequence = false
				}
		
				self.sendTSL5UDP(tally, sequence);
			}
		};
		
		actions.tallyV5TCP = {
			name: 'V5 TCP Set text and multiple tallies',
			options: [{
				type: 'number',
				label: 'Tally address',
				id: 'address',
				default: 1,
				useVariables: true
			},
			{
				type: 'number',
				label: 'Screen',
				id: 'screen',
				default: 0,
				useVariables: true
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
				default: 'CAM 1',
				useVariables: true
			},
			{
				type: 'dropdown',
				label: 'DLE/STX',
				id: 'sequence',
				default: 'default',
				choices: [{ label: 'On', id: 'on' }, { label: 'Off', id: 'off' }, { label: 'Default', id: 'default' }]
			}],
			callback: async function (action) {
				let opt = action.options;
		
				let sequence = null;
				
				let optScreen = await self.parseVariablesInString(opt.screen);
				let screen = parseInt(optScreen);

				if (isNaN(screen)) {
					self.log('error', 'Screen is not a number: ' + optScreen);
					return;
				}

				let optAddress = await self.parseVariablesInString(opt.address)
				let address = parseInt(optAddress);

				if (isNaN(address)) {
					self.log('error', 'Address is not a number: ' + optAddress);
					return;
				}

				let optBrightness = await self.parseVariablesInString(opt.brightness);
				let brightness = parseInt(optBrightness);

				if (isNaN(brightness)) {
					self.log('error', 'Brightness is not a number: ' + optBrightness);
					return;
				}

				let message = await self.parseVariablesInString(opt.message);
		
				let tally = {
					"screen": screen,
					"index": address,
					"display": {
						"rh_tally": self.colorToBits(opt.rh_tally),
						"text_tally": self.colorToBits(opt.text_tally),
						"lh_tally": self.colorToBits(opt.lh_tally),
						"brightness": brightness,
						"text": message
					}
				}
		
				if (opt.sequence == 'on') {
					sequence = true
				}
				else if (opt.sequence == 'off') {
					sequence = false
				}
				
				self.sendTSL5TCP(tally, sequence);
			}
		};		

		self.setActionDefinitions(actions);
	}
}