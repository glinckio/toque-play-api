# 🛠️ Troubleshooting - ToquePlay API

## 🚨 Problemas Comuns e Soluções

### 1. "This Serverless Function has crashed"

#### Causas Possíveis:

- Firebase não configurado corretamente
- Variáveis de ambiente faltando
- Erro de inicialização da aplicação

#### Soluções:

##### A. Configuração Mínima

Configure apenas as variáveis obrigatórias no Vercel:

```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
MERCADOPAGO_ENABLED=false
```

##### B. Verificar Logs

1. Vá no painel do Vercel
2. Clique no deployment
3. Vá em **Functions**
4. Clique na função que está falhando
5. Verifique os logs de erro

##### C. Testar Endpoints

Após o deploy, teste os endpoints:

```bash
# Health check
curl https://your-api.vercel.app/health

# API health check
curl https://your-api.vercel.app/api/health

# Mock payment status
curl https://your-api.vercel.app/api/payments/mock/status
```

### 2. "Firebase not initialized"

#### Solução:

Configure as variáveis do Firebase ou deixe vazias:

```env
# Opção 1: Configurar Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com

# Opção 2: Deixar vazias (modo sem Firebase)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

### 3. "CORS error"

#### Solução:

Configure `ALLOWED_ORIGINS` corretamente:

```env
# Para desenvolvimento
ALLOWED_ORIGINS=http://localhost:3000

# Para produção
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Para múltiplos domínios
ALLOWED_ORIGINS=https://frontend1.vercel.app,https://frontend2.vercel.app
```

### 4. "Build failed"

#### Soluções:

##### A. Verificar Build Command

No Vercel, configure:

- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

##### B. Verificar Dependências

Certifique-se de que todas as dependências estão no `package.json`:

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/config": "^4.0.2",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.1.3"
    // ... outras dependências
  }
}
```

### 5. "Environment variables not found"

#### Solução:

Configure todas as variáveis no painel do Vercel:

1. Vá em **Settings > Environment Variables**
2. Adicione cada variável:
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production (e Preview se necessário)

### 6. "Function timeout"

#### Solução:

Aumente o timeout no `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🔍 Verificação de Deploy

### 1. Checklist de Verificação

- [ ] Build Command: `npm run build:vercel`
- [ ] Variáveis obrigatórias configuradas
- [ ] Deploy concluído sem erros
- [ ] Health check funcionando
- [ ] Endpoints respondendo

### 2. Testes de Endpoints

```bash
# 1. Health Check
curl https://your-api.vercel.app/health

# 2. API Health Check
curl https://your-api.vercel.app/api/health

# 3. Mock Payment Status
curl https://your-api.vercel.app/api/payments/mock/status

# 4. Root Endpoint
curl https://your-api.vercel.app/api
```

### 3. Verificação de Logs

No painel do Vercel:

1. **Deployments** > Clique no deployment
2. **Functions** > Clique na função
3. **Logs** > Verifique erros

## 🚀 Deploy de Emergência

Se precisar fazer deploy rápido sem Firebase:

### 1. Configuração Mínima

```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000
MERCADOPAGO_ENABLED=false
```

### 2. Deploy

```bash
git add .
git commit -m "Emergency fix"
git push origin main
```

## 📞 Suporte

### 1. Logs Úteis

- **Vercel Logs**: Painel do Vercel > Functions
- **Build Logs**: Painel do Vercel > Deployments
- **Runtime Logs**: Console da aplicação

### 2. Recursos

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)

### 3. Comandos Úteis

```bash
# Testar localmente
npm run start:dev

# Build local
npm run build:vercel

# Verificar variáveis
echo $NODE_ENV
echo $FIREBASE_PROJECT_ID

# Testar endpoints locais
curl http://localhost:3000/health
curl http://localhost:3000/api/health
```
