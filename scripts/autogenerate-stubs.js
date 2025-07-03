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
	docsPath: 'src/content/docs',
	categories: ['constants', 'events', 'functions', 'types', 'controls'],
	stubEditorial: 'stub'
};

/**
 * Escape problematic characters for MDX content
 */
function escapeForMDX(text) {
	if (!text) return text;
	
	return text
		// De-escape newlines FIRST (before escaping backslashes)
		.replaceAll(/\\n/g, '\n')
		// Escape HTML/XML characters that could interfere with MDX
		.replaceAll(/&/g, '&amp;')
		.replaceAll(/</g, '&lt;')
		.replaceAll(/>/g, '&gt;')
		// Escape backslashes (but not already escaped ones)
		.replaceAll(/\\(?![\\&])/g, '\\\\')
		// Handle quotes carefully - only escape if they might cause issues
		.replaceAll(/"/g, '&quot;')
		// Handle special MDX characters
		.replaceAll(/\{/g, '\\{')
		.replaceAll(/\}/g, '\\}');
}

/**
 * Parse frontmatter from MDX content
 */
function parseFrontmatter(content) {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
	const match = content.match(frontmatterRegex);
	
	if (!match) {
		return { frontmatter: {}, content: content };
	}
	
	try {
		const frontmatter = load(match[1]) || {};
		const bodyContent = content.slice(match[0].length).trim();
		return { frontmatter, content: bodyContent };
	} catch (error) {
		console.error('Error parsing frontmatter:', error);
		return { frontmatter: {}, content: content };
	}
}

/**
 * Generate frontmatter string
 */
function generateFrontmatter(data) {
	return '---\n' + dump(data, { 
		indent: 2,
		lineWidth: -1,
		noRefs: true 
	}) + '---\n';
}

/**
 * Generate frontmatter for an item
 */
function generateItemFrontmatter(itemName, categoryName, itemData) {
	const frontmatter = {
		title: itemName,
		slug: `${categoryName}/${itemName}`,
		editorial: CONFIG.stubEditorial,
		category: categoryName,
		...(itemData.deprecated && { deprecated: true }),
		...(itemData.version && { version: itemData.version }),
		...(itemData.tags && { tags: itemData.tags })
	};

	return generateFrontmatter(frontmatter);
}

/**
 * Generate function stub content
 */
function generateFunctionStub(itemName, itemData, categoryName) {
	const frontmatter = generateItemFrontmatter(itemName, categoryName, itemData);
	const description = escapeForMDX(itemData.tooltip || itemData.description || 'No description available.');
	const args = itemData.arguments || [];
	
	// Format arguments for the component - YAML structure is an array of objects
	// where each object has one key (the parameter name) with type/tooltip properties
	const argumentsArray = args.map(argObj => {
		// Each argument is an object with one key (the parameter name)
		const paramName = Object.keys(argObj)[0];
		const paramData = argObj[paramName];
		
		return {
			name: paramName,
			type: paramData.type || 'unknown',
			description: (paramData.tooltip || paramData.description)? escapeForMDX(paramData.tooltip || paramData.description) : undefined
		};
	});
	
	const props = {
		name: itemName,
		returnType: itemData.return || 'void',
		arguments: JSON.stringify(argumentsArray, null, '\t'),
	};
	if(itemData.energy != 10) props.energy = itemData.energy;
	if(itemData.sleep != 0) props.sleep = itemData.sleep;
	
	return `${frontmatter}import LSLFunction from '/src/templates/LSLFunction.astro'

<LSLFunction
	name="${itemName}"
	returnType="${itemData.return || 'void'}"
	arguments={${JSON.stringify(argumentsArray, null, '\t')}}${
	itemData.energy != 10? `\n\tenergy={${itemData.energy}}` : ''}${
	itemData.sleep != 0? `\n\tsleep={${itemData.sleep}}` : ''}
>
	<Fragment slot="description">
		${description.replace(/\n/g, '\n\t\t\n\t\t')}
	</Fragment>
</LSLFunction>
`;
}

/**
 * Generate constant stub content
 */
function generateConstantStub(itemName, itemData, categoryName) {
	const frontmatter = generateItemFrontmatter(itemName, categoryName, itemData);
	const description = escapeForMDX(itemData.tooltip || itemData.description || 'No description available.');
	const value = itemData.value !== undefined ? String(itemData.value) : 'unknown';
	const type = itemData.type || 'unknown';
	
	return `${frontmatter}import LSLConstant from '/src/templates/LSLConstant.astro'

<LSLConstant
	name="${itemName}"
	type="${type}"
	value="${escapeForMDX(value)}"
>
	<Fragment slot="description">
		${description.replace(/\n/g, '\n\t\t')}
	</Fragment>
</LSLConstant>
`;
}

/**
 * Generate event stub content
 */
function generateEventStub(itemName, itemData, categoryName) {
	const frontmatter = generateItemFrontmatter(itemName, categoryName, itemData);
	const description = escapeForMDX(itemData.tooltip || itemData.description || 'No description available.');
	const args = itemData.arguments || [];
	
	// Format arguments for the component - YAML structure is an array of objects
	// where each object has one key (the parameter name) with type/tooltip properties
	const argumentsArray = args.map(argObj => {
		// Each argument is an object with one key (the parameter name)
		const paramName = Object.keys(argObj)[0];
		const paramData = argObj[paramName];
		
		return {
			name: paramName,
			type: paramData.type || 'unknown',
			description: escapeForMDX(paramData.tooltip || paramData.description || 'No description available.')
		};
	});
	
	return `${frontmatter}import LSLEvent from '/src/templates/LSLEvent.astro'

<LSLEvent
	name="${itemName}"
	arguments={${JSON.stringify(argumentsArray, null, '\t')}}
>
	<Fragment slot="description">
		${description.replace(/\n/g, '\n\t\t')}
	</Fragment>
</LSLEvent>
`;
}

/**
 * Generate type stub content
 */
function generateTypeStub(itemName, itemData, categoryName) {
	const frontmatter = generateItemFrontmatter(itemName, categoryName, itemData);
	const description = escapeForMDX(itemData.tooltip || itemData.description || 'No description available.');
	
	return `${frontmatter}import LSLType from '/src/templates/LSLType.astro'

<LSLType
	name="${itemName}"
>
	<Fragment slot="description">
		${description.replace(/\n/g, '\n\t\t')}
	</Fragment>
</LSLType>
`;
}

/**
 * Generate control stub content
 */
function generateControlStub(itemName, itemData, categoryName) {
	const frontmatter = generateItemFrontmatter(itemName, categoryName, itemData);
	const description = escapeForMDX(itemData.tooltip || itemData.description || 'No description available.');
	
	return `${frontmatter}import LSLControl from '/src/templates/LSLControl.astro'

<LSLControl
	name="${itemName}"
>
	<Fragment slot="description">
		${description.replace(/\n/g, '\n\t\t')}
	</Fragment>
</LSLControl>
`;
}

/**
 * Generate MDX stub content
 */
function generateStubContent(item, category) {
	const itemName = item.name || item.title;
	
	switch (category) {
		case 'functions':
			return generateFunctionStub(itemName, item, category);
		case 'constants':
			return generateConstantStub(itemName, item, category);
		case 'events':
			return generateEventStub(itemName, item, category);
		case 'types':
			return generateTypeStub(itemName, item, category);
		case 'controls':
			return generateControlStub(itemName, item, category);
		default:
			// Fallback for unknown categories
			const frontmatter = generateItemFrontmatter(itemName, category, item);
			const description = escapeForMDX(item.description || item.tooltip || 'No description available.');
			return `${frontmatter}# ${itemName}

${description.replace(/\n/g, '\n')}

<!-- TODO: Add content for ${category} -->
`;
	}
}

/**
 * Create filename from item name
 */
function createFilename(name) {
	return name.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '') + '.mdx';
}

