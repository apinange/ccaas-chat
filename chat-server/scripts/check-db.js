import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../chat.db');
const db = new Database(dbPath);

try {
  // Verificar todas as conversas
  const allMessages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 10').all();
  
  console.log(`\n📊 Total de mensagens no banco: ${allMessages.length}`);
  
  if (allMessages.length > 0) {
    console.log('\n📝 Últimas 10 mensagens:');
    allMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.message_id}`);
      console.log(`   Conversation ID: ${msg.conversation_id}`);
      console.log(`   Flag: ${msg.flag}`);
      console.log(`   Client Name: ${msg.client_name || '(null)'}`);
      console.log(`   Text: ${msg.text?.substring(0, 50) || '(empty)'}...`);
    });
    
    // Agrupar por conversation_id
    const byConversation = db.prepare(`
      SELECT 
        conversation_id,
        COUNT(*) as total,
        COUNT(CASE WHEN client_name IS NOT NULL AND client_name != '' THEN 1 END) as with_client_name
      FROM messages 
      GROUP BY conversation_id
    `).all();
    
    console.log('\n📋 Conversas no banco:');
    byConversation.forEach(conv => {
      console.log(`   ${conv.conversation_id}: ${conv.total} mensagens (${conv.with_client_name} com client_name)`);
    });
  } else {
    console.log('\n⚠️ Nenhuma mensagem encontrada no banco!');
  }
} catch (error) {
  console.error('❌ Erro ao verificar banco:', error);
} finally {
  db.close();
}

