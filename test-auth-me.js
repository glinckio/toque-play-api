// Script de teste para o endpoint auth/me
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAuthMe() {
  try {
    console.log('🧪 Testando endpoint /api/auth/me...');

    // Teste 1: Sem token (deve retornar 401)
    console.log('\n1. Testando sem token:');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ OK: Retornou 401 (Unauthorized) como esperado');
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }

    // Teste 2: Com token inválido (deve retornar 401)
    console.log('\n2. Testando com token inválido:');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ OK: Retornou 401 (Unauthorized) como esperado');
      } else {
        console.log('❌ Erro inesperado:', error.response?.status);
      }
    }

    console.log('\n🎉 Testes concluídos!');
    console.log(
      '📝 Para testar com token válido, use o Postman ou faça login primeiro.',
    );
  } catch (error) {
    console.error('❌ Erro ao conectar com a API:', error.message);
    console.log(
      '💡 Certifique-se de que o servidor está rodando em http://localhost:3000',
    );
  }
}

testAuthMe();
