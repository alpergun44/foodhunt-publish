/**
 * ShareModal — Şampiyon sonrası paylaşım modali
 */
import { useState } from 'react'
import type { Restaurant } from '../../api'
import { hapticImpact, nativeShare } from '../../utils/native'
import { Icon } from '../../components/ui/Icons'

interface Props {
  isOpen: boolean
  onClose: () => void
  champion: Restaurant | null
}

export function ShareModal({ isOpen, onClose, champion }: Props) {
  const [copied, setCopied] = useState(false)
  if (!isOpen || !champion) return null

  const shareText = `FoodHunt'ta şampiyonu seçtim: ${champion.name}! Sen de oyna`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://gofoodhunt.com'

  const handleNative = async () => {
    const used = await nativeShare({ title: 'FoodHunt Şampiyonu', text: shareText, url: shareUrl })
    if (used) { hapticImpact('light'); onClose() }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      setCopied(true)
      hapticImpact('light')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 safe-bottom"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface border border-brand-line rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-brand-line rounded-full mx-auto mb-4 sm:hidden" />
        <h2 className="text-lg font-semibold text-brand-cream mb-4 tracking-tight">Paylaş</h2>
        <div className="space-y-2">
          <button onClick={handleNative} className="btn-primary w-full justify-center inline-flex items-center gap-2">
            <Icon.Share /> Paylaş
          </button>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank')}
            className="social-btn justify-center"
          >
            <Icon.Whatsapp /> WhatsApp
          </button>
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            className="social-btn justify-center"
          >
            <Icon.Twitter /> X (Twitter)
          </button>
          <button onClick={handleCopy} className="social-btn justify-center">
            <Icon.Copy /> {copied ? 'Kopyalandı' : 'Linki kopyala'}
          </button>
        </div>
      </div>
    </div>
  )
}
