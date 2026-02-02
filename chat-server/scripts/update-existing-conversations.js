import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getRandomClientData } from '../src/utils/clientData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../chat.db');
const db = new Database(dbPath);

try {
  console.log('🔄 Atualizando conversas existentes com nomes e telefones...\n');
  
  // Buscar todas as conversas únicas
  const conversations = db.prepare(`
    SELECT DISTINCT TRIM(conversation_id) as conversation_id
    FROM messages
    WHERE conversation_id IS NOT NULL AND conversation_id != ''
    ORDER BY conversation_id
  `).all();
  
  console.log(`📊 Encontradas ${conversations.length} conversas no banco de dados\n`);
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  for (const conv of conversations) {
    const conversationId = conv.conversation_id;
    
    // Verificar se já tem client_name e phone_number
    const existingData = db.prepare(`
      SELECT 
        MAX(client_name) as client_name,
        MAX(phone_number) as phone_number
      FROM messages
      WHERE TRIM(conversation_id) = ?
    `).get(conversationId);
    
    // Se já tem nome e telefone, pular
    if (existingData.client_name && existingData.phone_number) {
      console.log(`⏭️  Conversa ${conversationId} já tem dados: ${existingData.client_name} - ${existingData.phone_number}`);
      skippedCount++;
      continue;
    }
    
    // Gerar novos dados
    const { name, phone } = getRandomClientData();
    
    // Atualizar todas as mensagens da conversa
    const updateStmt = db.prepare(`
      UPDATE messages
      SET client_name = ?, phone_number = ?
      WHERE TRIM(conversation_id) = ?
    `);
    
    const result = updateStmt.run(name, phone, conversationId);
    
    console.log(`✅ Conversa ${conversationId}: ${name} - ${phone} (${result.changes} mensagens atualizadas)`);
    updatedCount++;
  }
  
  console.log(`\n✨ Processo concluído!`);
  console.log(`   - Conversas atualizadas: ${updatedCount}`);
  console.log(`   - Conversas já com dados: ${skippedCount}`);
  console.log(`   - Total de conversas: ${conversations.length}`);
  
} catch (error) {
  console.error('❌ Erro ao atualizar conversas:', error);
} finally {
  db.close();
}

