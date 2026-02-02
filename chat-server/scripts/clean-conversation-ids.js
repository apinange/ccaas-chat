import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../chat.db');
const db = new Database(dbPath);

try {
  // Buscar todas as mensagens com conversation_id que tem \n ou espaços extras
  const allMessages = db.prepare('SELECT id, conversation_id FROM messages').all();
  
  let updated = 0;
  for (const msg of allMessages) {
    const original = msg.conversation_id;
    const cleaned = original?.trim();
    
    if (original !== cleaned) {
      const stmt = db.prepare('UPDATE messages SET conversation_id = ? WHERE id = ?');
      stmt.run(cleaned, msg.id);
      updated++;
      console.log(`✅ Limpou conversation_id: "${original}" -> "${cleaned}"`);
    }
  }
  
  console.log(`\n✅ Total de conversation_ids limpos: ${updated}`);
} catch (error) {
  console.error('❌ Erro ao limpar:', error);
} finally {
  db.close();
}

