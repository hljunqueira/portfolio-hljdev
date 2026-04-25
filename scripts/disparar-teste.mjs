
async function sendTestLead() {
  const url = 'https://n8n.hljdev.com.br/webhook/lead-captado';
  const lead = {
    nome: "Henrique Teste Antigravity",
    email: "henrique@elite.com.br",
    whatsapp: "5548991013293",
    interesse: "Sistema Web Personalizado",
    mensagem: "Olá Henrique! Este é um lead de teste enviado automaticamente pelo Antigravity para validar sua nova automação de elite.",
    endereco: "Rua do Sucesso, 100 - Centro, Florianópolis/SC",
    origem: "teste-antigravity"
  };

  console.log('🚀 Enviando lead de teste para:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        console.log('✅ Sucesso! Resposta do n8n:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('✅ Sucesso (Texto)! Resposta do n8n:', text);
      }
    } else {
      console.error('❌ Erro no n8n:', response.status, await response.text());
    }
  } catch (err) {
    console.error('❌ Falha na conexão:', err.message);
  }
}

sendTestLead();
