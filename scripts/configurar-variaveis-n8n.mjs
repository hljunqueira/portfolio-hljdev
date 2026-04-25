/**
 * HLJ DEV - Configurar Variáveis de Ambiente no N8N via API
 * 
 * Este script configura as variáveis de ambiente reais no N8N
 * extraídas dos arquivos .env do projeto
 */

const N8N_URL = 'https://n8n.hljdev.com.br';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGJkNGI5Ny02YmNiLTRhYzItYWY0MS05ZjIzMGU2ZDQxZTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOThlYTczYTctMmQwMi00ZGFiLThhMGQtN2JkNzg2MTc1ZTllIiwiaWF0IjoxNzc1NTI0MjAyfQ.BPicoawd3oeZYC1eLOVM2cmOjXiq10xUcfhKzFplSs4';

// Variáveis extraídas dos arquivos .env reais do projeto
const ENV_VARIABLES = [
  {
    key: 'SUPABASE_HOST',
    value: 'db.supabase.hljdev.com.br',
    description: 'Host do PostgreSQL (Supabase self-hosted)'
  },
  {
    key: 'SUPABASE_PORT',
    value: '5432',
    description: 'Porta do PostgreSQL'
  },
  {
    key: 'SUPABASE_DB',
    value: 'postgres',
    description: 'Nome do banco de dados'
  },
  {
    key: 'SUPABASE_USER',
    value: 'postgres',
    description: 'Usuário do PostgreSQL'
  },
  {
    key: 'SUPABASE_PASS',
    value: 'YOUR_SUPABASE_PASSWORD',
    description: 'Senha do PostgreSQL (do .env.vps)'
  },
  {
    key: 'WHATSAPP_API_URL',
    value: 'http://evolution:8080',
    description: 'URL interna da Evolution API (Docker network)'
  },
  {
    key: 'WHATSAPP_INSTANCE',
    value: 'hlj-principal',
    description: 'Nome da instância do WhatsApp'
  },
  {
    key: 'SEU_WHATSAPP',
    value: '5548991013293',
    description: 'Número do WhatsApp do Henrique'
  }
];

async function configureEnvironmentVariable(envVar) {
  console.log(`\n📝 Configurando: ${envVar.key}`);
  console.log(`   Valor: ${envVar.value}`);
  console.log(`   Descrição: ${envVar.description}`);
  
  try {
    const response = await fetch(`${N8N_URL}/api/v1/variables`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: envVar.key,
        value: envVar.value
        // Removido 'type' pois é read-only na API v2.11.4
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Sucesso! ID: ${result.data?.id || 'criado'}`);
      return result;
    } else {
      const error = await response.text();
      
      // Se já existe (409), atualizar
      if (response.status === 409) {
        console.log(`⚠️  Variável já existe, atualizando...`);
        return await updateEnvironmentVariable(envVar);
      }
      
      console.error(`❌ Erro ${response.status}: ${error}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Falha na requisição: ${err.message}`);
    return null;
  }
}

async function updateEnvironmentVariable(envVar) {
  try {
    // Primeiro, listar todas as variáveis para encontrar o ID
    const listResponse = await fetch(`${N8N_URL}/api/v1/variables`, {
      headers: {
        'X-N8N-API-KEY': API_KEY
      }
    });

    if (!listResponse.ok) {
      console.error(`❌ Não foi possível listar variáveis`);
      return null;
    }

    const variables = await listResponse.json();
    const existingVar = variables.data?.find(v => v.key === envVar.key);

    if (!existingVar) {
      console.error(`❌ Variável não encontrada para atualizar`);
      return null;
    }

    // Atualizar variável existente
    const updateResponse = await fetch(`${N8N_URL}/api/v1/variables/${existingVar.id}`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value: envVar.value
      })
    });

    if (updateResponse.ok) {
      console.log(`✅ Atualizada com sucesso!`);
      return await updateResponse.json();
    } else {
      const error = await updateResponse.text();
      console.error(`❌ Erro ao atualizar: ${error}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Falha na atualização: ${err.message}`);
    return null;
  }
}

async function verifyConfiguration() {
  console.log('\n🔍 Verificando configuração...');
  
  try {
    const response = await fetch(`${N8N_URL}/api/v1/variables`, {
      headers: {
        'X-N8N-API-KEY': API_KEY
      }
    });

    if (response.ok) {
      const result = await response.json();
      const variables = result.data || [];
      
      console.log(`\n📊 Variáveis configuradas no N8N: ${variables.length}`);
      console.log('═══════════════════════════════════════════════════════');
      
      const configuredKeys = new Set(variables.map(v => v.key));
      
      for (const envVar of ENV_VARIABLES) {
        const status = configuredKeys.has(envVar.key) ? '✅' : '❌';
        console.log(`${status} ${envVar.key.padEnd(25)} = ${envVar.value}`);
      }
      
      console.log('═══════════════════════════════════════════════════════');
      
      const allConfigured = ENV_VARIABLES.every(v => configuredKeys.has(v.key));
      
      if (allConfigured) {
        console.log('\n✅ TODAS as variáveis estão configuradas!');
      } else {
        console.log('\n⚠️  Algumas variáveis faltam. Execute o script novamente.');
      }
      
      return allConfigured;
    } else {
      console.error('❌ Não foi possível verificar configuração');
      return false;
    }
  } catch (err) {
    console.error(`❌ Erro na verificação: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Configurando variáveis de ambiente no N8N...');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📍 URL: ${N8N_URL}`);
  console.log(`📦 Variáveis a configurar: ${ENV_VARIABLES.length}`);
  console.log('═══════════════════════════════════════════════════════');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const envVar of ENV_VARIABLES) {
    const result = await configureEnvironmentVariable(envVar);
    
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`✨ Configuração concluída!`);
  console.log(`✅ Sucesso: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log('═══════════════════════════════════════════════════════');
  
  // Verificar configuração final
  await verifyConfiguration();
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Criar credenciais no N8N:');
  console.log('   - Supabase HLJ DEV (PostgreSQL)');
  console.log('   - Evolution API HLJ (HTTP Header Auth)');
  console.log('2. Importar workflows: 01, 02, 03');
  console.log('3. Ativar workflows');
  console.log('4. Testar com lead de exemplo');
  console.log('\n🔗 Acessar: https://n8n.hljdev.com.br');
}

main();
