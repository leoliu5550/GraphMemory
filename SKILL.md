---
name: FileSystemMemory
description: A powerful filesystem-based memory system for AI agents, allowing storage, retrieval, and management of memories (Short/Mid/Long-term) in Markdown format via CLI.
---

# File System Memory Skill

This skill empowers the AI agent to persist memories, goals, and rules directly into the user's workspace as Markdown files. 

## Capability Overview

The memory system is file-based and operates in the current working directory under `./memory_database`.
- **Hierarchical Storage**: `short_term` -> `mid_term` -> `long_term`.
- **Compression Workflow**: Agents can summarize `short_term` memories into `mid_term` to save context, while `archive` stores the raw logs.
- **Protected Memories**: Items marked as `goal` or `rule` are never compressed or archived automatically, ensuring they remain active.

## Usage Instructions for Agent

**IMPORTANT**: 
1. The tools are accessed via the `run.sh` script located in this skill's directory.
2. This script automatically installs dependencies (`npm install`) on first run if needed.
3. You **MUST** resolve the absolute path to `run.sh` before executing commands.
4. Use `<absolute_path_to_skill>/run.sh <command> ...`

### Commands

#### 1. Create Memory
Save a new memory, goal, or rule.
```bash
<skill_dir>/run.sh create "<title>" "<content>" [--tier short_term|mid_term|long_term] [--type memory|goal|rule] [--tags tag1,tag2]
```
- **Example**: `.../run.sh create "User Preference" "User prefers dark mode" --tags ui,config`

#### 2. Read Memory
Retrieve a specific memory file.
```bash
<skill_dir>/run.sh read "<filename>" [--tier tier]
```

#### 3. Update Memory
Modify content or move to a different tier.
```bash
<skill_dir>/run.sh update "<filename>" [--content "new content"] [--tier new_tier] [--tags tag1,tag2]
```

#### 4. List Memories
View available memories, optionally filtered.
```bash
<skill_dir>/run.sh list [--tier tier] [--type memory|goal|rule]
```

#### 5. Search Memories
Find memories by content or title.
```bash
<skill_dir>/run.sh search "<query>"
```

#### 6. Compress & Summarize
Get content for summarization.
```bash
<skill_dir>/run.sh compress <tier>
```
- **Workflow**:
    1. Run `compress <tier>` to get raw text.
    2. Summarize the text internally.
    3. Save the summary with `create` (to the next tier up).
    4. Archive the old files with `archive`.

#### 7. Archive Memories
Move files to the archive folder.
```bash
<skill_dir>/run.sh archive "file1.md,file2.md"
```

#### 8. Check Protected Context
List all active Goals and Rules.
```bash
<skill_dir>/run.sh protected
```

## System Requirements
- Node.js installed.
- Dependencies will be auto-installed by `run.sh`.

## Critical Instruction for Agents
To ensure you always operate with the User's core goals and rules in mind:
1. **ALWAYS run** `<skill_dir>/run.sh protected` at the start of your session.
2. **Read** any `goal` or `rule` files returned to fully understand the constraints.
3. The core files are located at:
   - `memory_database/long_term/00_core_goals.md`
   - `memory_database/long_term/00_core_rules.md`
   You can edit these files directly to update the enduring context.
