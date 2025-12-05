import pg from 'pg';

const { Pool } = pg;

// Tenta pegar DATABASE_URL do ambiente
// Tenta pegar DATABASE_URL do ambiente
if (!process.env.DATABASE_URL) {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    if (key && value && !key.startsWith('#')) {
                        process.env[key] = value;
                    }
                }
            });
            console.log("✅ .env carregado manualmente.");
        }
    } catch (e) {
        console.error("⚠️ Erro ao tentar ler .env manualmente:", e);
    }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("❌ Erro: DATABASE_URL não está definida nas variáveis de ambiente.");
    console.error("Se você usa PM2, tente rodar este script via PM2 para herdar as variáveis.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
});

async function runMigration() {
    try {
        console.log("🔌 Conectando ao banco de dados...");
        const client = await pool.connect();

        console.log("🚀 Executando migração...");

        // SQL Embutido para garantir que funcione mesmo sem o arquivo .sql
        const sql = `
      CREATE TABLE IF NOT EXISTS message_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE whatsapp_devices ADD COLUMN IF NOT EXISTS should_transcribe BOOLEAN NOT NULL DEFAULT TRUE;
      
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url TEXT;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type VARCHAR;
    `;

        await client.query(sql);

        console.log("✅ Tabela 'message_templates' criada com sucesso!");
        client.release();
    } catch (err) {
        console.error("❌ Erro ao executar migração:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
