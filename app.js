#!/usr/bin/env node
import { 
    createMemory, 
    readMemory, 
    updateMemory, 
    searchMemory, 
    listMemories, 
    getMemoriesForCompression, 
    archiveMemories 
} from './memory_manager.js';

const [,, command, ...args] = process.argv;

async function main() {
    try {
        switch (command) {
            case 'create': {
                const title = args[0];
                const content = args[1];
                const tier = getFlag(args, '--tier') || 'short_term';
                const type = getFlag(args, '--type') || 'memory';
                const tags = getFlag(args, '--tags')?.split(',') || [];
                const result = await createMemory(content, { title, tags, tier, type });
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'read': {
                const filename = args[0];
                const tier = getFlag(args, '--tier');
                const result = await readMemory(filename, tier);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'update': {
                const filename = args[0];
                const content = getFlag(args, '--content');
                const tier = getFlag(args, '--tier');
                const tags = getFlag(args, '--tags')?.split(',');
                const result = await updateMemory(filename, content, { tier, tags });
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'list': {
                const tier = getFlag(args, '--tier');
                const type = getFlag(args, '--type');
                const result = await listMemories({ tier, type });
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'search': {
                const query = args[0];
                const result = await searchMemory(query);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'compress': {
                const tier = args[0];
                const result = await getMemoriesForCompression(tier);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'archive': {
                const filenames = args[0].split(',');
                const result = await archiveMemories(filenames);
                console.log(JSON.stringify(result, null, 2));
                break;
            }
            case 'protected': {
                const goals = await listMemories({ type: 'goal' });
                const rules = await listMemories({ type: 'rule' });
                console.log(JSON.stringify({ goals, rules }, null, 2));
                break;
            }
            default:
                console.log("Usage: node app.js <command> [args]");
                console.log("Commands: create, read, update, list, search, compress, archive, protected");
        }
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }, null, 2));
        process.exit(1);
    }
}

function getFlag(args, flag) {
    const index = args.indexOf(flag);
    if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
    }
    return null;
}

main();