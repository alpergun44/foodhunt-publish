/**
 * Deeplinks — Şampiyon ekranında "Sipariş Ver" linkleri
 * (Her zaman platformun ana sayfasına yönlendirir — restoran bazlı deeplink yok)
 */
import { api, authApi, safeGetItem, type Restaurant } from '../../api'
import { Icon } from '../../components/ui/Icons'
import { PLATFORM_LINKS } from '../tournament/constants'

export function Deeplinks({ restaurant }: { restaurant: Restaurant }) {
  const handleClick = (platform: string) => {
    api.trackEvent('deeplink_click', {
      platform,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
    })
    const token = safeGetItem('local', 'foodhunt_token')
    if (token) {
      authApi.trackDeeplinkOrder(token, { restaurant_id: restaurant.id, platform }).catch(() => {})
    }
  }

  const extraLinks = [
    restaurant.google_maps_url && { key: 'gmaps', label: 'Google Maps', url: restaurant.google_maps_url },
  ].filter(Boolean) as { key: string; label: string; url: string }[]

  return (
    <div className="mt-5 space-y-3">
      <div className="text-center space-y-0.5">
        <p className="text-brand-cream text-sm font-semibold tracking-tight">Sipariş ver</p>
        <p className="text-brand-muted text-xs">Şampiyonunu seçtin, sıra siparişte</p>
      </div>
      <div className="flex flex-col gap-2">
        {PLATFORM_LINKS.map(l => (
          <a
            key={l.key}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(l.key)}
            className="social-btn justify-between"
          >
            <span>{l.label}</span>
            <Icon.External />
          </a>
        ))}
        {extraLinks.map(l => (
          <a
            key={l.key}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(l.key)}
            className="social-btn justify-between"
          >
            <span>{l.label}</span>
            <Icon.External />
          </a>
        ))}
      </div>
      {safeGetItem('local', 'foodhunt_token') && (
        <p className="text-center text-brand-muted text-xs">+50 puan kazanırsın</p>
      )}
    </div>
  )
}
