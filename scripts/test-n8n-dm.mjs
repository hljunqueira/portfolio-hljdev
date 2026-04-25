import fetch from 'node-fetch';

async function testN8N() {
  const webhookUrl = 'https://n8n.hljdev.com.br/webhook/insta-lead-direct';
  
  // Payload simulando um Direct Message do Instagram
  const mockPayload = {
    object: 'instagram',
    entry: [
      {
        id: 'IG_BUSINESS_ACCOUNT_ID',
        time: Math.floor(Date.now() / 1000),
        messaging: [
          {
            sender: { id: '999999999' },
            recipient: { id: 'BUSINESS_ID' },
            timestamp: Math.floor(Date.now() / 1000),
            message: {
              mid: 'mid.test_message_123',
              text: 'Teste de integração via API N8N - HLJ DEV'
            }
          }
        ]
      }
    ]
  };

  console.log(`🚀 Enviando POST para: ${webhookUrl}`);
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPayload)
    });

    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Body: "${text}"`);

    if (response.status === 200 && text.trim() === 'ok') {
      console.log('✅ SUCESSO: Webhook recebeu e respondeu com "ok"!');
    } else {
      console.log('❌ FALHA: Resposta inesperada do N8N.');
    }
  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

testN8N();
