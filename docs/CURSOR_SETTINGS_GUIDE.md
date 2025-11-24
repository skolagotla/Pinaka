# Cursor Settings Configuration Guide

This guide will help you optimize Cursor for better AI assistance with your Pinaka project.

## Quick Setup Steps

### 1. Access Cursor Settings
- **Mac**: `Cmd + ,` (Command + Comma)
- **Windows/Linux**: `Ctrl + ,`
- Or: `Cursor` → `Settings` → `Preferences`

### 2. Key Settings to Configure

#### A. AI Model Selection
**Path**: `Settings` → `Features` → `Model`

**Recommended Models** (in order of preference):
1. **Claude 3.5 Sonnet** - Best for complex code understanding and refactoring
2. **GPT-4 Turbo** - Excellent for code generation and debugging
3. **GPT-4** - Good balance of quality and speed
4. **Claude 3 Opus** - Great for large codebases

**How to switch**:
- Click the model name in the chat interface (top right)
- Or go to Settings → Features → Model

#### B. Code Completion Settings
**Path**: `Settings` → `Features` → `Code Completion`

**Recommended Settings**:
- ✅ Enable "Inline Suggestions" (Cmd/Ctrl + K)
- ✅ Enable "Tab to Accept"
- Set "Max Suggestions" to 3-5
- Enable "Show Suggestions While Typing"

#### C. Composer Settings
**Path**: `Settings` → `Features` → `Composer`

**Recommended Settings**:
- ✅ Enable "Multi-file Editing"
- Set "Max Files" to 10-15 (for large refactors)
- Enable "Auto-format on Accept"

#### D. Context Window
**Path**: `Settings` → `Features` → `Context`

**Recommended Settings**:
- ✅ Enable "Include Related Files"
- ✅ Enable "Include Open Files"
- Set "Max Context" to 50,000-100,000 tokens (for large codebases)
- ✅ Enable "Use .cursorrules file" (we just created this!)

### 3. Workspace-Specific Settings

#### Create `.vscode/settings.json` (if it doesn't exist)
```json
{
  "cursor.ai.enableCodeCompletion": true,
  "cursor.ai.enableInlineSuggestions": true,
  "cursor.ai.model": "claude-3-5-sonnet",
  "cursor.ai.maxContextTokens": 100000,
  "cursor.ai.includeRelatedFiles": true,
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

### 4. Keyboard Shortcuts (Highly Recommended)

**Essential Shortcuts**:
- `Cmd/Ctrl + K` - Inline code suggestions
- `Cmd/Ctrl + I` - Open Composer (multi-file editing)
- `Cmd/Ctrl + L` - Open Chat (this interface)
- `Tab` - Accept suggestion
- `Esc` - Dismiss suggestion

**To customize**:
1. `Cmd/Ctrl + K, Cmd/Ctrl + S` (Keyboard Shortcuts)
2. Search for "cursor" to find all Cursor-specific shortcuts
3. Customize as needed

### 5. File Exclusions (Improve Performance)

Add to your workspace `.gitignore` or create `.cursorignore`:

```
# Cursor ignore patterns
node_modules/
.next/
dist/
build/
*.log
.env*
coverage/
.DS_Store
```

### 6. Enable Advanced Features

**Path**: `Settings` → `Features`

**Enable**:
- ✅ "Codebase Indexing" - Helps AI understand your codebase
- ✅ "Semantic Search" - Better code search
- ✅ "Auto-import Suggestions" - Suggests imports
- ✅ "Error Detection" - Highlights errors in real-time

### 7. Chat Preferences

**In Chat Interface**:
- Use `@codebase` to search your codebase
- Use `@files` to reference specific files
- Use `@docs` to reference documentation
- Use `@web` to search the web

**Example prompts**:
- `@codebase How does the authentication work?`
- `@files apps/web-app/app/admin/login/page.jsx Fix the login form`
- `@docs What is the API structure?`

## Best Practices for AI Assistance

### 1. Be Specific
❌ "Fix this"
✅ "Add error handling to the fetchLogs function in admin/audit-logs/page.jsx"

### 2. Provide Context
❌ "Make it work"
✅ "The Table component is using compound components. Convert it to use separate imports like we did in admin/audit-logs/page.jsx"

### 3. Reference Existing Code
✅ "Make this similar to the admin dashboard"
✅ "Follow the same pattern as the landlord properties page"

### 4. Use Multi-file Edits
- Use Composer (`Cmd/Ctrl + I`) for changes across multiple files
- Example: "Convert all admin pages to use Flowbite Pro components"

### 5. Iterative Refinement
- Start with a high-level request
- Refine based on results
- Ask follow-up questions

## Troubleshooting

### AI Not Understanding Context
1. Check if `.cursorrules` file exists (we created it!)
2. Ensure "Use .cursorrules file" is enabled in settings
3. Try restarting Cursor
4. Use `@codebase` in chat to force codebase search

### Slow Suggestions
1. Reduce "Max Context" tokens
2. Exclude large directories (node_modules, .next)
3. Close unused files
4. Try a faster model (GPT-3.5 instead of GPT-4)

### Wrong Suggestions
1. Be more specific in your prompts
2. Reference similar code that works
3. Use `@files` to point to correct examples
4. Update `.cursorrules` with project-specific patterns

## Advanced Configuration

### Custom Rules in `.cursorrules`
We've created a `.cursorrules` file with:
- Project architecture patterns
- Code style conventions
- Common patterns to follow
- Things to avoid

**To update**: Edit `.cursorrules` in the root directory.

### Model-Specific Settings
Different models have different strengths:
- **Claude**: Better at understanding large codebases
- **GPT-4**: Better at code generation
- **GPT-3.5**: Faster, good for simple tasks

Switch models based on your task!

## Next Steps

1. ✅ Review and adjust settings above
2. ✅ Test inline suggestions (`Cmd/Ctrl + K`)
3. ✅ Try Composer for multi-file edits (`Cmd/Ctrl + I`)
4. ✅ Use `@codebase` in chat for codebase questions
5. ✅ Customize `.cursorrules` as your project evolves

## Need Help?

- Check Cursor docs: https://cursor.sh/docs
- Ask in chat: "How do I [specific task]?"
- Use `@docs` to search Cursor documentation

---

**Pro Tip**: The `.cursorrules` file we created will help Cursor understand your project better. Update it as your codebase evolves!

