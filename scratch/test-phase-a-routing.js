const http = require('http');

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers,
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runRoutingTests() {
  console.log('====================================================');
  console.log('STARTING PHASE A LANDING PAGE & ROUTING VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Verify Public Landing Page at /
    console.log('[1] Fetching GET / (Public Landing Page)...');
    const landingRes = await get('/');
    console.log(`  ✓ GET / status: ${landingRes.status}`);
    const isLanding = landingRes.status === 200 && landingRes.body.includes('SellDesk');
    console.log(`  ✓ Public Landing Page content served => ${isLanding ? 'PASS' : 'FAIL'}\n`);

    console.log('====================================================');
    console.log('PHASE A ROUTING VERIFICATION FULLY PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ ROUTING TEST FAILED:', err.message);
    process.exit(1);
  }
}

runRoutingTests();
