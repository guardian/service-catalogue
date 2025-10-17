interface Plugin {
	/**
	 * The name of the CloudQuery plugin.
	 */
	name: string;

	/**
	 * The version of the CloudQuery plugin, as defined in `.env` at the root of the repository.
	 */
	version: string;
}

export interface PluginToCheck extends Plugin {
	/**
	 * The tables currently being collected.
	 */
	currentTables: string[];

	/**
	 * The path to the JSON file created by the CloudQuery CLI (`cloudquery tables`).
	 */
	cliResponseFilepath: string;
}

export interface CloudQueryTable {
	name: string;
	isIncremental: boolean;
}

export interface Result extends Plugin {
	/**
	 * Tables that will continue to be collected.
	 */
	tablesCollected: CloudQueryTable[];

	/**
	 * Tables that were being collected but no longer exist in the CloudQuery plugin.
	 */
	tablesRemoved: CloudQueryTable[];

	/**
	 * Tables that can be collected.
	 */
	tablesAvailable: CloudQueryTable[];
}