/**
 * Ensure directory exists
 */
async function ensureDirectory(dirPath) {
	try {
		await mkdir(dirPath, { recursive: true });
	} catch (error) {
		if (error.code !== 'EEXIST') {
			throw error;
		}
	}
}

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
 * Check if file should be updated
 */
async function shouldUpdateFile(filePath) {
	try {
		const content = await readFile(filePath, 'utf8');
		const { frontmatter } = parseFrontmatter(content);
		return frontmatter.editorial === CONFIG.stubEditorial;
	} catch (error) {
		// File doesn't exist, should create it
		return true;
	}
}

/**
 * Process category items
 */
async function processCategory(definitions, category) {
	const categoryPath = join(CONFIG.docsPath, category);
	await ensureDirectory(categoryPath);
	
	const categoryData = definitions[category] || {};
	let created = 0;
	let updated = 0;
	let skipped = 0;
	let deleted = 0;
	
	console.log(`\nProcessing ${category}:`);
	
	// Get all entries including private ones to check for cleanup
	const allEntries = Object.entries(categoryData);
	
	// Convert object to array of items with names, filtering out private entries
	const items = allEntries
		.filter(([name, data]) => !data.private)
		.map(([name, data]) => ({
			name,
			...data
		}));

	// Check for and delete any files that correspond to private entries
	const privateEntries = allEntries
		.filter(([name, data]) => data.private)
		.map(([name, data]) => ({ name, ...data }));

	for (const privateItem of privateEntries) {
		const filename = createFilename(privateItem.name);
		const filePath = join(categoryPath, filename);
		
		if (await fileExists(filePath)) {
			try {
				await unlink(filePath);
				deleted++;
				console.log(`  🗑️  Deleted private: ${filename}`);
			} catch (error) {
				console.log(`  ❌ Failed to delete: ${filename} - ${error.message}`);
			}
		}
	}
	
	// Process public entries
	for (const item of items) {
		const filename = createFilename(item.name || item.title);
		const filePath = join(categoryPath, filename);
		
		const exists = await fileExists(filePath);
		const shouldUpdate = await shouldUpdateFile(filePath);
		
		if (shouldUpdate) {
			const content = generateStubContent(item, category);
			await writeFile(filePath, content, 'utf8');
			
			if (exists) {
				updated++;
				console.log(`  ✓ Updated: ${filename}`);
			} else {
				created++;
				console.log(`  + Created: ${filename}`);
			}
		} else {
			skipped++;
			console.log(`  - Skipped: ${filename} (not a stub)`);
		}
	}
	
	console.log(`  Summary: ${created} created, ${updated} updated, ${skipped} skipped, ${deleted} deleted`);
	return { created, updated, skipped, deleted };
}

