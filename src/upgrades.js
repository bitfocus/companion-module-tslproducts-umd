const { FixupNumericOrVariablesValueToExpressions } = require('@companion-module/base')

module.exports = [
	function (context, props) {
		// This is a placeholder than now cannot be used/removed
		return {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},
	function (context, props) {
		const result = {
			updatedConfig: null,
			updatedSecrets: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const action of props.actions) {
			if (action.options.address !== undefined) {
				action.options.address = FixupNumericOrVariablesValueToExpressions(action.options.address)
				result.updatedActions.push(action)
			}
		}

		return result
	},
]
