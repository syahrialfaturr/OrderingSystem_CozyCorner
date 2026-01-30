import { useState, useEffect } from 'react'
import { Package, DollarSign, ShoppingBag, CheckCircle, XCircle, ArrowRight, ArrowLeft, CreditCard, Wallet, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { stockAPI, revenueAPI, orderAPI, authAPI } from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stock')
  const [stocks, setStocks] = useState([])
  const [revenue, setRevenue] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cashReceived, setCashReceived] = useState('')
  const [stockUpdates, setStockUpdates] = useState({})
  const [today] = useState(new Date().toISOString().split('T')[0])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'stock') {
        const response = await stockAPI.getAll()
        setStocks(response.data || [])
        // Initialize stock updates
        const updates = {}
        if (response.data && response.data.length > 0) {
          response.data.forEach(stock => {
            updates[stock.id] = stock.quantity
          })
        }
        setStockUpdates(updates)
      } else if (activeTab === 'revenue') {
        const response = await revenueAPI.getDaily()
        setRevenue(response.data)
        setCashReceived(response.data?.cash_received || '')
        const ordersResponse = await orderAPI.getAll()
        setOrders(ordersResponse.data || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth')
      const token = localStorage.getItem('adminToken')
      
      if (auth === 'true' && token) {
        setIsAuthenticated(true)
        setCheckingAuth(false)
      } else {
        setCheckingAuth(false)
        navigate('/admin/login')
      }
    }
    
    checkAuth()
  }, [navigate])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [activeTab, isAuthenticated])

  const handleStockUpdate = async () => {
    try {
      const stocksToUpdate = Object.keys(stockUpdates).map(id => {
        const stock = stocks.find(s => s.id === parseInt(id))
        if (!stock) return null
        return {
          menu_item_id: stock.menu_item_id,
          quantity: parseInt(stockUpdates[id]) || 0
        }
      }).filter(s => s !== null && s.menu_item_id)

      if (stocksToUpdate.length === 0) {
        alert('Tidak ada stok yang perlu diupdate')
        return
      }

      await stockAPI.update({ stocks: stocksToUpdate })
      alert('Stok berhasil diupdate!')
      fetchData()
    } catch (error) {
      console.error('Error updating stock:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Gagal mengupdate stok'
      alert(`Gagal mengupdate stok: ${errorMessage}`)
    }
  }

  const handleCashUpdate = async () => {
    try {
      await revenueAPI.updateCash(parseFloat(cashReceived) || 0)
      alert('Uang tunai berhasil diupdate!')
      fetchData()
    } catch (error) {
      console.error('Error updating cash:', error)
      alert('Gagal mengupdate uang tunai')
    }
  }


  const getDifference = () => {
    if (!revenue) return 0
    const cashRevenue = revenue.cash_revenue || 0
    return (revenue.cash_received || 0) - cashRevenue
  }

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari dashboard admin?')) {
      authAPI.logout()
      navigate('/admin/login')
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl font-bold text-primary-600 animate-pulse">Memverifikasi...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl font-bold text-primary-600 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-primary-100">Cozy Corner - Manajemen Toko</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/cashier')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Mode Kasir
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'stock'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-primary-50'
            }`}
          >
            <Package className="w-5 h-5" />
            Update Stok
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'revenue'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-primary-50'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Pendapatan Harian
          </button>
        </div>

        {/* Stock Management */}
        {activeTab === 'stock' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Update Stok Harian</h2>
              <span className="text-gray-600">Tanggal: {new Date(today).toLocaleDateString('id-ID')}</span>
            </div>

            {stocks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">Belum ada stok untuk hari ini.</p>
                <p className="text-sm">Stok akan otomatis dibuat saat menu pertama kali dibuat.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {stocks.map(stock => (
                    <div key={stock.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{stock.name}</h3>
                        <p className="text-sm text-gray-600">{stock.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Stok:</span>
                        <input
                          type="number"
                          min="0"
                          value={stockUpdates[stock.id] || 0}
                          onChange={(e) => setStockUpdates({
                            ...stockUpdates,
                            [stock.id]: e.target.value
                          })}
                          className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStockUpdate}
                  className="btn-primary w-full"
                >
                  Simpan Update Stok
                </button>
              </>
            )}
          </div>
        )}

        {/* Revenue Management */}
        {activeTab === 'revenue' && revenue && (
          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Pendapatan</h3>
                  <DollarSign className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-3xl font-bold text-primary-600">
                  Rp {revenue.total_revenue.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-2">Tunai + QRIS</p>
              </div>

              <div className="card p-6 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Pendapatan Tunai</h3>
                  <Wallet className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  Rp {(revenue.cash_revenue || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-2">Pembayaran tunai</p>
              </div>

              <div className="card p-6 bg-green-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Pendapatan QRIS</h3>
                  <CreditCard className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  Rp {(revenue.qris_revenue || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-2">Pembayaran QRIS</p>
              </div>

              <div className={`card p-6 ${revenue.verified ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Status</h3>
                  {revenue.verified ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <XCircle className="w-8 h-8 text-yellow-500" />
                  )}
                </div>
                <p className="text-xl font-bold">
                  {revenue.verified ? 'Terverifikasi' : 'Belum Diverifikasi'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Verifikasi pendapatan</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Pesanan</h3>
                  <ShoppingBag className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-3xl font-bold text-primary-600">
                  {revenue.total_orders}
                </p>
                <p className="text-xs text-gray-500 mt-2">Jumlah pesanan hari ini</p>
              </div>
            </div>

            {/* Cash Verification */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Verifikasi Uang Tunai</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Pendapatan Tunai (Sistem):</span>
                    <span className="font-bold text-blue-700 text-lg">
                      Rp {(revenue.cash_revenue || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    * Hanya pendapatan dari pembayaran tunai
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Pendapatan QRIS (Sistem):</span>
                    <span className="font-bold text-gray-800">
                      Rp {(revenue.qris_revenue || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Total Pendapatan (Sistem):</span>
                    <span className="font-bold text-primary-700 text-lg">
                      Rp {revenue.total_revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Tunai + QRIS
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Uang Tunai yang Diterima:
                  </label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="Masukkan jumlah uang tunai"
                    className="input-field"
                  />
                </div>

                {cashReceived && (
                  <div className={`p-4 rounded-xl ${
                    getDifference() === 0 ? 'bg-green-50' : 
                    getDifference() > 0 ? 'bg-blue-50' : 'bg-red-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Selisih:</span>
                      <span className={`text-xl font-bold ${
                        getDifference() === 0 ? 'text-green-600' : 
                        getDifference() > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {getDifference() >= 0 ? '+' : ''}Rp {getDifference().toLocaleString('id-ID')}
                      </span>
                    </div>
                    {getDifference() === 0 && (
                      <p className="text-sm text-green-600 mt-2 font-semibold">✓ Uang tunai sesuai dengan pendapatan tunai sistem</p>
                    )}
                    {getDifference() !== 0 && (
                      <p className="text-sm mt-2">
                        {getDifference() > 0 
                          ? '⚠️ Uang tunai lebih dari pendapatan tunai sistem. Periksa kembali perhitungan.' 
                          : '⚠️ Uang tunai kurang dari pendapatan tunai sistem. Periksa kembali perhitungan.'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCashUpdate}
                  className="btn-primary w-full"
                >
                  Update Uang Tunai
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pesanan Hari Ini</h2>
                <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                  <strong>Pending</strong> = Pesanan baru, belum selesai • <strong>Completed</strong> = Pesanan selesai
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada pesanan hari ini
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{order.order_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleTimeString('id-ID')} • {order.order_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pembayaran: {order.payment_method === 'cash' ? 'Tunai' : order.payment_method === 'qris' ? 'QRIS' : order.payment_method}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-primary-600">
                            Rp {order.total_amount.toLocaleString('id-ID')}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'pending' ? 'Menunggu' : 
                             order.status === 'completed' ? 'Selesai' : 
                             'Dibatalkan'}
                          </span>
                        </div>
                        {order.status === 'pending' && (
                          <button
                            onClick={async () => {
                              if (confirm('Tandai pesanan ini sebagai selesai?')) {
                                try {
                                  await orderAPI.updateStatus(order.id, 'completed')
                                  fetchData()
                                } catch (error) {
                                  console.error('Error updating order status:', error)
                                  alert('Gagal mengupdate status pesanan')
                                }
                              }
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
