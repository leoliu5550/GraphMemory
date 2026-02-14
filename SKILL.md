---
name: FileSystemMemory
description: A filesystem-based memory system for LLMs to store, retrieve, and manage memories in Markdown format. Supports tiered storage (short/mid/long term) and compression.
---

# File System Memory Skill

This skill allows the agent to interact with a local filesystem-based memory database. Memories are stored as Markdown files with YAML frontmatter.

## Tools

### `create_memory`
Creates a new memory file.
- **Arguments**:
  - `content` (string): The body of the memory.
  - `title` (string): Distinctive title for the memory.
  - `tags` (array of strings, optional): Tags for categorization.
  - `tier` (string, optional): One of `short_term` (default), `mid_term`, `long_term`.
  - `type` (string, optional): `memory` (default), `goal`, `rule`. Goals and Rules are protected from compression.

### `read_memory`
Reads a memory by filename.
- **Arguments**:
  - `filename` (string): The filename to read (e.g., `my_memory.md`).
  - `tier` (string, optional): Specific tier to look in.

### `update_memory`
Updates an existing memory.
- **Arguments**:
  - `filename` (string): The filename to update.
  - `content` (string, optional): New content.
  - `tags` (array of strings, optional): New tags.
  - `tier` (string, optional): Move to a new tier (e.g., promote to `mid_term`).

### `search_memory`
Searches for memories by text content or title.
- **Arguments**:
  - `query` (string): The search query.

### `compress_tier`
Helper to retrieve memories for compression.
- **Arguments**:
  - `tier` (string): The tier to compress (e.g., `short_term`).
- **Returns**: A combined string of all non-protected memories in that tier, and a list of filenames to be archived.
- **Usage**:
  1. Call `compress_tier`.
  2. Summarize the returned content.
  3. Call `create_memory` with the summary (placing it in the next tier up).
  4. Call `archive_memories` with the list of filenames returned by `compress_tier`.

### `archive_memories`
Moves memories to the `archive` tier.
- **Arguments**:
  - `filenames` (array of strings): List of filenames to archive.

### `retrieve_protected_context`
Retrieves all `goal` and `rule` memories to provide persistent context.
- **Arguments**: none.

## Examples

### Creating a Goal
```javascript
create_memory("I want to learn Rust.", { title: "Rust Learning Goal", type: "goal", tags: ["learning", "rust"] })
```

### Compressing Short Term Memory
```javascript
// Step 1: Get content
const data = compress_tier("short_term");
// Step 2: Agent summarizes data.content -> "User studied loops and variables."
// Step 3: Save summary to mid_term
create_memory("User studied loops and variables.", { title: "Rust Progress Week 1", tier: "mid_term" });
// Step 4: Archive old files
archive_memories(data.files);
```
