// Script to increment build number before building
const fs = require('fs');
const path = require('path');

function incrementBuild(appDir) {
  // Resolve absolute path
  const appPath = path.isAbsolute(appDir) ? appDir : path.join(__dirname, appDir);
  const packagePath = path.join(appPath, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.error(`package.json not found in ${appPath}`);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Preserve electron-builder config if it exists
  const electronBuilderConfig = packageJson.build;
  
  // Increment version (patch version: 1.0.0 -> 1.0.1 -> 1.0.2, etc.)
  const versionParts = (packageJson.version || '1.0.0').split('.');
  if (versionParts.length === 3) {
    const major = parseInt(versionParts[0]) || 1;
    const minor = parseInt(versionParts[1]) || 0;
    const patch = parseInt(versionParts[2]) || 0;
    
    // Increment patch version
    packageJson.version = `${major}.${minor}.${patch + 1}`;
  } else {
    // Fallback if version format is incorrect
    packageJson.version = '1.0.1';
  }
  
  // Keep buildNumber for internal tracking (optional)
  if (!packageJson.buildNumber) {
    packageJson.buildNumber = 1;
  } else {
    packageJson.buildNumber = parseInt(packageJson.buildNumber) + 1;
  }
  
  // Restore electron-builder config if it was overwritten
  if (electronBuilderConfig && typeof electronBuilderConfig === 'object') {
    packageJson.build = electronBuilderConfig;
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Version incremented to ${packageJson.version}, build: ${packageJson.buildNumber}`);
}

// Get app directory from command line
const appDir = process.argv[2];
if (appDir) {
  incrementBuild(appDir);
} else {
  console.error('Usage: node increment-build.js <app-directory>');
  process.exit(1);
}

