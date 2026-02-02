import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../chat.db');
const db = new Database(dbPath);

// Conversation ID padrão
const conversationId = '17adfdec-e172-4394-a968-aab4119539b0';
const clientName = 'Marina Cardoso';

try {
  // Primeiro, verificar todas as conversas e limpar quebras de linha
  const allConvs = db.prepare('SELECT DISTINCT conversation_id FROM messages').all();
  console.log('📋 Conversas encontradas no banco:');
  
  let actualConversationId = conversationId;
  allConvs.forEach(c => {
    const cleanId = c.conversation_id?.trim();
    console.log(`   "${cleanId}" (original length: ${c.conversation_id?.length})`);
    // Se encontrar uma conversa que começa com nosso ID, usar ela
    if (c.conversation_id?.trim() === conversationId) {
      actualConversationId = c.conversation_id; // Usar o ID exato do banco
    }
  });
  
  console.log(`\n🔍 Usando conversation_id: "${actualConversationId}" (length: ${actualConversationId.length})`);
  
  // Atualizar usando o ID exato do banco
  const stmt = db.prepare(`
    UPDATE messages 
    SET client_name = ? 
    WHERE conversation_id = ?
  `);
  
  const result = stmt.run(clientName, actualConversationId);
  
  console.log(`✅ Atualizado ${result.changes} mensagens com nome do cliente: ${clientName}`);
  
  // Verificar se foi atualizado
  const verifyStmt = db.prepare('SELECT client_name FROM messages WHERE conversation_id = ? LIMIT 1');
  const verify = verifyStmt.get(actualConversationId);
  console.log(`✅ Verificação: client_name = "${verify?.client_name || '(null)'}"`);
} catch (error) {
  console.error('❌ Erro ao atualizar:', error);
} finally {
  db.close();
}

