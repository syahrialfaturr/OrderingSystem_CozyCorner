import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CustomerMenu from './pages/CustomerMenu'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import CashierOrder from './pages/CashierOrder'
import QRCode from './pages/QRCode'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerMenu />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cashier" element={<CashierOrder />} />
        <Route path="/qr" element={<QRCode />} />
      </Routes>
    </Router>
  )
}

export default App
