/**
 * Environment File Updater
 * 
 * Utility to update .env.local file with new values
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(process.cwd(), '.env.local');
const ENV_BACKUP = path.join(process.cwd(), '.env.local.backup');

/**
 * Update AUTH_MODE in .env.local file
 */
function updateAuthMode(mode) {
  try {
    // Read existing .env.local or create empty content
    let envContent = '';
    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, 'utf8');
    }

    // Create backup
    if (fs.existsSync(ENV_FILE)) {
      fs.copyFileSync(ENV_FILE, ENV_BACKUP);
    }

    // Update or add AUTH_MODE
    const lines = envContent.split('\n');
    let found = false;
    const updatedLines = lines.map(line => {
      if (line.trim().startsWith('AUTH_MODE=')) {
        found = true;
        return `AUTH_MODE=${mode}`;
      }
      return line;
    });

    if (!found) {
      // Add AUTH_MODE if it doesn't exist
      updatedLines.push(`AUTH_MODE=${mode}`);
    }

    // Write updated content
    fs.writeFileSync(ENV_FILE, updatedLines.join('\n'), 'utf8');

    return true;
  } catch (error) {
    console.error('[Env Updater] Error updating AUTH_MODE:', error);
    // Restore backup on error
    if (fs.existsSync(ENV_BACKUP)) {
      try {
        fs.copyFileSync(ENV_BACKUP, ENV_FILE);
      } catch (restoreError) {
        console.error('[Env Updater] Error restoring backup:', restoreError);
      }
    }
    throw error;
  }
}

module.exports = {
  updateAuthMode,
  ENV_FILE,
  ENV_BACKUP,
};

