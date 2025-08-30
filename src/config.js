const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for the TSL UMD protocol.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target port',
				default: '40001',
				width: 6,
				regex: Regex.PORT,
			},
			{
				type: 'checkbox',
				id: 'enableRepeatInterval',
				label: 'Enable Repeat Interval',
				default: false,
				width: 6,
			},
			{
				type: 'static-text',
				id: 'enableRepeatIntervalHelp',
				width: 6,
				label: 'Help',
				value:
					'When enabled, the module will resend the last UMD state at the specified interval. This can help with devices that require repeated messages to maintain tally state.',
			},
			{
				type: 'number',
				id: 'repeatInterval',
				label: 'Repeat Interval (ms)',
				default: 1000,
				min: 500,
				max: 60000,
				width: 12,
				isVisible: (config) => config.enableRepeatInterval === true,
			},
		]
	},
}
