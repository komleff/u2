# Release Process

This document describes the release process for the U2 Flight Test Sandbox project.

## Overview

Releases follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backward compatible manner
- **PATCH** version when you make backward compatible bug fixes

## Release Checklist

### 1. Prepare the Release

Before creating a release, ensure:

- [ ] All planned features/fixes are merged to main branch
- [ ] All tests are passing
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated with changes
- [ ] No critical bugs are known

### 2. Version Update

1. Decide on the version number (e.g., `0.5.0`, `0.6.0`, `1.0.0`)
2. Update `package.json` with the new version if needed
3. Ensure version is consistent across all relevant files

### 3. Create CHANGELOG Entry

Update `CHANGELOG.md` with:
- Release version and date
- Summary of changes
- Added features
- Fixed bugs
- Breaking changes (if any)
- Known limitations
- Migration guide (if needed)

### 4. Create Release Notes

Create a file `RELEASE-NOTES-v{version}.md` with:
- Highlights and key features
- Technical specifications
- Getting started guide
- Known limitations
- Roadmap
- Links to documentation

### 5. Run Release Script

Use the automated release preparation script:

```bash
node scripts/prepare-release.mjs {version}
```

Example:
```bash
node scripts/prepare-release.mjs 0.5.0
```

This script will:
- ✅ Check git status (clean working tree)
- ✅ Validate tag doesn't exist
- ✅ Run tests
- ✅ Run linter
- ✅ Create git tag
- ✅ Provide next steps

### 6. Push Tag to GitHub

```bash
git push origin v{version}
```

Example:
```bash
git push origin v0.5.0
```

### 7. Create GitHub Release

1. Go to: https://github.com/dkomlev/u2/releases/new
2. Select the tag you just pushed (e.g., `v0.5.0`)
3. Set release title: `U2 Flight Test Sandbox v{version}`
4. Copy content from `RELEASE-NOTES-v{version}.md` as description
5. Attach any binary artifacts if applicable
6. Check "Set as the latest release" if appropriate
7. Click "Publish release"

### 8. Post-Release Tasks

After publishing the release:

- [ ] Announce the release (team channels, social media, etc.)
- [ ] Update project status documentation
- [ ] Create issues for next milestone if needed
- [ ] Archive release notes and changelog
- [ ] Update roadmap if needed

## Manual Release Process (Without Script)

If you need to create a release manually:

### 1. Verify Everything

```bash
# Check git status
git status

# Run tests
npm test

# Run linter
npm run lint
```

### 2. Create Tag

```bash
# Create annotated tag
git tag -a v{version} -m "Release v{version}"

# Push tag
git push origin v{version}
```

### 3. Create GitHub Release

Follow step 7 from the automated process above.

## Release Types

### Major Release (X.0.0)

Major releases include:
- Breaking changes
- Major new features
- Architecture changes
- API redesigns

Requires:
- Detailed migration guide
- Deprecation notices for removed features
- Comprehensive testing
- Extended documentation updates

### Minor Release (X.Y.0)

Minor releases include:
- New features (backward compatible)
- Performance improvements
- Enhanced functionality
- New documentation

Requires:
- Feature documentation
- Integration testing
- User guide updates

### Patch Release (X.Y.Z)

Patch releases include:
- Bug fixes
- Security patches
- Documentation fixes
- Minor improvements

Requires:
- Bug verification
- Regression testing
- CHANGELOG update

## Release Schedule

The U2 project follows a milestone-based release schedule:

- **M0.x**: Foundation releases (repository, build, ECS)
- **M1.x**: Physics releases
- **M2.x**: Network releases (protocol, server, client)
- **M3.x**: Flight assist releases
- **M4.x**: HUD releases
- **M5.x**: Combat releases
- **M6.x**: Optimization releases

See `ROADMAP.md` for the complete development timeline.

## Version Numbering Strategy

Current strategy (v0.x.x):
- Each completed milestone increments minor version
- Bug fixes and patches increment patch version
- Breaking changes will trigger 1.0.0 when stable

Example:
- `0.5.0` - M2.3 complete (client prediction)
- `0.6.0` - M3 complete (flight assist)
- `0.7.0` - M4 complete (HUD)
- `1.0.0` - First stable release (all core features complete)

## Hotfix Process

For critical bugs in released versions:

1. Create hotfix branch from release tag
   ```bash
   git checkout -b hotfix/v0.5.1 v0.5.0
   ```

2. Fix the bug and test thoroughly

3. Update CHANGELOG.md with hotfix details

4. Create new patch version
   ```bash
   git tag -a v0.5.1 -m "Hotfix v0.5.1: Critical bug fix"
   git push origin v0.5.1
   ```

5. Create GitHub release

6. Merge hotfix back to main
   ```bash
   git checkout main
   git merge hotfix/v0.5.1
   git push origin main
   ```

## Pre-Release Versions

For beta/RC releases, use version suffixes:

```bash
# Beta release
v0.6.0-beta.1

# Release candidate
v0.6.0-rc.1

# Alpha release
v0.6.0-alpha.1
```

Example workflow:
```bash
# Create beta
node scripts/prepare-release.mjs 0.6.0-beta.1
git push origin v0.6.0-beta.1

# Create RC after testing
node scripts/prepare-release.mjs 0.6.0-rc.1
git push origin v0.6.0-rc.1

# Create final release
node scripts/prepare-release.mjs 0.6.0
git push origin v0.6.0
```

On GitHub, mark pre-releases by checking "Set as a pre-release" instead of "Set as the latest release".

## Rollback Procedure

If a release has critical issues:

1. Do NOT delete the release or tag
2. Create a hotfix immediately (see Hotfix Process)
3. Mark the problematic release on GitHub with a warning
4. Publish hotfix as new patch version
5. Document the issue in CHANGELOG

## Release Artifacts

Current releases include:
- Source code (automatic from tag)
- CHANGELOG.md
- RELEASE-NOTES-v{version}.md
- Documentation in `docs/`

Future releases may include:
- Compiled binaries
- Docker images
- npm packages
- Distribution builds

## Questions?

For questions about the release process, see:
- Project README: `README.md`
- Roadmap: `ROADMAP.md`
- Issues: https://github.com/dkomlev/u2/issues

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-20  
**Maintainer**: U2 Development Team