/**
 * Get existing files in docs directories
 */
async function getExistingFiles() {
	const existingFiles = new Set();
	
	for (const category of CONFIG.categories) {
		const pattern = join(CONFIG.docsPath, category, '*.mdx');
		const files = await glob(pattern);
		
		files.forEach(file => {
			const relativePath = relative(CONFIG.docsPath, file);
			existingFiles.add(relativePath);
		});
	}
	
	return existingFiles;
}

/**
 * Main execution function
 */
async function main() {
	try {
		console.log('LSL Documentation Stub Generator');
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
		
		// Get existing files for reference
		const existingFiles = await getExistingFiles();
		console.log(`📁 Found ${existingFiles.size} existing documentation files`);
		
		// Process each category
		let totalCreated = 0;
		let totalUpdated = 0;
		let totalSkipped = 0;
		let totalDeleted = 0;
		
		for (const category of CONFIG.categories) {
			if (definitions[category]) {
				const result = await processCategory(definitions, category);
				totalCreated += result.created;
				totalUpdated += result.updated;
				totalSkipped += result.skipped;
				totalDeleted += result.deleted;
			} else {
				console.log(`\n⚠️  Category '${category}' not found in YAML definitions`);
			}
		}
		
		// Final summary
		console.log('\n📊 Final Summary:');
		console.log(`   Created: ${totalCreated} files`);
		console.log(`   Updated: ${totalUpdated} files`);
		console.log(`   Skipped: ${totalSkipped} files`);
		console.log(`   Deleted: ${totalDeleted} files`);
		console.log('\n✅ Stub generation completed successfully!');
		
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
	main,
	parseFrontmatter,
	generateStubContent,
	createFilename,
	escapeForMDX
};