const bcrypt = require('bcryptjs');

async function test() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Hash para admin123:', hash);
  
  const storedHash = '$2a$10$3Cl8jWKBrqhNHEMPJyYz4.wUHBM.FUgwNGlGnlBHxOYtOUzQM1jPu';
  const isValid = await bcrypt.compare('admin123', storedHash);
  console.log('Senha válida?', isValid);
}

test();
