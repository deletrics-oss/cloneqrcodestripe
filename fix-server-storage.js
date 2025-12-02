import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storagePath = path.join(__dirname, 'server', 'storage.ts');

console.log(`Checking ${storagePath}...`);

if (!fs.existsSync(storagePath)) {
    console.error(`File not found: ${storagePath}`);
    process.exit(1);
}

let content = fs.readFileSync(storagePath, 'utf8');

if (content.includes('messageTemplates,') && content.includes('type MessageTemplate,')) {
    console.log('✅ server/storage.ts already has the correct imports.');
} else {
    console.log('⚠️ Missing imports detected. Patching file...');

    // Find the import block from @shared/schema
    const importRegex = /} from "@shared\/schema";/;

    if (importRegex.test(content)) {
        const newImports = `  messageTemplates,
  type MessageTemplate,
  type InsertMessageTemplate,
} from "@shared/schema";`;

        content = content.replace(importRegex, newImports);
        fs.writeFileSync(storagePath, content, 'utf8');
        console.log('✅ Successfully patched server/storage.ts');
    } else {
        console.error('❌ Could not find @shared/schema import block to patch.');
        process.exit(1);
    }
}

console.log('Please restart your server now: pm2 restart clone-3036');
