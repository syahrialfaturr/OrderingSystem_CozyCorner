const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'cozycorner.db');
const db = new sqlite3.Database(dbPath);

// Daftar deskripsi baru
const descriptions = {
  'Americano': 'Espresso encer dengan rasa kopi murni',
  'Cappuccino': 'Perpaduan espresso, susu, dan foam lembut',
  'Latte': 'Espresso dengan susu creamy yang lembut',
  'Ayam Geprek': 'Ayam goreng geprek dengan sambal mantap',
  'Donut': 'Donat lembut dengan topping manis',
  'French Fries': 'Kentang goreng renyah dan gurih',
  'Nasi Goreng': 'Nasi goreng hangat dengan cita rasa klasik',
  'Iced Chocolate': 'Cokelat dingin manis dan creamy',
  'Iced Lemon Tea': 'Teh dingin segar dengan perasan lemon',
  'Iced Matcha': 'Matcha dingin creamy dan lembut',
  'Iced Tea': 'Teh dingin klasik dan menyegarkan'
};

console.log('🔄 Memulai update deskripsi menu...\n');

db.serialize(() => {
  let updated = 0;
  let errors = 0;

  Object.keys(descriptions).forEach((name, index) => {
    const description = descriptions[name];
    
    db.run(
      'UPDATE menu_items SET description = ? WHERE name = ?',
      [description, name],
      function(err) {
        if (err) {
          console.error(`❌ Error updating ${name}:`, err.message);
          errors++;
        } else {
          if (this.changes > 0) {
            console.log(`✅ ${name}: "${description}"`);
            updated++;
          } else {
            console.log(`⚠️  ${name}: Menu tidak ditemukan`);
          }
        }

        // Jika ini adalah item terakhir
        if (index === Object.keys(descriptions).length - 1) {
          console.log(`\n📊 Hasil: ${updated} menu berhasil diupdate, ${errors} error`);
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('\n✨ Update selesai! Refresh browser untuk melihat perubahan.');
            }
          });
        }
      }
    );
  });
});
