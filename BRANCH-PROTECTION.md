# Branch Protection Policy

## Main Branch Protection

The `main` branch is protected from direct commits to prevent accidental changes by AI agents or developers.

### Protection Mechanisms

1. **Local Git Hook** (`.git/hooks/pre-commit`)
   - Blocks commits when checked out on `main`
   - Provides immediate feedback before commit

2. **GitHub Actions** (`.github/workflows/protect-main.yml`)
   - Blocks direct pushes to `main` on remote
   - Triggers on any push attempt to main branch

### Recommended Workflow

All changes (including AI-generated code) must go through Pull Requests:

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### AI Agent Workflow

AI agents (ChatGPT, Claude, Gemini) should:

- Always create new feature branches: `feature/agent-name-task`
- Work exclusively in their branches
- Request PR creation when ready
- Never checkout or commit to `main`

### Branch Naming Convention

- `feature/chatgpt-*` - ChatGPT agent branches
- `feature/claude-*` - Claude agent branches  
- `feature/gemini-*` - Gemini agent branches
- `copilot/*` - GitHub Copilot agent branches
- `bugfix/*` - Bug fix branches
- `docs/*` - Documentation branches

### Bypass (Not Recommended)

To temporarily bypass the local hook (emergency only):

```bash
git commit --no-verify -m "Emergency fix"
```

⚠️ This will still be blocked by GitHub Actions on push.

### GitHub Repository Settings

For complete protection, configure on GitHub:

1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Enable:
   - Require pull request before merging
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators (optional)
