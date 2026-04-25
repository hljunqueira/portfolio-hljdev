
async function createInstance() {
  const url = 'https://evolution.hljdev.com.br/instance/create';
  const data = {
    instanceName: "hlj-principal",
    integration: "WHATSAPP-BAILEYS",
    qrcode: true
  };

  console.log('🚀 Criando instância Evolution API...');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'apikey': 'hlj_ev_apikey_2026_secure_key'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('✅ Resultado:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

createInstance();
