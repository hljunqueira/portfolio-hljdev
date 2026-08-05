import fs from "fs";
import path from "path";

const N8N_URL = "https://n8n.hljdev.com.br";
const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTE0YTU5NC1hYTRhLTRhZjItOWVlOS04M2ViY2U0NjRjZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiY2FjMTE5OGUtN2EzMy00MDlmLWIxODMtMGNiM2U5ZWMyYmE4IiwiaWF0IjoxNzg1OTU0MTA0fQ.ei9j4IlZnwi-BNVkzYKATHiycW9HWn7PCcRbSIjNLVU";

const HEADERS = {
  "X-N8N-API-KEY": API_TOKEN,
  "Authorization": `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json"
};

async function fetchExistingWorkflows() {
  try {
    const res = await fetch(`${N8N_URL}/api/v1/workflows`, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Erro ao buscar workflows do N8N: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("❌ Falha na conexão com a API do N8N:", err);
    return [];
  }
}

async function deployWorkflow(filePath, existingWorkflows) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const workflowData = JSON.parse(fileContent);
  const name = workflowData.name;

  const existing = existingWorkflows.find(w => w.name === name);

  if (existing) {
    console.log(`🔄 Atualizando workflow existente: "${name}" (ID: ${existing.id})...`);
    const updateRes = await fetch(`${N8N_URL}/api/v1/workflows/${existing.id}`, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || {}
      })
    });

    if (updateRes.ok) {
      console.log(`✅ Workflow "${name}" atualizado com sucesso!`);
      // Ativar workflow
      await fetch(`${N8N_URL}/api/v1/workflows/${existing.id}/activate`, { method: "POST", headers: HEADERS });
    } else {
      console.error(`❌ Erro ao atualizar "${name}":`, await updateRes.text());
    }
  } else {
    console.log(`🚀 Publicando novo workflow: "${name}"...`);
    const createRes = await fetch(`${N8N_URL}/api/v1/workflows`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || {}
      })
    });

    if (createRes.ok) {
      const created = await createRes.json();
      console.log(`✅ Workflow "${name}" criado com sucesso! (ID: ${created.id})`);
      // Ativar workflow
      await fetch(`${N8N_URL}/api/v1/workflows/${created.id}/activate`, { method: "POST", headers: HEADERS });
    } else {
      console.error(`❌ Erro ao criar "${name}":`, await createRes.text());
    }
  }
}

async function main() {
  console.log("==========================================");
  console.log("⚡ HLJ DEV - N8N Workflow Deploy & Sync Engine");
  console.log("==========================================");

  const existing = await fetchExistingWorkflows();
  console.log(`📋 Workflows ativos no N8N: ${existing.length}`);

  const apiCoreDir = path.resolve(process.cwd(), "api-core");
  if (!fs.existsSync(apiCoreDir)) {
    console.error("❌ Diretório api-core não localizado!");
    return;
  }

  const files = fs.readdirSync(apiCoreDir).filter(f => f.endsWith(".json"));
  console.log(`📁 Encontrados ${files.length} arquivos de workflow em api-core/`);

  for (const file of files) {
    const fullPath = path.join(apiCoreDir, file);
    await deployWorkflow(fullPath, existing);
  }

  console.log("==========================================");
  console.log("🎉 Sincronização e Publicação no N8N Concluídas!");
}

main();
