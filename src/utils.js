const { InstanceStatus, UDPHelper } = require('@companion-module/base')
const TSL5 = require('tsl-umd-v5')

module.exports = {
	initUDP: function () {
		let self = this

		if (self.config.host !== undefined) {
			self.udp = new UDPHelper(self.config.host, self.config.port)

			self.udp.on('error', (err) => {
				self.log('error', `UDP error: ${err}`)
				self.updateStatus(InstanceStatus.Error, err)
			})
		}

		self.updateStatus(InstanceStatus.Ok)
	},

	colorToBits: function (c) {
		//set tally light for version 4.0
		if (c == 'red') {
			return 1
		} else if (c == 'green') {
			return 2
		} else if (c == 'amber') {
			return 3
		} else return 0
	},

	sendCommand: function (cmd) {
		let self = this

		if (cmd !== undefined && self.udp !== undefined) {
			self.log('debug', `sending ${cmd} to ${self.udp.host}`)
			self.udp.send(cmd)
		}

		if (self.config.enableRepeatInterval && self.config.repeatInterval > 0) {
			if (self.repeatInterval) {
				clearInterval(self.repeatInterval)
			}
			self.repeatInterval = setInterval(() => {
				if (cmd !== undefined && self.udp !== undefined) {
					self.log('debug', `resending ${cmd} to ${self.config.host}:${self.config.port}`)
					self.udp.send(cmd)
				}
			}, self.config.repeatInterval)
		}
	},

	sendTSL5UDP: function (tally, sequence) {
		let self = this

		let umd5 = new TSL5()

		self.log('debug', `sending TSL5 UDP to ${self.config.host}:${self.config.port}`)
		umd5.sendTallyUDP(self.config.host, self.config.port, tally, sequence)

		if (self.config.enableRepeatInterval && self.config.repeatInterval > 0) {
			if (self.repeatInterval) {
				clearInterval(self.repeatInterval)
			}
			self.repeatInterval = setInterval(() => {
				self.log('debug', `resending TSL5 UDP to ${self.config.host}:${self.config.port}`)
				umd5.sendTallyUDP(self.config.host, self.config.port, tally, sequence)
			}, self.config.repeatInterval)
		}
	},

	sendTSL5TCP: function (tally, sequence) {
		let self = this

		let umd5 = new TSL5()

		self.log('debug', `sending TSL5 TCP to ${self.config.host}:${self.config.port}`)
		umd5.sendTallyTCP(self.config.host, self.config.port, tally, sequence)

		if (self.config.enableRepeatInterval && self.config.repeatInterval > 0) {
			if (self.repeatInterval) {
				clearInterval(self.repeatInterval)
			}
			self.repeatInterval = setInterval(() => {
				self.log('debug', `resending TSL5 TCP to ${self.config.host}:${self.config.port}`)
				umd5.sendTallyTCP(self.config.host, self.config.port, tally, sequence)
			}, self.config.repeatInterval)
		}
	},
}
