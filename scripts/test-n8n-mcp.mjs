import fetch from "node-fetch";

const N8N_URL = "https://n8n.hljdev.com.br";
const PUBLIC_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTE0YTU5NC1hYTRhLTRhZjItOWVlOS04M2ViY2U0NjRjZmUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiY2FjMTE5OGUtN2EzMy00MDlmLWIxODMtMGNiM2U5ZWMyYmE4IiwiaWF0IjoxNzg1OTU0MTA0fQ.ei9j4IlZnwi-BNVkzYKATHiycW9HWn7PCcRbSIjNLVU";
const MCP_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZTE0YTU5NC1hYTRhLTRhZjItOWVlOS04M2ViY2U0NjRjZmUiLCJpc3OiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjZhOGVlNzE4LThjNWQtNGExMS04ZjljLWQ3ZTk4NTdkMWI2ZSIsImlhdCI6MTc4NTk1NDQ0NX0.YwGiIKXJF2LFzC-Ln5IcJZSxSeJSF23sa32aSwbzEvc";

async function testPublicApi() {
  console.log("\n🔍 1. Testando API Pública do N8N...");
  try {
    const res = await fetch(`${N8N_URL}/api/v1/workflows`, {
      headers: {
        "X-N8N-API-KEY": PUBLIC_API_TOKEN,
        "Authorization": `Bearer ${PUBLIC_API_TOKEN}`
      }
    });

    console.log(`Status HTTP API: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ API Pública Conectada! Total de Workflows: ${data.data?.length || 0}`);
      data.data?.slice(0, 3).forEach(w => console.log(`   - [${w.id}] ${w.name} (Ativo: ${w.active})`));
    } else {
      console.error("❌ Falha no teste da API Pública:", await res.text());
    }
  } catch (err) {
    console.error("❌ Erro ao conectar na API Pública:", err.message);
  }
}

async function testMcpServer() {
  console.log("\n🔍 2. Testando N8N MCP Server HTTP Endpoint...");
  try {
    const res = await fetch(`${N8N_URL}/mcp-server/http`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MCP_TOKEN}`,
        "X-N8N-API-KEY": PUBLIC_API_TOKEN
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "AntigravityAIClient", version: "1.0.0" }
        }
      })
    });

    console.log(`Status HTTP MCP Server: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = await res.json();
      console.log("✅ MCP Server HTTP Respondendo com sucesso!");
      console.log("Resultado MCP:", JSON.stringify(data, null, 2));
    } else {
      const text = await res.text();
      console.log(`ℹ️ Resposta MCP (${res.status}):`, text);
    }
  } catch (err) {
    console.error("❌ Erro ao conectar no MCP Server:", err.message);
  }
}

async function run() {
  console.log("==========================================");
  console.log("🧪 Teste de Conexão N8N API & MCP Server");
  console.log("==========================================");
  await testPublicApi();
  await testMcpServer();
  console.log("==========================================");
}

run();
