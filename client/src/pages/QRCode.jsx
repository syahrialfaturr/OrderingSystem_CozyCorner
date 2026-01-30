import { useEffect, useState } from 'react'
import { QrCode } from 'lucide-react'

const QRCodePage = () => {
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    // Get current URL and create QR code URL
    const currentUrl = window.location.origin
    setQrUrl(`${currentUrl}/`)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
      <div className="card p-8 max-w-md w-full text-center">
        <QrCode className="w-24 h-24 mx-auto mb-6 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Scan untuk Memesan</h1>
        <p className="text-gray-600 mb-6">
          Scan QR code ini dengan kamera smartphone Anda untuk mengakses menu Cozy Corner
        </p>
        
        <div className="bg-gray-100 p-6 rounded-xl mb-6">
          <div className="text-sm text-gray-600 mb-2">URL Menu:</div>
          <div className="text-primary-600 font-mono text-sm break-all">{qrUrl}</div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Atau buka browser dan kunjungi:</p>
          <p className="font-semibold text-primary-600 mt-2">{qrUrl}</p>
        </div>
      </div>
    </div>
  )
}

export default QRCodePage
