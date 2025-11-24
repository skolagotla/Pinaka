#!/usr/bin/env node

/**
 * Migration Script: Ant Design → Flowbite
 * 
 * This script helps migrate common Ant Design patterns to Flowbite equivalents.
 * 
 * Usage:
 *   node scripts/migrate-antd-to-flowbite.js [file-path]
 * 
 * If no file path is provided, it will list all files that still use Ant Design.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon mapping: Ant Design → react-icons/hi
const ICON_MAPPING = {
  'SearchOutlined': 'HiSearch',
  'CloseOutlined': 'HiX',
  'EditOutlined': 'HiPencil',
  'DeleteOutlined': 'HiTrash',
  'PlusOutlined': 'HiPlus',
  'CheckCircleOutlined': 'HiCheckCircle',
  'CloseCircleOutlined': 'HiXCircle',
  'WarningOutlined': 'HiExclamation',
  'InfoCircleOutlined': 'HiInformationCircle',
  'ExclamationCircleOutlined': 'HiExclamationCircle',
  'ReloadOutlined': 'HiRefresh',
  'DownloadOutlined': 'HiDownload',
  'UploadOutlined': 'HiCloudUpload',
  'EyeOutlined': 'HiEye',
  'MailOutlined': 'HiMail',
  'LockOutlined': 'HiLockClosed',
  'PhoneOutlined': 'HiPhone',
  'EnvironmentOutlined': 'HiLocationMarker',
  'UserOutlined': 'HiUser',
  'HomeOutlined': 'HiHome',
  'ClockCircleOutlined': 'HiClock',
  'SaveOutlined': 'HiSave',
  'FilterOutlined': 'HiFilter',
  'ClearOutlined': 'HiX',
  'SendOutlined': 'HiPaperAirplane',
  'MessageOutlined': 'HiChat',
  'DollarOutlined': 'HiCurrencyDollar',
  'ToolOutlined': 'HiWrench',
  'FileTextOutlined': 'HiDocumentText',
  'TeamOutlined': 'HiUserGroup',
  'CheckOutlined': 'HiCheck',
  'LeftOutlined': 'HiChevronLeft',
  'RightOutlined': 'HiChevronRight',
};

// Component mapping patterns
const COMPONENT_PATTERNS = [
  {
    // Input → TextInput
    from: /import\s+{\s*Input\s*}\s+from\s+['"]antd['"]/g,
    to: "import { TextInput } from 'flowbite-react'",
    notes: 'Also update Input.Password to TextInput type="password"'
  },
  {
    // Button → Button (same name, different import)
    from: /import\s+{\s*Button\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Button } from 'flowbite-react'",
  },
  {
    // Card → Card (same name, different import)
    from: /import\s+{\s*Card\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Card } from 'flowbite-react'",
  },
  {
    // Select → Select (same name, different import)
    from: /import\s+{\s*Select\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Select } from 'flowbite-react'",
  },
  {
    // Tag → Badge
    from: /import\s+{\s*Tag\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Badge } from 'flowbite-react'",
  },
  {
    // Spin → Spinner
    from: /import\s+{\s*Spin\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Spinner } from 'flowbite-react'",
  },
  {
    // Alert → Alert (same name, different import)
    from: /import\s+{\s*Alert\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Alert } from 'flowbite-react'",
  },
  {
    // Modal → Modal (same name, different import)
    from: /import\s+{\s*Modal\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Modal } from 'flowbite-react'",
  },
  {
    // Tooltip → Tooltip (same name, different import)
    from: /import\s+{\s*Tooltip\s*}\s+from\s+['"]antd['"]/g,
    to: "import { Tooltip } from 'flowbite-react'",
  },
  {
    // Typography.Text → span
    from: /import\s+{\s*Typography\s*}\s+from\s+['"]antd['"]/g,
    to: "// Typography removed - use native HTML elements or Tailwind classes",
    notes: 'Replace Typography.Text with <span>, Typography.Title with <h1-h6>'
  },
  {
    // Space → div with flex
    from: /import\s+{\s*Space\s*}\s+from\s+['"]antd['"]/g,
    to: "// Space removed - use <div className='flex gap-2'> instead",
  },
  {
    // Popconfirm → FlowbitePopconfirm
    from: /import\s+{\s*Popconfirm\s*}\s+from\s+['"]antd['"]/g,
    to: "import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm'",
  },
];

function findFilesWithAntd() {
  const rootDir = path.join(__dirname, '..', 'apps', 'web-app');
  const files = [];
  
  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'dist') {
          walkDir(fullPath);
        }
      } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes("from 'antd'") || content.includes('from "antd"') || 
            content.includes("@ant-design/icons")) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walkDir(rootDir);
  return files;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Migrate icon imports
  for (const [antdIcon, reactIcon] of Object.entries(ICON_MAPPING)) {
    const iconImportPattern = new RegExp(
      `import\\s+{\\s*${antdIcon}\\s*}\\s+from\\s+['"]@ant-design/icons['"]`,
      'g'
    );
    
    if (iconImportPattern.test(content)) {
      // Check if react-icons/hi is already imported
      if (!content.includes("from 'react-icons/hi'") && !content.includes('from "react-icons/hi"')) {
        content = content.replace(iconImportPattern, '');
        // Add react-icons import at the top if not present
        const importMatch = content.match(/^import\s+.*from\s+['"]react-icons\/hi['"]/m);
        if (!importMatch) {
          // Find the last import statement
          const lastImportMatch = content.match(/^import\s+.*$/m);
          if (lastImportMatch) {
            const lastImportIndex = content.indexOf(lastImportMatch[0]);
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, nextLineIndex + 1) + 
                     `import { ${reactIcon} } from 'react-icons/hi';\n` +
                     content.slice(nextLineIndex + 1);
          }
        } else {
          // Add to existing react-icons import
          content = content.replace(
            /import\s+{([^}]+)}\s+from\s+['"]react-icons\/hi['"]/,
            `import { $1, ${reactIcon} } from 'react-icons/hi'`
          );
        }
      } else {
        // Add to existing import
        content = content.replace(
          /import\s+{([^}]+)}\s+from\s+['"]react-icons\/hi['"]/,
          (match, imports) => {
            if (!imports.includes(reactIcon)) {
              return `import { ${imports.trim()}, ${reactIcon} } from 'react-icons/hi'`;
            }
            return match;
          }
        );
        content = content.replace(iconImportPattern, '');
      }
      
      // Replace icon usage
      content = content.replace(new RegExp(`<${antdIcon}\\s*/?>`, 'g'), `<${reactIcon} className="h-4 w-4" />`);
      content = content.replace(new RegExp(`{<${antdIcon}\\s*/?>}`, 'g'), `{<${reactIcon} className="h-4 w-4" />}`);
      changed = true;
    }
  }
  
  // Migrate component imports
  for (const pattern of COMPONENT_PATTERNS) {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      changed = true;
    }
  }
  
  // Remove empty antd imports
  content = content.replace(/import\s+{\s*}\s+from\s+['"]antd['"];?\n?/g, '');
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const filePath = process.argv[2];

if (filePath) {
  // Migrate specific file
  if (fs.existsSync(filePath)) {
    migrateFile(filePath);
  } else {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
} else {
  // List all files with Ant Design
  console.log('🔍 Finding files with Ant Design imports...\n');
  const files = findFilesWithAntd();
  console.log(`Found ${files.length} files:\n`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log(`\n💡 To migrate a file, run:`);
  console.log(`   node scripts/migrate-antd-to-flowbite.js <file-path>`);
}

