import fetch from 'node-fetch';

async function testWebhook() {
  const url = 'https://n8n.hljdev.com.br/webhook/instagram-lead?hub.mode=subscribe&hub.verify_token=HLJ_INSTA_2026&hub.challenge=TEST_CHALLENGE_123';
  console.log(`Testing URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Body: "${text}"`);
    
    if (text === 'TEST_CHALLENGE_123') {
      console.log('SUCCESS: Webhook returned the challenge correctly!');
    } else {
      console.log('FAILURE: Webhook returned wrong content.');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testWebhook();
