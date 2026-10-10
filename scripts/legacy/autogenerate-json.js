#!/usr/bin/env node

import { readFile, writeFile, mkdir, access, unlink } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { load, dump } from 'js-yaml';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
	yamlPath: 'src/content/data/lsl_definitions.yml',
	jsonPath: 'src/content/data/lsl_definitions.json',
	jsonConstantsPath: 'src/content/data/lsl_definitions.constants.json',
	jsonEventsPath: 'src/content/data/lsl_definitions.events.json',
	jsonFunctionsPath: 'src/content/data/lsl_definitions.functions.json',
};

/**
 * Check if file exists
 */
async function fileExists(filePath) {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}


/**
 * Main execution function
 */
async function main() {
	try {
		console.log('LSL Documentation JSON Generator');
		console.log('================================');
		
		// Check if YAML file exists
		if (!(await fileExists(CONFIG.yamlPath))) {
			console.error(`❌ YAML file not found: ${CONFIG.yamlPath}`);
			process.exit(1);
		}
		
		// Load YAML definitions
		console.log(`📖 Loading definitions from: ${CONFIG.yamlPath}`);
		const yamlContent = await readFile(CONFIG.yamlPath, 'utf8');
		const definitions = load(yamlContent);
		
		if (!definitions) {
			console.error('❌ Failed to parse YAML file');
			process.exit(1);
		}
		
		// Write JSON version
		console.log(`📁 Writing to: ${CONFIG.jsonPath}`);
		await writeFile(CONFIG.jsonPath, JSON.stringify(definitions, null, '\t'), 'utf8');
		
		console.log(`📁 Writing to: ${CONFIG.jsonConstantsPath}`);
		await writeFile(CONFIG.jsonConstantsPath, JSON.stringify(definitions.constants, null, '\t'), 'utf8');
		
		console.log(`📁 Writing to: ${CONFIG.jsonEventsPath}`);
		await writeFile(CONFIG.jsonEventsPath, JSON.stringify(definitions.events, null, '\t'), 'utf8');
		
		console.log(`📁 Writing to: ${CONFIG.jsonFunctionsPath}`);
		await writeFile(CONFIG.jsonFunctionsPath, JSON.stringify(definitions.functions, null, '\t'), 'utf8');
		
		
		console.log('\n✅ JSON generation completed successfully!');
		
	} catch (error) {
		console.error('❌ Error during execution:', error);
		process.exit(1);
	}
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export {
	main
};