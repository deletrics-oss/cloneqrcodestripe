# Instruções de Deploy (Ubuntu 22)

Siga estes passos para colocar seu sistema no ar.

## 1. Preparação
1.  Você baixou o arquivo `deploy.zip`.
2.  Acesse seu VPS via SSH ou SFTP.

## 2. Upload
1.  Crie uma pasta para o projeto (ex: `chatbot`).
2.  Faça o upload do arquivo `deploy.zip` para essa pasta.
3.  Descompacte o arquivo. (Pode ser necessário instalar o `unzip`: `sudo apt install unzip`)
    ```bash
    unzip deploy.zip
    ```

## 3. Instalação Automática
O arquivo zip contém um script `setup.sh` que faz todo o trabalho pesado.

1.  Dê permissão de execução ao script:
    ```bash
    chmod +x setup.sh
    ```
2.  Execute o script:
    ```bash
    ./setup.sh
    ```

## 4. Configuração Final
O script irá criar um arquivo `.env` se ele não existir. **Você DEVE editar este arquivo** para colocar seus dados do banco de dados.

1.  Edite o arquivo:
    ```bash
    nano .env
    ```
2.  Preencha a `DATABASE_URL` e outras chaves necessárias.
    - Exemplo: `DATABASE_URL=postgresql://usuario:senha@host:5432/banco`
3.  Salve (Ctrl+O, Enter) e saia (Ctrl+X).
4.  Reinicie o servidor para aplicar as mudanças:
    ```bash
    pm2 restart chatbot-saas
    ```

## 5. Acesso
Seu sistema estará rodando na porta 3000. Acesse pelo navegador:
`http://SEU_IP_DO_VPS:3000`
