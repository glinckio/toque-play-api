# 🚀 Guia de Deploy - Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Projeto no GitHub**: Código deve estar em um repositório
3. **Variáveis de ambiente**: Configuradas no Vercel

## 🔧 Configuração no Vercel

### 1. Conectar Repositório

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (padrão)
   - **Build Command**: `npm run build:vercel` ⚠️ **IMPORTANTE**
   - **Output Directory**: `dist` (será ignorado pelo vercel.json)
   - **Install Command**: `npm install`

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```env
# Mercado Pago
MERCADOPAGO_ENABLED=false
MP_ACCESS_TOKEN=your_mercadopago_token_here

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000

# Server
NODE_ENV=production
PORT=3000
```

### 3. Configurações Avançadas

Em **Settings > General**:

- **Node.js Version**: `18.x` ou superior
- **Build & Development Settings**:
  - Build Command: `npm run build:vercel` ⚠️ **CRÍTICO**
  - Output Directory: `dist` (será ignorado)
  - Install Command: `npm install`

## 🚀 Deploy

### Deploy Automático

1. Faça push para a branch `main` do seu repositório
2. O Vercel fará deploy automático
3. Acesse a URL fornecida pelo Vercel

### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

## 🔍 Verificação do Deploy

### 1. Testar Endpoints

Após o deploy, teste os endpoints:

```bash
# Verificar se a API está funcionando
curl https://your-api.vercel.app/api

# Testar endpoint de status
curl https://your-api.vercel.app/api/payments/mock/status
```

### 2. Verificar Logs

No painel do Vercel:

- **Functions**: Ver logs das funções
- **Deployments**: Ver logs de build e deploy

## 🛠️ Troubleshooting

### Erro: "nest: command not found"

**Solução**: Use o comando de build correto:

- ✅ Build Command: `npm run build:vercel`
- ❌ Build Command: `npm run build`

### Erro: "No Output Directory named 'public' found"

**Solução**: O arquivo `vercel.json` já está configurado para resolver isso.

### Erro: "Module not found"

**Solução**: Verifique se todas as dependências estão no `package.json`.

### Erro: "Environment variables not found"

**Solução**: Configure todas as variáveis de ambiente no painel do Vercel.

### Erro: "CORS error"

**Solução**: Configure a variável `ALLOWED_ORIGINS` corretamente.

## 📊 Monitoramento

### 1. Analytics

- **Vercel Analytics**: Monitorar performance
- **Function Logs**: Ver logs de execução
- **Error Tracking**: Configurar Sentry se necessário

### 2. Performance

- **Cold Start**: Primeira execução pode ser lenta
- **Warm Up**: Configurar warm-up functions se necessário
- **Memory**: Monitorar uso de memória

## 🔒 Segurança

### 1. Variáveis Sensíveis

- ✅ Nunca commitar `.env` no repositório
- ✅ Usar variáveis de ambiente do Vercel
- ✅ Rotacionar tokens regularmente

### 2. CORS

- ✅ Configurar `ALLOWED_ORIGINS` corretamente
- ✅ Não usar `*` em produção

### 3. Rate Limiting

- ✅ Implementar rate limiting se necessário
- ✅ Monitorar uso da API

## 🌐 Domínio Customizado

### 1. Configurar Domínio

1. Vá em **Settings > Domains**
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções

### 2. SSL/HTTPS

- ✅ Automático no Vercel
- ✅ Certificados Let's Encrypt

## 📱 Integração com Frontend

### 1. Configurar CORS

No `main.ts`, a configuração já está preparada:

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});
```

### 2. URLs da API

No frontend, use a URL do Vercel:

```typescript
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://your-api.vercel.app/api';
```

## 🔄 CI/CD

### 1. Deploy Automático

- ✅ Push para `main` = deploy automático
- ✅ Pull Requests = preview deployments

### 2. Branch Deployments

- ✅ `main` = produção
- ✅ `develop` = staging (opcional)
- ✅ Feature branches = preview

## 📈 Escalabilidade

### 1. Serverless Functions

- ✅ Cada endpoint = função serverless
- ✅ Escala automaticamente
- ✅ Pay-per-use

### 2. Edge Functions

- ✅ Para endpoints que precisam de baixa latência
- ✅ Configurar conforme necessário

## 🎯 Checklist de Deploy

- [ ] Repositório conectado ao Vercel
- [ ] **Build Command configurado como `npm run build:vercel`** ⚠️
- [ ] Variáveis de ambiente configuradas
- [ ] `vercel.json` criado
- [ ] `main.ts` configurado com CORS
- [ ] Deploy realizado com sucesso
- [ ] Endpoints testados
- [ ] Logs verificados
- [ ] Domínio configurado (opcional)
- [ ] Frontend integrado (se aplicável)

## 🆘 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status**: [vercel-status.com](https://vercel-status.com)
