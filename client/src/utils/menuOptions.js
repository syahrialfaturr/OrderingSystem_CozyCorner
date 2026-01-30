/**
 * Helper functions untuk mengelola opsi menu
 * Menu yang memiliki opsi:
 * - Ayam Geprek: Pilihan sambal (Matah / Bawang)
 * - Nasi Goreng: Pilihan tingkat pedas (Pedas / Tidak Pedas)
 */

// Konfigurasi menu yang memiliki opsi
const itemsWithOptions = {
  'Ayam Geprek': {
    type: 'sambal',
    options: ['matah', 'bawang'],
    labels: { 
      matah: 'Sambal Matah', 
      bawang: 'Sambal Bawang' 
    }
  },
  'Nasi Goreng': {
    type: 'pedas',
    options: ['pedas', 'tidak'],
    labels: { 
      pedas: 'Pedas', 
      tidak: 'Tidak Pedas' 
    }
  }
}

/**
 * Mengecek apakah menu tertentu memiliki opsi
 * @param {string} menuName - Nama menu
 * @returns {boolean} - true jika menu memiliki opsi, false jika tidak
 */
export const hasMenuOptions = (menuName) => {
  return menuName in itemsWithOptions
}

/**
 * Mendapatkan konfigurasi opsi untuk menu tertentu
 * @param {string} menuName - Nama menu
 * @returns {object|null} - Konfigurasi opsi atau null jika menu tidak memiliki opsi
 */
export const getMenuOptions = (menuName) => {
  return itemsWithOptions[menuName] || null
}

/**
 * Mendapatkan label untuk opsi tertentu
 * @param {string} menuName - Nama menu
 * @param {string} optionValue - Nilai opsi (misalnya 'matah', 'pedas')
 * @returns {string|null} - Label opsi atau null jika tidak ditemukan
 */
export const getOptionLabel = (menuName, optionValue) => {
  const menuOptions = getMenuOptions(menuName)
  if (!menuOptions) return null
  return menuOptions.labels[optionValue] || null
}

/**
 * Memformat opsi untuk ditampilkan
 * @param {object} options - Objek opsi (misalnya { sambal: 'matah' } atau { pedas: 'pedas' })
 * @param {string} menuName - Nama menu
 * @returns {string} - String yang diformat untuk ditampilkan
 */
export const formatOptionsDisplay = (options, menuName) => {
  if (!options || !menuName) return ''
  
  const menuOptions = getMenuOptions(menuName)
  if (!menuOptions) return ''
  
  // Ambil nilai opsi pertama (karena setiap menu hanya punya satu tipe opsi)
  const optionKey = Object.keys(options)[0]
  const optionValue = options[optionKey]
  
  const label = getOptionLabel(menuName, optionValue)
  return label || optionValue
}

/**
 * Memvalidasi apakah opsi yang dipilih valid untuk menu tertentu
 * @param {string} menuName - Nama menu
 * @param {string} optionValue - Nilai opsi yang dipilih
 * @returns {boolean} - true jika opsi valid, false jika tidak
 */
export const isValidOption = (menuName, optionValue) => {
  const menuOptions = getMenuOptions(menuName)
  if (!menuOptions) return false
  return menuOptions.options.includes(optionValue)
}

export default {
  hasMenuOptions,
  getMenuOptions,
  getOptionLabel,
  formatOptionsDisplay,
  isValidOption
}
