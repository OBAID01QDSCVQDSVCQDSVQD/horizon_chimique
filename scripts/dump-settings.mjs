/**
 * Lit MONGODB_URI depuis .env.local et affiche le document Setting (collection settings).
 * Usage: node scripts/dump-settings.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const raw of readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI introuvable (définissez-le ou ajoutez .env.local).');
  process.exit(1);
}

await mongoose.connect(uri);
const doc = await mongoose.connection.db.collection('settings').findOne({});
console.log(JSON.stringify(doc, null, 2));
await mongoose.disconnect();
