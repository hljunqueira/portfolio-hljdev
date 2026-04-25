
async function testMapsExtraction() {
  const url = 'https://n8n.hljdev.com.br/webhook/hlj-extracao-maps';
  const data = {
    query: "Madero",
    lat: -27.59,
    lng: -48.54
  };

  console.log('🚀 Iniciando extração de teste no Maps:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      console.log('✅ Extração iniciada com sucesso!');
    } else {
      console.error('❌ Erro no n8n:', response.status, await response.text());
    }
  } catch (err) {
    console.error('❌ Falha na conexão:', err.message);
  }
}

testMapsExtraction();
