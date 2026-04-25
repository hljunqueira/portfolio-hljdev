
import fs from 'fs';
import path from 'path';

async function saveQRCode() {
  const url = 'https://evolution.hljdev.com.br/instance/connect/hlj-principal';
  const apikey = 'hlj_ev_apikey_2026_secure_key';

  try {
    const response = await fetch(url, {
      headers: { 'apikey': apikey }
    });
    const data = await response.json();
    
    if (data.base64) {
      const base64Data = data.base64.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync('qrcode.png', base64Data, 'base64');
      console.log('✅ QR Code salvo como qrcode.png');
    } else {
      console.log('❌ QR Code não disponível ou já conectado:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

saveQRCode();
