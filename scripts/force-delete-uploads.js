const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(process.cwd(), 'uploads', 'lease-documents');

console.log('🗑️  Force deleting all files in:', uploadsDir);

try {
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} files`);
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`✓ Deleted: ${file}`);
      } catch (err) {
        console.error(`✗ Error deleting ${file}:`, err.message);
      }
    });
    
    console.log('\n✨ All files deleted!');
  } else {
    console.log('Directory does not exist');
  }
} catch (error) {
  console.error('Error:', error);
}

