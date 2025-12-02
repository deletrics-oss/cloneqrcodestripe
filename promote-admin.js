// Script para promover usuário a super admin
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/chatbot_clone_3036'
});

async function promoteAdmin() {
    try {
        const result = await pool.query(
            'UPDATE users SET "isAdmin" = true WHERE username = $1 RETURNING username, "isAdmin"',
            ['admin']
        );

        if (result.rows.length > 0) {
            console.log('✅ Usuário promovido com sucesso!');
            console.log('Usuário:', result.rows[0].username);
            console.log('Admin:', result.rows[0].isAdmin);
        } else {
            console.log('❌ Usuário "admin" não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await pool.end();
    }
}

promoteAdmin();
