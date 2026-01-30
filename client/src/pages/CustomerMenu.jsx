import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, X, Coffee, UtensilsCrossed, GlassWater, CreditCard, Wallet } from 'lucide-react'
import { menuAPI, orderAPI } from '../services/api'
import { hasMenuOptions, getMenuOptions, getOptionLabel } from '../utils/menuOptions'

const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cashier') // 'cashier' or 'qris'
  const [showOptionModal, setShowOptionModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll()
      setMenuItems(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching menu:', error)
      setLoading(false)
    }
  }

  const handleAddToCartClick = (item) => {
    if (item.is_sold_out) return
    
    // Jika menu memiliki opsi, buka modal dulu
    if (hasMenuOptions(item.name)) {
      setSelectedItem(item)
      setSelectedOption(null)
      setShowOptionModal(true)
    } else {
      // Jika tidak ada opsi, langsung tambahkan ke cart
      addToCart(item, null)
    }
  }

  const addToCart = (item, options = null) => {
    if (item.is_sold_out) return
    
    // Jika ada opsi, cari item dengan menu_item_id dan opsi yang sama
    if (options) {
      const existingItem = cart.find(cartItem => 
        cartItem.menu_item_id === item.id && 
        JSON.stringify(cartItem.options) === JSON.stringify(options)
      )
      
      if (existingItem) {
        setCart(cart.map(cartItem =>
          cartItem.menu_item_id === item.id && 
          JSON.stringify(cartItem.options) === JSON.stringify(options)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ))
      } else {
        setCart([...cart, {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          options: options
        }])
      }
    } else {
      // Jika tidak ada opsi, logika lama
      const existingItem = cart.find(cartItem => 
        cartItem.menu_item_id === item.id && !cartItem.options
      )
      
      if (existingItem) {
        setCart(cart.map(cartItem =>
          cartItem.menu_item_id === item.id && !cartItem.options
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ))
      } else {
        setCart([...cart, {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }])
      }
    }
  }

  const handleConfirmOption = () => {
    if (!selectedItem || !selectedOption) return
    
    const menuOptions = getMenuOptions(selectedItem.name)
    if (!menuOptions) return
    
    // Buat objek opsi sesuai dengan type
    const optionsObj = { [menuOptions.type]: selectedOption }
    
    // Tambahkan ke cart dengan opsi
    addToCart(selectedItem, optionsObj)
    
    // Tutup modal
    setShowOptionModal(false)
    setSelectedItem(null)
    setSelectedOption(null)
  }

  const updateQuantity = (itemId, change, options = null) => {
    setCart(cart.map(item => {
      const itemOptionsMatch = JSON.stringify(item.options || {}) === JSON.stringify(options || {})
      if (item.menu_item_id === itemId && itemOptionsMatch) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return null
        return { ...item, quantity: item.quantity + change }
      }
      return item
    }).filter(Boolean))
  }

  const removeFromCart = (itemId, options = null) => {
    setCart(cart.filter(item => {
      const itemOptionsMatch = JSON.stringify(item.options || {}) === JSON.stringify(options || {})
      return !(item.menu_item_id === itemId && itemOptionsMatch)
    }))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    if (!paymentMethod) {
      alert('Silakan pilih metode pembayaran terlebih dahulu')
      return
    }

    try {
      // Jika pilih bayar di kasir, payment method tetap 'cash' tapi orderType tetap 'self-service'
      // Jika pilih QRIS, payment method adalah 'qris'
      const finalPaymentMethod = paymentMethod === 'cashier' ? 'cash' : 'qris'
      
      await orderAPI.create({
        items: cart,
        orderType: 'self-service',
        paymentMethod: finalPaymentMethod
      })
      
      setCart([])
      setShowCart(false)
      setPaymentMethod('cashier') // Reset to default
      setOrderPlaced(true)
      
      setTimeout(() => {
        setOrderPlaced(false)
        fetchMenu() // Refresh menu to update stock
      }, 3000)
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Gagal memproses pesanan. Silakan coba lagi.')
    }
  }

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory)

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Coffee': return <Coffee className="w-5 h-5" />
      case 'Non Coffee': return <GlassWater className="w-5 h-5" />
      case 'Food': return <UtensilsCrossed className="w-5 h-5" />
      default: return null
    }
  }

  const getMenuImage = (name) => {
    // Menggunakan gambar lokal dari folder public
    const imageMap = {
      'Americano': '/americano.jpeg',
      'Cappuccino': '/cappuccino.jpeg',
      'Latte': '/latte.jpeg',
      'Iced Tea': '/esteh.jpg',
      'Iced Lemon Tea': '/iced-lemon-tea.jpg',
      'Iced Chocolate': '/iced-chocolate.jpg',
      'Iced Matcha': '/iced-matcha.jpeg',
      'French Fries': '/kentang.jpeg',
      'Ayam Geprek': '/ayam-geprek.jpg',
      'Nasi Goreng': '/nasi-goreng.jpg',
      'Donut': '/donut.jpeg'
    }
    return imageMap[name] || '/americano.jpeg' // Default fallback
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl font-bold text-primary-600 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">☕ Cozy Corner</h1>
          <p className="text-primary-100">Pesan kopi favoritmu dengan mudah</p>
        </div>
      </div>

      {/* Success Message */}
      {orderPlaced && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl z-50 animate-slide-in">
          <div className="font-semibold">✓ Pesanan berhasil dibuat!</div>
        </div>
      )}

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['all', 'Coffee', 'Non Coffee', 'Food'].map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-primary-50'
              }`}
            >
              {category !== 'all' && getCategoryIcon(category)}
              <span>{category === 'all' ? 'Semua' : category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`card p-4 ${item.is_sold_out ? 'opacity-60' : 'hover:scale-105'} transition-all duration-300`}
            >
              <div className="relative mb-4">
                <img
                  src={getMenuImage(item.name)}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
                  }}
                />
                {item.is_sold_out && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">SOLD OUT</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">
                  Rp {item.price.toLocaleString('id-ID')}
                </span>
                {!item.is_sold_out && (
                  <button
                    onClick={() => handleAddToCartClick(item)}
                    className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-primary-500 text-white p-4 rounded-full shadow-2xl hover:bg-primary-600 transition-all transform hover:scale-110 z-40"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Keranjang</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Keranjang kosong
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <div key={`${item.menu_item_id}-${index}-${JSON.stringify(item.options || {})}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          {item.options && (
                            <p className="text-sm text-gray-600 mt-1">
                              {getOptionLabel(item.name, Object.values(item.options)[0])}
                            </p>
                          )}
                          <p className="text-primary-600 font-bold">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const itemToUpdate = cart.find(cartItem => 
                                cartItem.menu_item_id === item.menu_item_id &&
                                JSON.stringify(cartItem.options || {}) === JSON.stringify(item.options || {})
                              )
                              if (itemToUpdate) {
                                updateQuantity(item.menu_item_id, -1, item.options)
                              }
                            }}
                            className="bg-white border-2 border-gray-300 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const itemToUpdate = cart.find(cartItem => 
                                cartItem.menu_item_id === item.menu_item_id &&
                                JSON.stringify(cartItem.options || {}) === JSON.stringify(item.options || {})
                              )
                              if (itemToUpdate) {
                                updateQuantity(item.menu_item_id, 1, item.options)
                              }
                            }}
                            className="bg-white border-2 border-gray-300 text-gray-700 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.menu_item_id, item.options)}
                            className="bg-red-100 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-200 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        Rp {getTotal().toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Metode Pembayaran:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('cashier')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === 'cashier'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                          }`}
                        >
                          <Wallet className="w-6 h-6 mx-auto mb-2" />
                          <span className="font-semibold text-sm">Bayar di Kasir</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('qris')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === 'qris'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                          }`}
                        >
                          <CreditCard className="w-6 h-6 mx-auto mb-2" />
                          <span className="font-semibold text-sm">QRIS</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="btn-primary w-full"
                    >
                      {paymentMethod === 'cashier' ? 'Checkout - Bayar di Kasir' : 'Checkout - Bayar QRIS'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Option Modal */}
      {showOptionModal && selectedItem && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => {
              setShowOptionModal(false)
              setSelectedItem(null)
              setSelectedOption(null)
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedItem.name}</h2>
                <button
                  onClick={() => {
                    setShowOptionModal(false)
                    setSelectedItem(null)
                    setSelectedOption(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">Pilih opsi yang diinginkan:</p>

              {(() => {
                const menuOptions = getMenuOptions(selectedItem.name)
                if (!menuOptions) return null

                return (
                  <div className="space-y-3 mb-6">
                    {menuOptions.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedOption === option
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{menuOptions.labels[option]}</span>
                          {selectedOption === option && (
                            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              })()}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOptionModal(false)
                    setSelectedItem(null)
                    setSelectedOption(null)
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmOption}
                  disabled={!selectedOption}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                    selectedOption
                      ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CustomerMenu
