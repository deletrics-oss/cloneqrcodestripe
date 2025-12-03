/**
 * Script para popular lógicas demo no banco de dados
 * Execute com: npm run seed-demos
 */

import { db } from './server/db.js';

// Templates de lógica
const DEMO_LOGICS = [
    {
        id: 'demo-lcmelo',
        name: 'LC Melo Parafusos',
        description: 'Modelo completo de atendimento para indústria/loja (LC Melo).',
        logicJson: {
            default_reply: "Desculpe, não entendi sua solicitação. Por favor, escolha uma das opções numeradas.\\n\\nPara falar com um atendente, digite *5*.\\nDigite *menu* para voltar ao início.",
            pause_bot_after_reply: false,
            rules: [
                {
                    keywords: ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "menu", "ajuda", "inicio", "início", "start", "voltar", "sair", "opcoes", "opções"],
                    reply: "Olá! 👋 Sou o assistente virtual da LC Melo Parafusos e Gabaritos.\\n\\nSe preferir, digite *5* para falar diretamente com um atendente.\\n\\nComo posso ajudar?\\n\\n1️⃣ - Sobre a LC Melo\\n2️⃣ - Ver Produtos\\n3️⃣ - Solicitar Orçamento / Falar com Vendas\\n4️⃣ - Falar com o Financeiro\\n5️⃣ - Outros assuntos Diversos",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["1"],
                    reply: "Com 30 anos de mercado, a LCM INDÚSTRIA conta com uma equipe de profissionais altamente qualificados. Desenvolve produtos para profissionais do setor moveleiro, parafusos e prolongadores para pastas e mostruários.\\n\\nEstamos localizados na Rua Honório Maia, 864 galpão D, Tatuapé - CEP 03072-000 - São Paulo -SP\\n\\nNosso site: www.lcmelo.com.br\\nInstagram: https://www.instagram.com/lcmgabaritos/\\nNossa Loja: www.lcmgabaritos.com.br\\n\\nDigite *menu* para voltar.",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["2"],
                    reply: "Ótimo! Sobre quais produtos você gostaria de saber mais? (Digite *P + o número*):\\n\\nP1 – Parafusos\\nP2 – Gabaritos\\n\\nDigite *menu* para voltar.",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["3", "orcamento", "cotacao", "preco", "comprar", "pedido", "vendas", "vendedor", "comercial"],
                    reply: "Entendi. Para cotações, disponibilidade, preços e para falar com nossa equipe comercial, por favor, entre em contato:\\n\\n📞 Telefone: *(11) 2641-3508*\\n📱 WhatsApp Vendas: *11 95323-9904*\\n📧 E-mail: *atendimento@lcmelo.com.br*\\n\\n*O assistente virtual será pausado para não atrapalhar.* Para reativá-lo, basta digitar *menu*. 🙂",
                    pause_bot_after_reply: true
                }
            ]
        }
    },
    {
        id: 'demo-fight-arcade',
        name: 'Fight Arcade',
        description: 'Loja de controles e fliperamas - atendimento completo com FAQ.',
        logicJson: {
            default_reply: "Olá! Bem-vindo à Fight Arcade! 🎮\\n\\nSou o assistente virtual e estou aqui para ajudar. Como posso te auxiliar hoje?\\n\\n1️⃣ - Ver Produtos\\n2️⃣ - Informações sobre Envio\\n3️⃣ - Formas de Pagamento\\n4️⃣ - Garantia e Devolução\\n5️⃣ - Falar com Atendente\\n\\nDigite o número da opção desejada ou faça sua pergunta!",
            pause_bot_after_reply: false,
            rules: [
                {
                    keywords: ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "menu", "ajuda", "inicio", "início"],
                    reply: "Olá! Bem-vindo à Fight Arcade! 🎮\\n\\nSou o assistente virtual e estou aqui para ajudar. Como posso te auxiliar hoje?\\n\\n1️⃣ - Ver Produtos\\n2️⃣ - Informações sobre Envio\\n3️⃣ - Formas de Pagamento\\n4️⃣ - Garantia e Devolução\\n5️⃣ - Falar com Atendente\\n\\nDigite o número da opção desejada ou faça sua pergunta!",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["1", "produtos", "controles", "fliperamas", "arcade"],
                    reply: "Temos diversos produtos incríveis! 🕹️\\n\\nAcesse nossa loja completa:\\n👉 https://www.fightarcade.com.br/\\n\\nOu veja nossas plataformas:\\n🛒 Mercado Livre: https://www.mercadolivre.com.br/perfil/FIGHTARCADEOFICIAL\\n🛍️ Shopee: https://shopee.com.br/fightarcade\\n\\nPosso ajudar com algo mais?",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["2", "entrega", "envio", "frete", "rastreamento", "prazo"],
                    reply: "Fazemos entregas em todo o Brasil! 📦\\n\\n- **Frete e Prazo:** Calculados no checkout (Mercado Livre/Shopee) ou informados pelo atendente.\\n- **Entrega no Mesmo Dia:** Grande São Paulo via motoboy (consulte disponibilidade).\\n- **Rastreamento:** Você receberá o código por e-mail após o despacho.\\n\\nPosso ajudar com algo mais?",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["5", "atendente", "humano", "falar com alguem", "contato"],
                    reply: "Claro! Para falar com nossa equipe:\\n\\n📱 WhatsApp: (11) 97898-4413\\n📧 E-mail: contato@fightarcade.com.br\\n🕐 Horário: Segunda a Sexta, 9h às 18h\\n\\n*O assistente será pausado. Digite 'menu' para reativá-lo.*",
                    pause_bot_after_reply: true
                }
            ]
        }
    },
    {
        id: 'demo-simple-welcome',
        name: 'Saudação Simples',
        description: 'Responde a saudações básicas com uma mensagem de boas-vindas.',
        logicJson: {
            default_reply: "Digite 'oi' para começar!",
            pause_bot_after_reply: false,
            rules: [
                {
                    keywords: ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "hello", "hi"],
                    reply: "Olá! 👋 Bem-vindo! Como posso ajudar você hoje?",
                    pause_bot_after_reply: false
                },
                {
                    keywords: ["menu", "ajuda", "help"],
                    reply: "Aqui estão as opções disponíveis:\\n\\n1️⃣ - Informações\\n2️⃣ - Suporte\\n3️⃣ - Falar com atendente\\n\\nDigite o número da opção desejada.",
                    pause_bot_after_reply: false
                }
            ]
        }
    }
];

