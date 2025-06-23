module.exports = {
	initVariables: function () {
		let self = this
		let variables = []

		for (let i = 0; i < self.DATA.tallies.length; i++) {
			let tally = self.DATA.tallies[i]
			variables.push({
				variableId: 'address' + tally.address + '_tally1_last',
				name: 'Address ' + tally.address + ' Tally 1 Last State',
			})
			variables.push({
				variableId: 'address' + tally.address + '_tally2_last',
				name: 'Address ' + tally.address + ' Tally 2 Last State',
			})
			variables.push({
				variableId: 'address' + tally.address + '_tally3_last',
				name: 'Address ' + tally.address + ' Tally 3 Last State',
			})
			variables.push({
				variableId: 'address' + tally.address + '_tally4_last',
				name: 'Address ' + tally.address + ' Tally 4 Last State',
			})
			variables.push({
				variableId: 'address' + tally.address + '_message_last',
				name: 'Address ' + tally.address + ' Last Message',
			})
		}

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		try {
			let variableObj = {}

			for (let i = 0; i < self.DATA.tallies.length; i++) {
				let tally = self.DATA.tallies[i]
				variableObj['address' + tally.address + '_tally1_last'] = tally.tally1 ? 'On' : 'Off'
				variableObj['address' + tally.address + '_tally2_last'] = tally.tally2 ? 'On' : 'Off'
				variableObj['address' + tally.address + '_tally3_last'] = tally.tally3 ? 'On' : 'Off'
				variableObj['address' + tally.address + '_tally4_last'] = tally.tally4 ? 'On' : 'Off'
				variableObj['address' + tally.address + '_message_last'] = tally.message
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			self.log('error', 'Error checking variables: ' + error.message)
		}
	},
}
