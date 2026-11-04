const { InstanceBase, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const variables = require('./src/variables')
const utils = require('./src/utils')

class tslumdInstance extends InstanceBase {
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
		if (this.udp !== undefined) {
			this.udp.destroy()
			this.udp = undefined
		}

		this.clearRepeatInterval()
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		// Clear any existing repeat interval and UDP connection before reinitializing
		this.clearRepeatInterval()

		if (this.udp !== undefined) {
			this.udp.destroy()
			this.udp = undefined
		}

		this.initActions()
		this.initVariables()
		this.initUDP()
	}
}

runEntrypoint(tslumdInstance, UpgradeScripts)
