import { InstanceBase } from '@companion-module/base'
import UpgradeScripts from './src/upgrades.js'

import config from './src/config.js'
import actions from './src/actions.js'
import variables from './src/variables.js'
import utils from './src/utils.js'

export default class tslumdInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...variables,
			...utils,
		})

		this.DATA = {
			tallies: [],
		}

		this.repeatInterval = null
	}

	async destroy() {
		let self = this

		if (self.udp !== undefined) {
			self.udp.destroy()
		}

		if (self.repeatInterval !== null) {
			clearInterval(self.repeatInterval)
			self.repeatInterval = null
		}
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		this.initActions()
		this.initVariables()
		this.initUDP()
	}
}

export { UpgradeScripts }
