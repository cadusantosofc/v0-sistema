// Script para testar o serviço getUserById diretamente
require('dotenv').config();
const { getUserById } = require('../src/models/user');

async function main() {
  try {
    console.log('Ambiente:', process.env.NODE_ENV);
    console.log('Configuração do banco de dados:');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    console.log('Port:', process.env.DB_PORT);
    
    console.log('\nTestando getUserById("company-1")...');
    const user = await getUserById('company-1');
    
    if (user) {
      console.log('Usuário encontrado:');
      console.log(user);
    } else {
      console.log('Usuário não encontrado!');
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
  }
}

main(); 