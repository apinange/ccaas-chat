import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../../chat.db');
const db = new Database(dbPath);

// Criar tabela simples
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE,
    conversation_id TEXT,
    user_id TEXT,
    flag TEXT,
    text TEXT,
    timestamp TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    files TEXT,
    client_name TEXT
  )
`);

// Adicionar coluna client_name se não existir (migration)
try {
  db.exec(`ALTER TABLE messages ADD COLUMN client_name TEXT`);
  console.log('✅ Coluna client_name adicionada à tabela messages');
} catch (error) {
  // Coluna já existe, ignorar erro
  if (!error.message.includes('duplicate column name')) {
    console.log('ℹ️ Coluna client_name já existe ou erro ao adicionar:', error.message);
  }
}

// Adicionar coluna phone_number se não existir (migration)
try {
  db.exec(`ALTER TABLE messages ADD COLUMN phone_number TEXT`);
  console.log('✅ Coluna phone_number adicionada à tabela messages');
} catch (error) {
  // Coluna já existe, ignorar erro
  if (!error.message.includes('duplicate column name')) {
    console.log('ℹ️ Coluna phone_number já existe ou erro ao adicionar:', error.message);
  }
}

// Criar tabela para análises do agent assist
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_assist_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT UNIQUE NOT NULL,
    user_sentiment_label TEXT,
    user_sentiment_score REAL,
    reasoning TEXT,
    suggestion TEXT,
    summary TEXT,
    escalation_reasoning TEXT,
    escalation_action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Criar índice para busca rápida
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_agent_assist_conversation_id ON agent_assist_analysis(conversation_id)`);
} catch (error) {
  console.log('ℹ️ Índice já existe ou erro ao criar:', error.message);
}

export default db;

