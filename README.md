# 🏓 ToquePlay API

API para gerenciamento de torneios de tênis de mesa desenvolvida com NestJS.

## 🚀 Funcionalidades

- **Autenticação**: Login com email/senha e redes sociais (Firebase)
- **Usuários**: Perfis de atletas e organizadores
- **Torneios**: Criação, listagem e gerenciamento de torneios
- **Pagamentos**: Integração com Mercado Pago PIX (com modo mock)
- **Categorias**: Diferentes categorias e modalidades de torneio

## 🛠️ Tecnologias

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Autenticação**: Firebase Admin SDK
- **Pagamentos**: Mercado Pago API
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Firebase
- Conta no Mercado Pago (opcional)

## 🔧 Instalação

```bash
# Clonar repositório
git clone <repository-url>
cd toque-play-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Mercado Pago
MERCADOPAGO_ENABLED=false
MP_ACCESS_TOKEN=your_mercadopago_token_here

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Firebase Setup

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Gere uma chave privada em **Project Settings > Service Accounts**
3. Configure as variáveis de ambiente

### Mercado Pago Setup

1. Crie uma conta no [Mercado Pago](https://www.mercadopago.com.br)
2. Obtenha o Access Token em **Developers > Credentials**
3. Configure `MERCADOPAGO_ENABLED=true` e `MP_ACCESS_TOKEN`

## 🚀 Execução

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod

# Build
npm run build
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📚 Documentação da API

### Endpoints Principais

#### Autenticação

- `POST /api/auth/register` - Registro com email/senha
- `POST /api/auth/social-login` - Login social
- `GET /api/auth/me` - Validar token e obter usuário autenticado

#### Usuários

- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil

#### Torneios

- `GET /api/tournaments` - Listar torneios
- `POST /api/tournaments` - Criar torneio
- `GET /api/tournaments/:id` - Obter torneio
- `PUT /api/tournaments/:id` - Atualizar torneio
- `DELETE /api/tournaments/:id` - Deletar torneio

#### Pagamentos

- `POST /api/payments/pix` - Criar pagamento PIX
- `GET /api/payments/mock/status` - Status do modo mock

### Postman Collection

Importe o arquivo `ToquePlay API V3.postman_collection.json` no Postman para testar todos os endpoints.

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conectar Repositório**:

   - Acesse [Vercel Dashboard](https://vercel.com/dashboard)
   - Importe seu repositório
   - Framework Preset: `Other`

2. **Configurar Build** ⚠️ **IMPORTANTE**:

   - Build Command: `npm run build:vercel` (não `npm run build`)
   - Output Directory: `dist` (será ignorado pelo vercel.json)
   - Install Command: `npm install`

3. **Configurar Variáveis**:

   - Vá em **Settings > Environment Variables**
   - Adicione todas as variáveis do arquivo `env.vercel.example`

4. **Deploy Automático**:
   - Push para `main` = deploy automático
   - Acesse a URL fornecida pelo Vercel

📖 **Guia Completo**: Veja [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instruções detalhadas.

### Outras Plataformas

- **Railway**: Deploy direto do GitHub
- **Heroku**: Configurar buildpacks
- **DigitalOcean App Platform**: Deploy containerizado

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
src/
├── auth/           # Autenticação e autorização
├── config/         # Configurações
├── firebase/       # Integração Firebase
├── payments/       # Sistema de pagamentos
├── tournaments/    # Gerenciamento de torneios
├── users/          # Gerenciamento de usuários
└── main.ts         # Ponto de entrada
```

### Modo Mock

Para desenvolvimento sem integração real:

```env
MERCADOPAGO_ENABLED=false
```

Isso ativa o modo mock que simula pagamentos PIX sem usar a API real.

### Logs e Debug

```bash
# Modo debug
npm run start:debug

# Ver logs em produção
# Configure logging adequado para sua plataforma
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentação**: [NestJS Docs](https://docs.nestjs.com)
- **Comunidade**: [Discord NestJS](https://discord.gg/G7Qnnhy)

## 🔗 Links Úteis

- [NestJS Documentation](https://docs.nestjs.com)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- [Mercado Pago API](https://www.mercadopago.com.br/developers)
- [Vercel Documentation](https://vercel.com/docs)
