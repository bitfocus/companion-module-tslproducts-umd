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
			tallies: []
		};
	}

	async destroy() {
		let self = this;

		if (self.udp !== undefined) {
			self.udp.destroy();
		}
	}

	async init(config) {
		this.configUpdated(config);
	}

	async configUpdated(config) {
		this.config = config;
		
		this.initActions();
		this.initVariables();
		this.initUDP();
	}
}

runEntrypoint(tslumdInstance, UpgradeScripts)