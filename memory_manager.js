import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const MEMORY_DIR = path.resolve('./memory_database');
const TIERS = ['short_term', 'mid_term', 'long_term', 'archive'];

// Ensure directories exist
TIERS.forEach(tier => {
    const dir = path.join(MEMORY_DIR, tier);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function getFilePath(tier, filename) {
    return path.join(MEMORY_DIR, tier, filename);
}

function sanitizeFilename(title) {
    return title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.md';
}

export async function createMemory(content, { title, tags = [], tier = 'short_term', type = 'memory', related = [] } = {}) {
    if (!TIERS.includes(tier)) {
        throw new Error(`Invalid tier: ${tier}. Must be one of ${TIERS.join(', ')}`);
    }

    const filename = sanitizeFilename(title);
    const filePath = getFilePath(tier, filename);

    if (fs.existsSync(filePath)) {
        throw new Error(`Memory with title "${title}" already exists in ${tier}.`);
    }

    const frontmatter = {
        title,
        tags,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tier
    };

    if (related && related.length > 0) {
        frontmatter.related = related;
    }

    if (type === 'goal' || type === 'rule') {
        frontmatter.protected = true;
    }

    const fileContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(filePath, fileContent);
    return { filename, tier, message: "Memory created successfully." };
}

export async function readMemory(filename, tier = null) {
    // If tier is specific, look there. Otherwise search all tiers.
    let filePath;
    if (tier) {
         filePath = getFilePath(tier, filename);
         if (!fs.existsSync(filePath)) throw new Error(`File not found in ${tier}: ${filename}`);
    } else {
        // Search all tiers
        for (const t of TIERS) {
            const tempPath = getFilePath(t, filename);
            if (fs.existsSync(tempPath)) {
                filePath = tempPath;
                tier = t;
                break;
            }
        }
        if (!filePath) throw new Error(`File not found: ${filename}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent);
    return { ...parsed.data, content: parsed.content, tier };
}

export async function updateMemory(filename, content, { tags, tier, related } = {}) {
    const current = await readMemory(filename);
    const oldTier = current.tier;
    const newTier = tier || oldTier;
    
    // If tier changes, we need to move the file
    if (newTier !== oldTier) {
        const oldPath = getFilePath(oldTier, filename);
        const newPath = getFilePath(newTier, filename);
        if (fs.existsSync(newPath)) {
             throw new Error(`Cannot move memory. File already exists in ${newTier}: ${filename}`);
        }
        fs.renameSync(oldPath, newPath);
    }
    
    const filePath = getFilePath(newTier, filename);
    
    const newFrontmatter = {
        ...current,
        updated_at: new Date().toISOString(),
        tier: newTier
    };
    
    if (tags) newFrontmatter.tags = tags;
    if (related) newFrontmatter.related = related;
    // Don't overwrite protected content if not explicitly handled? 
    // For now assuming update is allowed, but compression is what respects 'protected'

    const fileContent = matter.stringify(content || current.content, newFrontmatter);
    fs.writeFileSync(filePath, fileContent);
    return { filename, tier: newTier, message: "Memory updated successfully." };
}

export async function deleteMemory(filename) {
     for (const t of TIERS) {
            const tempPath = getFilePath(t, filename);
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
                return { message: `Deleted ${filename} from ${t}` };
            }
        }
    throw new Error(`File not found: ${filename}`);
}

export async function listMemories({ tier, type } = {}) {
    let files = [];
    const searchTiers = tier ? [tier] : TIERS;
    
    for (const t of searchTiers) {
        // Use glob to find .md files
        const tierFiles = await glob(`${MEMORY_DIR}/${t}/*.md`);
        for (const f of tierFiles) {
            const content = fs.readFileSync(f, 'utf8');
            const parsed = matter(content);
            if (type && parsed.data.type !== type) continue;
            
            files.push({
                filename: path.basename(f),
                tier: t,
                title: parsed.data.title,
                type: parsed.data.type,
                tags: parsed.data.tags,
                related: parsed.data.related || []
            });
        }
    }
    return files;
}

export async function searchMemory(query) {
    const allMemories = await listMemories();
    const results = [];
    for (const mem of allMemories) {
        const full = await readMemory(mem.filename, mem.tier);
        if (full.content.toLowerCase().includes(query.toLowerCase()) || 
            full.title.toLowerCase().includes(query.toLowerCase())) {
            results.push(full);
        }
    }
    return results;
}

export async function getMemoriesForCompression(tier) {
    if (!TIERS.includes(tier)) throw new Error("Invalid tier");
    
    const memories = await listMemories({ tier });
    // Filter out protected (goal/rule)
    const compressible = memories.filter(m => m.type !== 'goal' && m.type !== 'rule');
    
    const contents = [];
    for (const m of compressible) {
        const full = await readMemory(m.filename, m.tier);
        contents.push(`--- Memory: ${full.title} ---\n${full.content}\n`);
    }
    return {
        files: compressible.map(m => m.filename),
        content: contents.join('\n')
    };
}

export async function archiveMemories(filenames) {
    const results = [];
    for (const f of filenames) {
        try {
             await updateMemory(f, null, { tier: 'archive' });
             results.push(f);
        } catch (e) {
            console.error(`Failed to archive ${f}: ${e.message}`);
        }
    }
    return results;
}

export async function generateGraph() {
    const memories = await listMemories();
    let mermaidStr = 'graph TD;\n';
    
    // Add nodes
    for (const m of memories) {
        const titleSafe = m.title.replace(/["']/g, '');
        mermaidStr += `    ${m.filename.replace('.md', '')}["${titleSafe}"];\n`;
    }

    // Add edges
    for (const m of memories) {
        const sourceId = m.filename.replace('.md', '');
        for (const rel of m.related || []) {
            const targetId = rel.replace('.md', '');
            mermaidStr += `    ${sourceId} --> ${targetId};\n`;
        }
    }

    return mermaidStr;
}
