import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N8N_URL = 'https://n8n.hljdev.com.br';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTE0YTU5NC1hYTRhLTRhZjItOWVlOS04M2ViY2U0NjRjZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYmVmZmY4ZTctNTU5Yi00NDdkLWI5MjktNGNiYTcwZTYwZjQ3IiwiaWF0IjoxNzc2ODgzMzU3fQ.cHHh1ThsggXX9chTs6cD4h4-wj8tHlIbeP5ARqV93P4';

const workflows = [
  '01_lead_inteligente.json',
  '12_extracao_maps.json',
  '04_instagram_dm_lead.json'
];

async function importWorkflow(filePath) {
  console.log(`\n📦 Processando: ${filePath}`);
  const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  try {
    // 1. Verificar se o workflow já existe
    const listResponse = await fetch(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': API_KEY }
    });
    const listData = await listResponse.json();
    const existingWorkflow = listData.data?.find(w => w.name === workflowData.name);

    let method = existingWorkflow ? 'PUT' : 'POST';
    let endpoint = existingWorkflow 
      ? `${N8N_URL}/api/v1/workflows/${existingWorkflow.id}` 
      : `${N8N_URL}/api/v1/workflows`;

    // Se o workflow está arquivado, deleta e recria do zero
    if (existingWorkflow && existingWorkflow.isArchived) {
      console.log(`🗑️  Deletando workflow arquivado para recriar...`);
      await fetch(`${N8N_URL}/api/v1/workflows/${existingWorkflow.id}`, {
        method: 'DELETE',
        headers: { 'X-N8N-API-KEY': API_KEY }
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      method = 'POST';
      endpoint = `${N8N_URL}/api/v1/workflows`;
    }

    console.log(`📡 Método: ${method} | Destino: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${existingWorkflow ? 'Atualizado' : 'Criado'}: ${workflowData.name}`);
      
      // Ativar o workflow após importar
      if (result.id) {
        await fetch(`${N8N_URL}/api/v1/workflows/${result.id}/activate`, {
          method: 'POST',
          headers: { 'X-N8N-API-KEY': API_KEY }
        });
        console.log(`▶️  Ativado: ${workflowData.name}`);
      }
      return result;
    } else {
      const error = await response.text();
      console.error(`❌ Erro: ${error}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Falha na requisição: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Importando workflows para N8N...\n');

  for (const workflow of workflows) {
    const filePath = path.join(__dirname, '..', 'automacoes', workflow);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Arquivo não encontrado: ${filePath}`);
      continue;
    }

    await importWorkflow(filePath);

    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✨ Importação concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Acessar: https://n8n.hljdev.com.br');
  console.log('2. Configurar credenciais (Supabase + Evolution API)');
  console.log('3. Ativar workflows');
}

main();
