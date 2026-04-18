import bcrypt from 'bcryptjs';

async function generate() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Hash for admin123:', hash);
}

generate();
