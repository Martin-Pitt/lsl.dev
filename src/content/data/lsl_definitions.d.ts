interface LSLDefinitions {
	"llsd-lsl-syntax-version": number
	constants: {
		[k: string]: {
			tooltip?: string
			type?: string
			value?: number | string
			[k: string]: unknown
		}
	}
	events: {
		[k: string]: {
			arguments?:
			| {
				[k: string]: {
					tooltip?: string
					type?: string
					index_semantics?: boolean
				}
			}[]
			tooltip?: string
		}
	}
	functions: {
		[k: string]: {
			arguments?:
			| {
				[k: string]: {
					tooltip?: string
					type?: string
					index_semantics?: boolean
				}
			}[]
			| null
			energy?: number
			"func-id"?: number
			native?: boolean
			pure?: boolean
			return?: string
			sleep?: number
			tooltip?: string
			bool_semantics?: boolean
			experience?: boolean
			deprecated?: boolean
			private?: boolean
			index_semantics?: boolean
			"god-mode"?: boolean
			"linden-experience"?: boolean
			mono_sleep?: number
		}
	}
	types: {
		[k: string]: {
			tooltip?: string
		}
	}
	controls: {
		[k: string]: {
			tooltip?: string
		}
	}
}
