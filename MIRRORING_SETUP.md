# Repository Mirroring Setup Guide

This document explains how the live mirroring between the organization repository and personal repository is configured and how to use it.

## 📋 Overview

The project maintains two synchronized repositories:
- **Organization Repository**: `https://github.com/falqondev/data-intelligence-diagnosis.git`
- **Personal Repository**: `https://github.com/hugo-ferraro/data-intelligence-diagnosis.git`

## 🔧 Setup Configuration

### Remote Configuration
The repository has two remotes configured:
```bash
origin    https://github.com/falqondev/data-intelligence-diagnosis.git (organization)
personal  https://github.com/hugo-ferraro/data-intelligence-diagnosis.git (personal)
```

### Mirroring Scripts
Two scripts have been created to automate the mirroring process:

1. **`mirror-to-personal.ps1`** - PowerShell script with colored output
2. **`mirror.bat`** - Simple batch file for easy execution

## 🚀 How to Use

### Method 1: PowerShell Script (Recommended)
```powershell
.\mirror-to-personal.ps1
```

### Method 2: Batch File
```batch
mirror.bat
```
Or simply double-click the `mirror.bat` file.

### Method 3: Manual Commands
```bash
git push origin master
git push personal master
```

## 📝 Workflow

### Standard Development Workflow
1. Make your changes to the code
2. Stage changes: `git add .`
3. Commit changes: `git commit -m "Your commit message"`
4. Run mirror script: `.\mirror-to-personal.ps1`

### What the Mirror Script Does
1. Pushes to the organization repository (`origin`)
2. Automatically pushes to the personal repository (`personal`)
3. Provides visual feedback with colored output
4. Confirms both repositories are in sync

## 🔍 Verification

### Check Remote Status
```bash
git remote -v
```

### Check Repository Status
```bash
git status
```

### Verify Both Repositories Are in Sync
Visit both repositories in your browser:
- Organization: https://github.com/falqondev/data-intelligence-diagnosis
- Personal: https://github.com/hugo-ferraro/data-intelligence-diagnosis

## ⚠️ Important Notes

### Authentication
- Ensure you have proper authentication set up for both repositories
- You may need to configure SSH keys or use personal access tokens
- The organization repository may require different credentials than your personal repository

### Branch Management
- The mirroring is configured for the `master` branch
- If you work on feature branches, you'll need to push them manually to both repositories
- Consider creating a similar script for other branches if needed

### Conflict Resolution
- Always pull from the organization repository first: `git pull origin master`
- Resolve any conflicts before pushing to either repository
- The personal repository should always mirror the organization repository

## 🛠️ Troubleshooting

### If Mirror Script Fails
1. Check your authentication: `git remote -v`
2. Verify you have access to both repositories
3. Try pushing manually to identify the issue:
   ```bash
   git push origin master
   git push personal master
   ```

### If Repositories Get Out of Sync
1. Pull the latest from organization: `git pull origin master`
2. Force push to personal: `git push personal master --force` (use with caution)
3. Run the mirror script to verify sync

### Adding New Remotes
If you need to add additional remotes:
```bash
git remote add <remote-name> <repository-url>
```

## 📚 Additional Resources

- [Git Remote Documentation](https://git-scm.com/docs/git-remote)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub SSH Key Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## 🔄 Maintenance

### Regular Tasks
- Keep both repositories in sync by using the mirror script
- Monitor for any authentication issues
- Update this documentation if the setup changes

### Script Updates
If you modify the mirroring scripts:
1. Test the changes locally
2. Commit the updated scripts
3. Run the mirror script to push changes to both repositories
4. Update this documentation if needed

---

**Last Updated**: January 2025  
**Setup By**: Hugo Ferraro  
**Project**: Data Intelligence Diagnosis
