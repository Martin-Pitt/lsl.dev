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
	grammarPath: 'src/content/data/lsl_grammar.json',
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
 * Creates an optimized regex pattern from an array of strings using trie-based optimization.
 * This algorithm builds a prefix tree (trie) and converts it to a regex pattern that
 * efficiently matches all input strings while minimizing the pattern length.
 * 
 * @param {string[]} strings - Array of strings to create regex for
 * @param {Object} options - Configuration options
 * @param {boolean} options.wordBoundaries - Whether to add word boundaries (default: true)
 * @param {boolean} options.caseInsensitive - Whether to make regex case insensitive (default: false)
 * @returns {string} Optimized regex pattern
 */
function createOptimizedRegex(strings, options = {}) {
    const { wordBoundaries = true, caseInsensitive = false } = options;
    
    // Trie node class for building the prefix tree
    class TrieNode {
        constructor() {
            this.children = new Map();
            this.isEndOfWord = false;
        }
    }
    
    /**
     * Builds a trie (prefix tree) from the input strings
     * @param {string[]} strings - Input strings
     * @returns {TrieNode} Root node of the trie
     */
    function buildTrie(strings) {
        const root = new TrieNode();
        
        for (const str of strings) {
            let current = root;
            const processedStr = caseInsensitive ? str.toLowerCase() : str;
            
            for (const char of processedStr) {
                if (!current.children.has(char)) {
                    current.children.set(char, new TrieNode());
                }
                current = current.children.get(char);
            }
            current.isEndOfWord = true;
        }
        
        return root;
    }
    
    /**
     * Converts a trie to an optimized regex pattern
     * @param {TrieNode} node - Current trie node
     * @returns {string} Regex pattern for this subtree
     */
    function trieToRegex(node) {
        if (!node || node.children.size === 0) {
            return '';
        }
        
        const alternatives = [];
        
        // Process each child node
        for (const [char, childNode] of node.children) {
            const childPattern = trieToRegex(childNode);
            
            if (childNode.isEndOfWord && childNode.children.size === 0) {
                // Leaf node - just the character
                alternatives.push(escapeRegexChar(char));
            } else if (childNode.isEndOfWord && childNode.children.size > 0) {
                // Node that ends a word but also has continuations (optional suffix)
                if (childPattern) {
                    alternatives.push(escapeRegexChar(char) + '(?:' + childPattern + ')?');
                } else {
                    alternatives.push(escapeRegexChar(char));
                }
            } else if (childNode.children.size > 0) {
                // Node with only continuations
                alternatives.push(escapeRegexChar(char) + childPattern);
            }
        }
        
        // Combine alternatives into a group
        if (alternatives.length === 0) {
            return '';
        } else if (alternatives.length === 1) {
            return alternatives[0];
        } else {
            return '(?:' + alternatives.join('|') + ')';
        }
    }
    
    /**
     * Escapes special regex characters
     * @param {string} char - Character to escape
     * @returns {string} Escaped character
     */
    function escapeRegexChar(char) {
        const specialChars = /[.*+?^${}()|[\]\\]/g;
        return char.replace(specialChars, '\\$&');
    }
    
    // Validate input
    if (!Array.isArray(strings) || strings.length === 0) {
        throw new Error('Input must be a non-empty array of strings');
    }
    
    // Remove duplicates and empty strings
    const uniqueStrings = [...new Set(strings.filter(s => s && typeof s === 'string'))];
    
    if (uniqueStrings.length === 0) {
        throw new Error('No valid strings provided');
    }
    
    // Build trie and convert to regex
    const root = buildTrie(uniqueStrings);
    const pattern = trieToRegex(root);
    
    // Add word boundaries if requested
    let finalPattern = pattern;
    if (wordBoundaries) {
        finalPattern = '\\b' + pattern + '\\b';
    }
    
    return finalPattern;
}


/**
 * Main execution function
 */
async function main() {
	try {
		console.log('LSL Documentation Grammar Generator');
		console.log('================================');
		
		// Check if YAML file exists
		if (!(await fileExists(CONFIG.yamlPath))) {
			console.error(`❌ YAML file not found: ${CONFIG.yamlPath}`);
			process.exit(1);
		}
		
		// Check if Grammar file exists
		if (!(await fileExists(CONFIG.grammarPath))) {
			console.error(`❌ Grammar file not found: ${CONFIG.grammarPath}`);
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
		
		// await writeFile('src/content/data/lsl_definitions.json', JSON.stringify(definitions, null, '\t'), 'utf8');
		
		// Load Grammar
		console.log(`📖 Loading grammar from: ${CONFIG.grammarPath}`);
		const grammar = JSON.parse(await readFile(CONFIG.grammarPath, 'utf8'));
		
		// Update LSL Types
		const types = Object.keys(definitions.types);
		const patternTypes = grammar.repository.types.patterns.find(pattern => pattern.name == 'storage.type.lsl');
		patternTypes.match = createOptimizedRegex(types);
		
		// Update LSL Events
		const events = Object.keys(definitions.events);
		const patternEvents = grammar.repository.events.patterns.find(pattern => pattern.name == 'constant.language.events.lsl');
		patternEvents.match = createOptimizedRegex(events);
		
		// Update LSL Functions
		const functions = [];
		const functionsGodMode = [];
		const functionsDeprecated = [];
		for (const name in definitions.functions)
		{
			const definition = definitions.functions[name];
			if(definition.private) continue; // Skip anything marked as private (not to be included in generated documentation)
			
			if(definition.deprecated) functionsDeprecated.push(name);
			else if(definition['god-mode']) functionsGodMode.push(name);
			else functions.push(name);
		}
		
		const patternFunctions = grammar.repository.functions.patterns.find(pattern => pattern.name == 'support.function.lsl');
		const patternFunctionsGodMode = grammar.repository.functions.patterns.find(pattern => pattern.name == 'support.function.god-mode.lsl');
		const patternFunctionsDeprecated = grammar.repository.functions.patterns.find(pattern => pattern.name == 'invalid.deprecated.support.function.lsl');
		
		patternFunctions.match = createOptimizedRegex(functions);
		patternFunctionsGodMode.match = createOptimizedRegex(functionsGodMode);
		patternFunctionsDeprecated.match = createOptimizedRegex(functionsDeprecated);
		
		// Update LSL Constants
		const constants = [];
		const constantsDeprecated = [];
		for (const constant in definitions.constants)
		{
			if(constant == 'TRUE' || constant == 'FALSE') continue; // Skip boolean constants
			if(definitions.constants[constant].deprecated) constantsDeprecated.push(constant);
			else constants.push(constant);
		}
		
		const patternConstants = grammar.repository.constants.patterns.find(pattern => pattern.name == 'support.constant.lsl');
		const patternConstantsDeprecated = grammar.repository.constants.patterns.find(pattern => pattern.name == 'invalid.deprecated.constant.lsl');
		
		patternConstants.match = createOptimizedRegex(constants);
		patternConstantsDeprecated.match = createOptimizedRegex(constantsDeprecated);
		
		console.log(`📁 Writing to: ${CONFIG.grammarPath}`);
		await writeFile(CONFIG.grammarPath, JSON.stringify(grammar, null, '\t'), 'utf8');
		
		console.log('\n✅ Grammar generation completed successfully!');
		
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