const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Read the SQL file
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    
    // Split the SQL into individual statements
    const statements = seedSQL
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    // Execute each statement
    for (let statement of statements) {
      if (statement.trim().toUpperCase().startsWith('CREATE TABLE')) {
        console.log('📦 Creating table...');
      }
      await pool.query(statement);
    }
    
    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Demo Users:');
    console.log('----------------');
    console.log('Entrepreneurs:');
    console.log('  - thandi@example.com');
    console.log('  - lebo@example.com');
    console.log('  - nomsa@example.com');
    console.log('  - sipho@example.com');
    console.log('  - zanele@example.com');
    console.log('\nMentors:');
    console.log('  - sarah.mentor@example.com');
    console.log('  - thabo.mentor@example.com');
    console.log('  - lerato.mentor@example.com');
    console.log('\nFunders:');
    console.log('  - info@vccgrowth.co.za');
    console.log('  - info@win.co.za');
    console.log('  - info@greentech.co.za');
    console.log('\n🔑 All passwords: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();