console.log('🌱 Iniciando seed de lógicas demo...\\n');

// Buscar um usuário admin para associar as lógicas
const admin = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');

if (!admin) {
    console.error('❌ Nenhum usuário admin encontrado. Crie um admin primeiro.');
    process.exit(1);
}

const userId = admin.id;
console.log(`✅ Usando usuário admin: ${userId}\\n`);

// Inserir ou atualizar lógicas demo
const insertLogic = db.prepare(`
  INSERT OR REPLACE INTO logic_configs (id, user_id, name, description, logic_json, logic_type, is_active, is_template, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

let count = 0;
for (const logic of DEMO_LOGICS) {
    try {
        insertLogic.run(
            logic.id,
            userId,
            logic.name,
            logic.description,
            JSON.stringify(logic.logicJson),
            'json',
            0, // is_active = false (demo)
            1  // is_template = true
        );
        console.log(`✅ Criada: ${logic.name}`);
        count++;
    } catch (error) {
        console.error(`❌ Erro ao criar ${logic.name}:`, error.message);
    }
}

console.log(`\\n🎉 Seed concluído! ${count} lógicas demo criadas/atualizadas.`);
console.log('\\nℹ️  Estas lógicas estão marcadas como templates (is_template=1) e inativas (is_active=0).');
console.log('   Elas servem como exemplos e podem ser clonadas pelos usuários.');

process.exit(0);
