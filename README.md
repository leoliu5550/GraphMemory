# GraphMemory - AI Agent Skill

This project provides a filesystem-based memory system for AI agents (specifically aligned with Gemini Agent Skills).
It allows agents to maintain Short/Mid/Long-term memories, set Goals, and enforce Rules as persistent Markdown files in your workspace.

## Installation

### 1. Link as a Gemini Skill

To use this skill with Gemini CLI:

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/leoliu5550/GraphMemory.git
cd GraphMemory

# Install dependencies (CRITICAL: The agent relies on these)
npm install

# Link to your user skills (available across workspaces)
gemini skills link . 

# Or install to a specific workspace
gemini skills link . --scope workspace
```

### 2. Verify Installation

```bash
gemini skills list
```
You should see `FileSystemMemory` in the list.

## Usage

Once installed, Gemini will automatically detect when you need memory management.
You can prompt Gemini like:
- "Please remember that I prefer TypeScript for all new projects."
- "What are my current long-term goals?"
- "Compress my short-term memories into a weekly summary."

### Manual CLI Usage

You can also use the tool manually:

```bash
node app.js create "My First Memory" "This is a test." --tags manual,test
```

## Structure

Memories are stored in `./memory_database` within your current working directory.
- `short_term/`: Recent interactions.
- `mid_term/`: Summarized context.
- `long_term/`: Core knowledge base.
- `archive/`: Old logs.

Files are standard Markdown with YAML frontmatter.

## License
ISC