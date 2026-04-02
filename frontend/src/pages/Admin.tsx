import { useState, useEffect, useRef, useMemo } from 'react'
import { adminApi, Restaurant, AdminStats, District, Region, Tournament, CompetitionSlot, AvailableHours, safeGetItem, safeSetItem, safeRemoveItem } from '../api'

// ─── Constants ──────────────────────────────────────────────────────────────
const CUISINES = ['Türk Mutfağı','İtalyan','Japon','Çin','Meksika','Hint','Fast Food','Deniz Ürünleri','Vegan','Kahvaltı','Tatlıcı','Cafe','Kokoreç','Döner','Kebap','Pizza','Burger','Sushi','Thai','Kore','Balık','Ev Yemekleri','Meyhane','Sokak Lezzetleri','Diğer']
const AREAS = ['Tuzla','Kadıköy','Beşiktaş','Beyoğlu','Şişli','Üsküdar','Fatih','Bakırköy','Ataşehir','Maltepe','Sarıyer','Diğer']
const AREA_DISTRICTS = [
  { name: 'Tuzla', lat: 40.8169, lng: 29.3003 },
  { name: 'Kadıköy', lat: 40.9828, lng: 29.0290 },
  { name: 'Beşiktaş', lat: 41.0420, lng: 29.0070 },
  { name: 'Beyoğlu', lat: 41.0370, lng: 28.9770 },
  { name: 'Şişli', lat: 41.0600, lng: 28.9870 },
  { name: 'Üsküdar', lat: 41.0235, lng: 29.0153 },
  { name: 'Fatih', lat: 41.0186, lng: 28.9497 },
  { name: 'Bakırköy', lat: 40.9800, lng: 28.8720 },
  { name: 'Ataşehir', lat: 40.9830, lng: 29.1100 },
  { name: 'Maltepe', lat: 40.9340, lng: 29.1320 },
  { name: 'Sarıyer', lat: 41.1670, lng: 29.0500 },
]
const SLOT_PRESETS = [
  { slot: 'breakfast', label: 'Kahvaltı', start: '07:00', end: '10:00' },
  { slot: 'lunch', label: 'Öğle', start: '11:00', end: '14:00' },
  { slot: 'afternoon', label: 'İkindi', start: '14:00', end: '17:00' },
  { slot: 'dinner', label: 'Akşam', start: '18:00', end: '22:00' },
  { slot: 'late', label: 'Gece', start: '22:00', end: '02:00' },
]
const DAY_LABELS = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']
const PRICE_LABELS = ['', '\u20BA', '\u20BA\u20BA', '\u20BA\u20BA\u20BA', '\u20BA\u20BA\u20BA\u20BA']
const PER_PAGE = 20

// ─── Icons ──────────────────────────────────────────────────────────────────
const I = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  BarChart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Grid: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2}/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2}/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2}/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2}/></svg>,
  Menu: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  LogOut: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  RefreshCw: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  X: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Star: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
}

// ─── CSV Parser ─────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = []; let cur = ''; let inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') { if (inQ && text[i+1] === '"') { cur += '"'; i++ } else inQ = !inQ }
    else if (c === '\n' && !inQ) { if (cur.trim()) lines.push(cur); cur = '' }
    else cur += c
  }
  if (cur.trim()) lines.push(cur)
  if (lines.length < 2) return []
  const hdr = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const vals: string[] = []; let c2 = ''; let q2 = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { if (q2 && line[i+1] === '"') { c2 += '"'; i++ } else q2 = !q2 }
      else if (ch === ',' && !q2) { vals.push(c2.trim()); c2 = '' }
      else c2 += ch
    }
    vals.push(c2.trim())
    const obj: Record<string, string> = {}
    hdr.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
}

// ─── Toast Hook ─────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState<{id:string;msg:string;type:'ok'|'err'}[]>([])
  const show = (msg: string, type: 'ok'|'err' = 'ok') => {
    const id = Date.now().toString()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }
  return { toasts, show }
}

// ─── Restaurant Form ────────────────────────────────────────────────────────
interface FormProps {
  initial?: Partial<Restaurant>
  token: string
  onSave: () => void
  onClose: () => void
  show: (msg: string, type: 'ok'|'err') => void
}

function RestForm({ initial, token, onSave, onClose, show }: FormProps) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<Partial<Restaurant>>(initial || {
    name: '', cuisine: '', area: '', rating: 4.0, price_level: 2,
    calories_min: 300, calories_max: 800, is_active: 1, description: '', address: '', tags: [],
    competition_slots: [], available_hours: { open: '09:00', close: '23:00', days: [1,2,3,4,5,6,7] }, district: '', il: 'İstanbul', mahalle: '',
    top3_products: [],
  })
  const [tagInput, setTagInput] = useState((initial?.tags || []).join(', '))
  const [top3Input, setTop3Input] = useState((initial?.top3_products || []).map(p => `${p.emoji} ${p.name}`).join(', '))
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(initial?.image_url || '')
  const fileRef = useRef<HTMLInputElement>(null)
  const [formRegions, setFormRegions] = useState<Region[]>([])

  useEffect(() => {
    adminApi.getRegions(token).then(setFormRegions).catch(() => {})
  }, [token])

  const selectedRegion = formRegions.find(r => r.ilce === form.area)
  const mahalleler = selectedRegion?.mahalleler || []

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await adminApi.uploadImage(token, file)
      set('image_url', url)
      setImagePreview(url)
      show('Görsel yüklendi', 'ok')
    } catch { show('Yükleme başarısız', 'err') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { show('Restoran adı zorunlu', 'err'); return }
    if (!form.cuisine?.trim()) { show('Mutfak tipi zorunlu', 'err'); return }
    if (!form.area?.trim()) { show('Bölge zorunlu', 'err'); return }
    if (form.rating !== undefined && (form.rating < 0 || form.rating > 5)) {
      show('Puan 0-5 arasında olmalı', 'err'); return
    }
    if (form.price_level !== undefined && (form.price_level < 1 || form.price_level > 4)) {
      show('Fiyat seviyesi 1-4 arasında olmalı', 'err'); return
    }
    if (form.calories_min && form.calories_max && form.calories_min > form.calories_max) {
      show('Min kalori max kaloriden büyük olamaz', 'err'); return
    }
    if (form.lat && (form.lat < -90 || form.lat > 90)) {
      show('Geçersiz enlem değeri', 'err'); return
    }
    if (form.lng && (form.lng < -180 || form.lng > 180)) {
      show('Geçersiz boylam değeri', 'err'); return
    }
    setLoading(true)
    try {
      const parsedTop3 = top3Input.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(item => {
        // Parse "🔥 Adana Kebap" format — first char(s) as emoji, rest as name
        const match = item.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*(.+)$/u)
        if (match) return { emoji: match[1], name: match[2].trim() }
        return { emoji: '🍽️', name: item }
      })
      const data = { ...form, tags: tagInput.split(',').map(t => t.trim()).filter(Boolean), top3_products: parsedTop3 }
      if (isEdit) {
        await adminApi.updateRestaurant(token, initial!.id!, data)
        show('Restoran güncellendi', 'ok')
      } else {
        await adminApi.createRestaurant(token, data)
        show('Restoran eklendi', 'ok')
      }
      onSave()
      onClose()
    } catch { show('Kaydetme başarısız', 'err') }
    finally { setLoading(false) }
  }

  const inp = (label: string, key: string, type = 'text') => (
    <div>
      <label className="block text-xs text-brand-muted mb-1">{label}</label>
      <input type={type} value={(form as Record<string, any>)[key] ?? ''} onChange={e => set(key, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-brand-card border border-white/10 rounded-2xl p-6 w-full max-w-2xl my-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-brand-cream">{isEdit ? 'Restoran Düzenle' : 'Yeni Restoran'}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white"><I.X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp('Restoran Adı *', 'name')}
            <div>
              <label className="block text-xs text-brand-muted mb-1">Mutfak Tipi *</label>
              <select value={form.cuisine || ''} onChange={e => set('cuisine', e.target.value)}
                className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none">
                <option value="">Seç...</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1">İlçe (Bölge) *</label>
              <select value={form.area || ''} onChange={e => {
                const ilce = e.target.value
                const region = formRegions.find(r => r.ilce === ilce)
                set('area', ilce)
                set('il', region?.il || 'İstanbul')
                set('mahalle', '')
                if (region) { set('lat', region.lat); set('lng', region.lng) }
              }}
                className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none">
                <option value="">İlçe seç...</option>
                {formRegions.map(r => <option key={r.ilce} value={r.ilce}>{r.ilce} {r.is_active ? '(Aktif)' : ''}</option>)}
                {AREAS.filter(a => !formRegions.some(r => r.ilce === a)).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1">Mahalle</label>
              {mahalleler.length > 0 ? (
                <select value={form.mahalle || ''} onChange={e => set('mahalle', e.target.value)}
                  className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none">
                  <option value="">Mahalle seç...</option>
                  {mahalleler.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input type="text" value={form.mahalle || ''} onChange={e => set('mahalle', e.target.value)} placeholder="Mahalle adı girin"
                  className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
              )}
            </div>
          </div>
          {/* Legacy: hidden area buttons for backward compat - replaced by dropdowns above */}
          <div className="hidden">
            <div className="flex gap-2 flex-wrap mt-1">
              {AREA_DISTRICTS.map(d => (
                <button key={d.name} type="button" onClick={() => { set('area', d.name); set('lat', d.lat); set('lng', d.lng) }}
                  className={`px-2 py-1 rounded text-xs transition ${form.area === d.name ? 'bg-brand-coral text-white' : 'bg-brand-elevated text-brand-muted hover:bg-white/10'}`}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1">Puan ({(form.rating || 0).toFixed(1)})</label>
              <input type="range" min="0" max="5" step="0.1" value={form.rating || 0} onChange={e => set('rating', parseFloat(e.target.value))} className="w-full accent-brand-coral" />
            </div>
            <div>
              <label className="block text-xs text-brand-muted mb-1">Fiyat {PRICE_LABELS[form.price_level || 2]}</label>
              <div className="flex gap-1">
                {[1,2,3,4].map(n => (
                  <button key={n} type="button" onClick={() => set('price_level', n)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition ${form.price_level === n ? 'bg-brand-coral text-white' : 'bg-brand-surface text-brand-muted hover:bg-white/10'}`}>
                    {PRICE_LABELS[n]}
                  </button>
                ))}
              </div>
            </div>
            {inp('Kalori Min', 'calories_min', 'number')}
            {inp('Kalori Max', 'calories_max', 'number')}
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Açıklama</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp('Adres', 'address')}
            {inp('Telefon', 'phone')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {inp('Enlem (lat)', 'lat', 'number')}
            {inp('Boylam (lng)', 'lng', 'number')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp('Yemeksepeti Link', 'yemeksepeti_link')}
            {inp('Getir Link', 'getir_link')}
            {inp('Trendyol Link', 'trendyol_link')}
            {inp('Google Maps URL', 'google_maps_url')}
            {inp('Website', 'website')}
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Görsel</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-muted text-sm hover:bg-white/10">
                <I.Upload /> Yükle
              </button>
              <input type="text" value={form.image_url || ''} onChange={e => { set('image_url', e.target.value); setImagePreview(e.target.value) }}
                placeholder="veya URL yapıştır" className="flex-1 px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-24 rounded-lg object-cover" onError={() => setImagePreview('')} />}
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Etiketler (virgül ile ayır)</label>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="türk, kebap, kadıköy"
              className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
            {tagInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagInput.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-brand-coral/20 text-brand-coral-light rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}
          </div>
          {/* Top 3 Products */}
          <div>
            <label className="block text-xs text-brand-muted mb-1">Top 3 Ürün (emoji + isim, virgül ile ayır)</label>
            <input type="text" value={top3Input} onChange={e => setTop3Input(e.target.value)} placeholder="🔥 Adana Kebap, 🥙 Durum, 🍖 Kuzu Şiş"
              className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
            {top3Input && (
              <div className="flex flex-wrap gap-1 mt-2">
                {top3Input.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-brand-amber/20 text-brand-amber rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}
          </div>
          {/* District - hidden, replaced by il/ilce/mahalle above */}
          {/* Available Hours */}
          <div className="border-t border-white/10 pt-4">
            <label className="block text-xs text-brand-muted mb-2 font-semibold">Açılış Saatleri</label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="text-xs text-brand-muted">Açılış</label>
                <input type="time" value={form.available_hours?.open || '09:00'} onChange={e => set('available_hours', { ...form.available_hours, open: e.target.value, close: form.available_hours?.close || '23:00', days: form.available_hours?.days || [1,2,3,4,5,6,7] })}
                  className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-brand-muted">Kapanış</label>
                <input type="time" value={form.available_hours?.close || '23:00'} onChange={e => set('available_hours', { ...form.available_hours, open: form.available_hours?.open || '09:00', close: e.target.value, days: form.available_hours?.days || [1,2,3,4,5,6,7] })}
                  className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
              </div>
            </div>
            <label className="text-xs text-brand-muted">Açık Günler</label>
            <div className="flex gap-1 mt-1">
              {DAY_LABELS.map((d, i) => {
                const dayNum = i + 1
                const days = form.available_hours?.days || [1,2,3,4,5,6,7]
                const active = days.includes(dayNum)
                return (
                  <button key={d} type="button" onClick={() => {
                    const newDays = active ? days.filter(x => x !== dayNum) : [...days, dayNum].sort()
                    set('available_hours', { ...form.available_hours, open: form.available_hours?.open || '09:00', close: form.available_hours?.close || '23:00', days: newDays })
                  }} className={`flex-1 py-1.5 rounded text-xs font-bold transition ${active ? 'bg-brand-coral text-white' : 'bg-brand-surface text-brand-muted hover:bg-white/10'}`}>{d}</button>
                )
              })}
            </div>
          </div>
          {/* Competition Slots */}
          <div className="border-t border-white/10 pt-4">
            <label className="block text-xs text-brand-muted mb-2 font-semibold">Turnuva Slotları</label>
            <div className="flex gap-1 flex-wrap mb-2">
              {SLOT_PRESETS.map(sp => {
                const exists = (form.competition_slots || []).some(s => s.slot === sp.slot)
                return (
                  <button key={sp.slot} type="button" onClick={() => {
                    if (exists) {
                      set('competition_slots', (form.competition_slots || []).filter(s => s.slot !== sp.slot))
                    } else {
                      set('competition_slots', [...(form.competition_slots || []), { slot: sp.slot, start: sp.start, end: sp.end }])
                    }
                  }} className={`px-2 py-1 rounded text-xs transition ${exists ? 'bg-brand-coral text-white' : 'bg-brand-surface text-brand-muted hover:bg-white/10'}`}>
                    {sp.label} ({sp.start}-{sp.end})
                  </button>
                )
              })}
            </div>
            {(form.competition_slots || []).map((slot, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-1">
                <input type="text" value={slot.slot} onChange={e => { const u = [...(form.competition_slots || [])]; u[idx] = { ...u[idx], slot: e.target.value }; set('competition_slots', u) }}
                  className="flex-1 px-2 py-1 bg-brand-surface border border-white/10 rounded text-brand-cream text-xs" placeholder="Slot adı" />
                <input type="time" value={slot.start} onChange={e => { const u = [...(form.competition_slots || [])]; u[idx] = { ...u[idx], start: e.target.value }; set('competition_slots', u) }}
                  className="w-24 px-2 py-1 bg-brand-surface border border-white/10 rounded text-brand-cream text-xs" />
                <input type="time" value={slot.end} onChange={e => { const u = [...(form.competition_slots || [])]; u[idx] = { ...u[idx], end: e.target.value }; set('competition_slots', u) }}
                  className="w-24 px-2 py-1 bg-brand-surface border border-white/10 rounded text-brand-cream text-xs" />
                <button type="button" onClick={() => set('competition_slots', (form.competition_slots || []).filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-300 text-xs px-1">Sil</button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => set('is_active', form.is_active ? 0 : 1)}>
            <div className={`w-10 h-5 rounded-full transition relative ${form.is_active ? 'bg-brand-fresh' : 'bg-brand-elevated'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-brand-cream">{form.is_active ? 'Aktif' : 'Pasif'}</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-brand-surface text-brand-muted rounded-xl hover:bg-white/10 text-sm font-semibold">İptal</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-brand-coral text-white rounded-xl hover:bg-brand-coral-light text-sm font-semibold disabled:opacity-50 transition">
              {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Admin ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [view, setView] = useState<'dashboard' | 'restaurants' | 'districts' | 'tournaments' | 'cards' | 'export'>('dashboard')
  const [token, setToken] = useState(safeGetItem('local', 'fh_admin_token') || '')
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('')
  const [filterActive, setFilterActive] = useState<''|'1'|'0'>('')
  const [sortBy, setSortBy] = useState<'name'|'rating'|'id'>('id')
  const [page, setPage] = useState(0)
  const [editRest, setEditRest] = useState<Restaurant | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [cards, setCards] = useState<{id:number;text:string;emoji:string;category?:string}[]>([])
  const [newCard, setNewCard] = useState({ text: '', emoji: '', category: '' })
  const [nearbyDistrict, setNearbyDistrict] = useState('')
  const [nearbyResults, setNearbyResults] = useState<Restaurant[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [newDistrictName, setNewDistrictName] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [editMahalle, setEditMahalle] = useState<{ ilce: string; mahalleler: string[] } | null>(null)
  const [newMahalle, setNewMahalle] = useState('')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [tournamentForm, setTournamentForm] = useState({ title: '', description: '', slot_start: '11:00', slot_end: '14:00', cuisine_filter: '', area_filter: '' })
  const [showTournamentForm, setShowTournamentForm] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  const { toasts, show } = useToasts()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (token) loadData(); return () => {} }, [token])

  const loadData = async () => {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([adminApi.getStats(token), adminApi.getRestaurants(token, 1, 100)])
      setStats(s); setRestaurants(r)
    } catch (err: any) {
      if (err.message?.includes('Unauthorized') || err.status === 401) {
        safeRemoveItem('local', 'fh_admin_token'); setToken(''); show('Oturum süresi doldu', 'err')
      }
    } finally { setLoading(false) }
  }

  const loadCards = async () => {
    try { setCards(await adminApi.getCards(token)) } catch { show('Kartlar yüklenemedi', 'err') }
  }

  const loadDistricts = async () => {
    try { setDistricts(await adminApi.getDistricts(token)) } catch { show('Bölgeler yüklenemedi', 'err') }
  }
  const loadRegions = async () => {
    try { setRegions(await adminApi.getRegions(token)) } catch { show('Bölgeler yüklenemedi', 'err') }
  }
  const loadTournaments = async () => {
    try { setTournaments(await adminApi.getTournaments(token)) } catch { show('Turnuvalar yüklenemedi', 'err') }
  }

  useEffect(() => { if (token && view === 'cards') loadCards() }, [token, view])
  useEffect(() => { if (token && view === 'districts') { loadRegions(); loadDistricts() } }, [token, view])
  useEffect(() => { if (token && view === 'tournaments') loadTournaments() }, [token, view])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { token: tk } = await adminApi.login(password)
      safeSetItem('local', 'fh_admin_token', tk); setToken(tk); setPassword('')
    } catch { show('Hatalı şifre', 'err') }
  }

  const handleLogout = () => { safeRemoveItem('local', 'fh_admin_token'); setToken('') }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu restoranı silmek istediğinize emin misiniz?')) return
    setDeleteLoading(id)
    try { await adminApi.deleteRestaurant(token, id); show('Silindi', 'ok'); loadData() }
    catch { show('Silme başarısız', 'err') }
    finally { setDeleteLoading(null) }
  }

  const handleToggle = async (r: Restaurant) => {
    try {
      await adminApi.updateRestaurant(token, r.id, { ...r, is_active: r.is_active === 1 ? 0 : 1 })
      show('Güncellendi', 'ok'); loadData()
    } catch { show('Güncelleme basarisiz', 'err') }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selected.size === 0) return
    if (!confirm(`${selected.size} restoran üzerinde işlem yapılacak. Emin misiniz?`)) return
    setBulkLoading(true)
    try {
      for (const id of selected) {
        if (action === 'delete') await adminApi.deleteRestaurant(token, id).catch(() => {})
        else await adminApi.updateRestaurant(token, id, { is_active: action === 'activate' ? 1 : 0 } as any).catch(() => {})
      }
      show(`${selected.size} restoran güncellendi`, 'ok')
      setSelected(new Set()); loadData()
    } finally { setBulkLoading(false) }
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      setImportLoading(true)
      try {
        const text = evt.target?.result as string
        let list: Partial<Restaurant>[]
        if (file.name.endsWith('.json')) {
          list = JSON.parse(text)
        } else {
          list = parseCSV(text).map(row => ({
            name: row.name, cuisine: row.cuisine, area: row.area,
            rating: parseFloat(row.rating || '4'), price_level: parseInt(row.price_level || '2'),
            calories_min: parseInt(row.calories_min || '300'), calories_max: parseInt(row.calories_max || '800'),
            is_active: parseInt(row.is_active || '1') as 0 | 1,
          }))
        }
        const result = await adminApi.bulkImport(token, list)
        show(`${result.imported} restoran eklendi`, 'ok'); loadData()
      } catch { show('Import başarısız', 'err') }
      finally { setImportLoading(false) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleNearbySearch = async () => {
    const d = AREA_DISTRICTS.find(x => x.name === nearbyDistrict)
    if (!d) { show('İlçe seçin', 'err'); return }
    setNearbyLoading(true)
    try {
      const { results } = await adminApi.searchByLocation(token, d.lat, d.lng, 3000)
      setNearbyResults(results)
      if (results.length === 0) show('Restoran bulunamadı', 'err')
    } catch { show('Arama başarısız', 'err') }
    finally { setNearbyLoading(false) }
  }

  const handleSaveNearby = async (r: Restaurant) => {
    try {
      await adminApi.createRestaurant(token, { ...r, id: undefined as any, is_active: 1 })
      show(`${r.name} eklendi`, 'ok'); loadData()
    } catch { show('Ekleme başarısız', 'err') }
  }

  const filtered = useMemo(() => {
    let list = restaurants
    if (search) { const q = search.toLowerCase(); list = list.filter(r => (r.name||'').toLowerCase().includes(q) || (r.cuisine||'').toLowerCase().includes(q) || (r.area||'').toLowerCase().includes(q)) }
    if (filterArea) list = list.filter(r => r.area === filterArea)
    if (filterCuisine) list = list.filter(r => r.cuisine === filterCuisine)
    if (filterActive) list = list.filter(r => String(r.is_active) === filterActive)
    if (sortBy === 'name') list = [...list].sort((a,b) => (a.name||'').localeCompare(b.name||''))
    else if (sortBy === 'rating') list = [...list].sort((a,b) => (b.rating||0) - (a.rating||0))
    else list = [...list].sort((a,b) => (b.id||0) - (a.id||0))
    return list
  }, [restaurants, search, filterArea, filterCuisine, filterActive, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  // ─── LOGIN ────
  if (!token) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-brand-card border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-brand-cream">FoodHunt Admin</h1>
          <p className="text-brand-muted text-sm mt-1">Yönetim paneline giriş</p>
        </div>
        <input type="password" placeholder="Admin şifresi" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-brand-surface border border-white/10 rounded-xl text-brand-cream mb-4 focus:border-brand-coral focus:outline-none" />
        <button type="submit" className="w-full py-3 bg-brand-coral text-white rounded-xl font-semibold hover:bg-brand-coral-light transition active:scale-95">Giriş Yap</button>
      </form>
    </div>
  )

  const navItems: { key: typeof view; label: string; icon: JSX.Element }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <I.Grid /> },
    { key: 'restaurants', label: 'Restoranlar', icon: <I.Menu /> },
    { key: 'districts', label: 'Bölgeler', icon: <I.MapPin /> },
    { key: 'tournaments', label: 'Turnuvalar', icon: <I.BarChart /> },
    { key: 'cards', label: 'Kartlar', icon: <I.Sparkles /> },
    { key: 'export', label: 'Export', icon: <I.Download /> },
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-brand-cream flex flex-col">
      <header className="bg-brand-card border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden text-brand-muted"><I.Menu /></button>
          <h1 className="text-lg font-bold">🍽️ FoodHunt Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-surface rounded-lg text-xs text-brand-muted hover:text-white hover:bg-white/10 transition"><I.RefreshCw /> Yenile</button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition"><I.LogOut /> Çıkış</button>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className={`${menuOpen ? 'block' : 'hidden'} sm:block w-48 bg-brand-card border-r border-white/10 p-3 space-y-1 shrink-0`}>
          {navItems.map(n => (
            <button key={n.key} onClick={() => { setView(n.key); setMenuOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition ${view === n.key ? 'bg-brand-coral text-white font-semibold' : 'text-brand-muted hover:bg-white/5 hover:text-white'}`}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && <div className="text-brand-muted text-sm animate-pulse mb-4">Yükleniyor...</div>}

          {/* DASHBOARD */}
          {view === 'dashboard' && stats && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{l:'Toplam Restoran',v:stats.total,c:'text-brand-coral'},{l:'Aktif Restoran',v:stats.active,c:'text-brand-fresh'},{l:'Toplam Kullanıcı',v:stats.users,c:'text-brand-amber'},{l:'Bugün Event',v:stats.todayEvents,c:'text-purple-400'}].map(s=>(
                  <div key={s.l} className="bg-brand-card border border-white/5 rounded-xl p-4"><p className="text-brand-muted text-xs">{s.l}</p><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3">Bölge Dağılımı</h3>
                  {stats.topAreas?.slice(0,10).map(a=>(
                    <div key={a.area} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-sm">{a.area}</span>
                      <div className="flex items-center gap-2"><div className="w-24 h-1.5 bg-brand-surface rounded-full overflow-hidden"><div className="h-full bg-brand-amber rounded-full" style={{width:`${(a.n/(stats.topAreas?.[0]?.n||1))*100}%`}}/></div><span className="text-xs text-brand-muted w-6 text-right">{a.n}</span></div>
                    </div>
                  ))}
                </div>
                <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3">Mutfak Dağılımı</h3>
                  {stats.topCuisines?.slice(0,8).map(c=>(
                    <div key={c.cuisine} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-sm">{c.cuisine}</span>
                      <div className="flex items-center gap-2"><div className="w-24 h-1.5 bg-brand-surface rounded-full overflow-hidden"><div className="h-full bg-brand-coral rounded-full" style={{width:`${(c.n/(stats.topCuisines?.[0]?.n||1))*100}%`}}/></div><span className="text-xs text-brand-muted w-6 text-right">{c.n}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 30 Gün Event Trendi */}
              {stats.dailyTrend && stats.dailyTrend.length > 0 && (
                <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3">Son 30 Gün Event Trendi</h3>
                  <div className="flex items-end gap-[2px] h-28">
                    {stats.dailyTrend.map((d,i)=>{const maxC=Math.max(...stats.dailyTrend.map(x=>x.count),1);return(
                      <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                        <div className="w-full bg-brand-coral/80 rounded-t transition-all hover:bg-brand-coral" style={{height:`${Math.max((d.count/maxC)*100,2)}%`}}/>
                        <div className="absolute -top-6 bg-brand-dark text-brand-cream text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">{d.date.slice(5)} ({d.count})</div>
                      </div>
                    )})}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3">Son Olaylar</h3>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {stats.recentEvents?.slice(0,15).map((e,i)=>(
                      <div key={i} className="flex justify-between py-1.5 border-b border-white/5 last:border-0 text-xs">
                        <span className={e.event_type==='game_complete'?'text-brand-fresh':'text-brand-muted'}>{e.event_type}</span>
                        <span className="text-brand-muted">{e.area||e.game_type||''}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {stats.topWinners && stats.topWinners.length > 0 && (
                  <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                    <h3 className="font-bold text-sm mb-3">En Çok Kazanan</h3>
                    {stats.topWinners.slice(0,5).map((w,i)=>(
                      <div key={w.restaurant_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-sm"><span className="text-brand-amber font-bold mr-2">{i+1}.</span>{w.name}</span>
                        <span className="text-xs text-brand-coral font-bold">{w.wins} galibiyet</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[{l:'Toplam Event',v:stats.totalEvents},{l:'Tamamlama',v:stats.completions},{l:'Deeplink',v:stats.deeplinks}].map(s=>(
                  <div key={s.l} className="bg-brand-card border border-white/5 rounded-xl p-4 text-center"><p className="text-brand-muted text-xs">{s.l}</p><p className="text-xl font-bold">{s.v}</p></div>
                ))}
              </div>
            </div>
          )}

          {/* RESTAURANTS */}
          {view === 'restaurants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <h2 className="text-xl font-bold">Restoranlar ({filtered.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setEditRest(undefined); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-coral text-white rounded-lg text-xs font-semibold hover:bg-brand-coral-light transition"><I.Plus /> Yeni</button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={importLoading} className="flex items-center gap-1.5 px-3 py-2 bg-brand-surface text-brand-muted rounded-lg text-xs hover:bg-white/10 transition disabled:opacity-50"><I.Upload /> {importLoading ? 'Import ediliyor...' : 'Import'}</button>
                  <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleCSVImport} className="hidden" />
                  <a href={adminApi.getExportUrl('restaurants','csv')} target="_blank" className="flex items-center gap-1.5 px-3 py-2 bg-brand-surface text-brand-muted rounded-lg text-xs hover:bg-white/10 transition"><I.Download /> CSV</a>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-2.5 text-brand-muted"><I.Search /></div>
                  <input type="text" placeholder="Ara..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} className="w-full pl-9 pr-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none"/>
                </div>
                <select value={filterArea} onChange={e=>{setFilterArea(e.target.value);setPage(0)}} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="">Tüm Bölgeler</option>{AREAS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
                <select value={filterCuisine} onChange={e=>{setFilterCuisine(e.target.value);setPage(0)}} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="">Tüm Mutfaklar</option>{CUISINES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterActive} onChange={e=>{setFilterActive(e.target.value as any);setPage(0)}} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="">Tüm Durum</option><option value="1">Aktif</option><option value="0">Pasif</option>
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="id">Yeni eklenen</option><option value="name">Ada göre</option><option value="rating">Puana göre</option>
                </select>
              </div>
              {selected.size > 0 && (
                <div className="flex items-center gap-3 bg-brand-coral/10 border border-brand-coral/30 rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold text-brand-coral">{selected.size} seçili</span>
                  <button onClick={()=>handleBulkAction('activate')} disabled={bulkLoading} className="text-xs px-2 py-1 bg-brand-fresh/20 text-brand-fresh rounded hover:bg-brand-fresh/30 disabled:opacity-50">{bulkLoading ? '...' : 'Aktif'}</button>
                  <button onClick={()=>handleBulkAction('deactivate')} disabled={bulkLoading} className="text-xs px-2 py-1 bg-brand-amber/20 text-brand-amber rounded hover:bg-brand-amber/30 disabled:opacity-50">{bulkLoading ? '...' : 'Pasif'}</button>
                  <button onClick={()=>handleBulkAction('delete')} disabled={bulkLoading} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50">{bulkLoading ? '...' : 'Sil'}</button>
                  <button onClick={()=>setSelected(new Set())} className="text-xs text-brand-muted ml-auto">Temizle</button>
                </div>
              )}
              <details className="bg-brand-card border border-white/5 rounded-xl">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold flex items-center gap-2 text-brand-muted hover:text-white"><I.MapPin /> Konumdan Restoran Ekle</summary>
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {AREA_DISTRICTS.map(d=>(<button key={d.name} onClick={()=>setNearbyDistrict(d.name)} className={`px-3 py-1.5 rounded-lg text-xs transition ${nearbyDistrict===d.name?'bg-brand-coral text-white':'bg-brand-surface text-brand-muted hover:bg-white/10'}`}>{d.name}</button>))}
                  </div>
                  <button onClick={handleNearbySearch} disabled={nearbyLoading||!nearbyDistrict} className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light disabled:opacity-50 transition">{nearbyLoading?'Aranıyor...':'Restoranları Getir'}</button>
                  {nearbyResults.length>0&&(<div className="max-h-60 overflow-y-auto space-y-2">{nearbyResults.map((r,i)=>(<div key={i} className="flex items-center justify-between bg-brand-surface rounded-lg px-3 py-2"><div><span className="text-sm font-semibold">{r.name}</span><span className="text-xs text-brand-muted ml-2">{r.cuisine} - {r.area}</span></div><button onClick={()=>handleSaveNearby(r)} className="px-2 py-1 bg-brand-fresh/20 text-brand-fresh text-xs rounded hover:bg-brand-fresh/30">Kaydet</button></div>))}</div>)}
                </div>
              </details>
              <div className="bg-brand-card border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-brand-surface border-b border-white/5"><tr>
                      <th className="px-3 py-3 text-left w-8"><input type="checkbox" checked={paged.length>0&&paged.every(r=>selected.has(r.id))} onChange={e=>{const s=new Set(selected);paged.forEach(r=>e.target.checked?s.add(r.id):s.delete(r.id));setSelected(s)}} className="accent-brand-coral"/></th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs">Restoran</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs hidden md:table-cell">Mutfak</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs hidden md:table-cell">Bölge</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs">Puan</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs hidden sm:table-cell">Fiyat</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs">Durum</th>
                      <th className="px-3 py-3 text-right text-brand-muted text-xs">İşlem</th>
                    </tr></thead>
                    <tbody>{paged.map(r=>(
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                        <td className="px-3 py-2.5"><input type="checkbox" checked={selected.has(r.id)} onChange={e=>{const s=new Set(selected);e.target.checked?s.add(r.id):s.delete(r.id);setSelected(s)}} className="accent-brand-coral"/></td>
                        <td className="px-3 py-2.5"><div className="flex items-center gap-2">{r.image_url&&<img src={r.image_url} alt="" className="w-8 h-8 rounded-lg object-cover"/>}<span className="font-semibold text-brand-cream">{r.name}</span></div></td>
                        <td className="px-3 py-2.5 text-brand-muted hidden md:table-cell">{r.cuisine}</td>
                        <td className="px-3 py-2.5 text-brand-muted hidden md:table-cell">{r.area}</td>
                        <td className="px-3 py-2.5"><span className="flex items-center gap-1 text-brand-amber"><I.Star/>{(r.rating||0).toFixed(1)}</span></td>
                        <td className="px-3 py-2.5 text-brand-muted hidden sm:table-cell">{PRICE_LABELS[r.price_level||2]}</td>
                        <td className="px-3 py-2.5"><button onClick={()=>handleToggle(r)} className={`px-2 py-0.5 rounded text-xs font-semibold transition ${r.is_active===1?'bg-brand-fresh/20 text-brand-fresh':'bg-white/5 text-brand-muted'}`}>{r.is_active===1?'Aktif':'Pasif'}</button></td>
                        <td className="px-3 py-2.5 text-right"><div className="flex items-center justify-end gap-1"><button onClick={()=>{setEditRest(r);setShowForm(true)}} className="p-1.5 text-brand-muted hover:text-brand-coral transition"><I.Edit/></button><button onClick={()=>handleDelete(r.id)} className="p-1.5 text-brand-muted hover:text-red-400 transition"><I.Trash/></button></div></td>
                      </tr>
                    ))}{paged.length===0&&<tr><td colSpan={8} className="px-4 py-8 text-center text-brand-muted">Restoran bulunamadı</td></tr>}</tbody>
                  </table>
                </div>
                {totalPages>1&&(
                  <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                    <span className="text-xs text-brand-muted">Sayfa {page+1} / {totalPages}</span>
                    <div className="flex gap-1">
                      <button onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0} className="px-3 py-1 bg-brand-surface rounded text-xs text-brand-muted hover:bg-white/10 disabled:opacity-30">&larr;</button>
                      <button onClick={()=>setPage(Math.min(totalPages-1,page+1))} disabled={page>=totalPages-1} className="px-3 py-1 bg-brand-surface rounded text-xs text-brand-muted hover:bg-white/10 disabled:opacity-30">&rarr;</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DISTRICTS / REGIONS */}
          {view === 'districts' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Bölge Yönetimi</h2>
              <p className="text-brand-muted text-sm">Turnuvada hangi ilçelerin restoranlarının gösterileceğini buradan yönetebilirsin. Aktif ilçelerdeki restoranlar turnuvada yarışır.</p>

              {/* Region Cards - İlçe Toggle List */}
              <div className="space-y-2">
                {regions.map(r => {
                  const restCount = districts.find(d => d.name === r.ilce)?.count || 0
                  return (
                    <div key={r.ilce} className={`bg-brand-card border rounded-xl overflow-hidden transition ${r.is_active ? 'border-brand-fresh/30' : 'border-white/5'}`}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button onClick={async () => {
                            try { await adminApi.toggleRegion(token, r.ilce, !r.is_active); loadRegions() }
                            catch { show('Güncelleme basarisiz', 'err') }
                          }}
                            className={`w-11 h-6 rounded-full transition relative shrink-0 ${r.is_active ? 'bg-brand-fresh' : 'bg-brand-elevated'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${r.is_active ? 'left-[22px]' : 'left-0.5'}`} />
                          </button>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{r.ilce}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${r.is_active ? 'bg-brand-fresh/20 text-brand-fresh' : 'bg-white/5 text-brand-muted'}`}>
                                {r.is_active ? 'AKTIF' : 'PASIF'}
                              </span>
                            </div>
                            <p className="text-xs text-brand-muted">{r.il} &middot; {restCount} restoran &middot; {(r.mahalleler || []).length} mahalle</p>
                          </div>
                        </div>
                        <button onClick={() => setEditMahalle(editMahalle?.ilce === r.ilce ? null : { ilce: r.ilce, mahalleler: [...(r.mahalleler || [])] })}
                          className="text-xs text-brand-muted hover:text-brand-coral transition px-2 py-1">
                          {editMahalle?.ilce === r.ilce ? 'Kapat' : 'Mahalleler'}
                        </button>
                      </div>
                      {/* Mahalle Editor */}
                      {editMahalle?.ilce === r.ilce && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {(editMahalle.mahalleler || []).map((m, i) => (
                              <span key={i} className="inline-flex items-center gap-1 bg-brand-surface px-2 py-1 rounded-full text-xs text-brand-cream">
                                {m}
                                <button onClick={() => {
                                  const updated = editMahalle.mahalleler.filter((_, j) => j !== i)
                                  setEditMahalle({ ...editMahalle, mahalleler: updated })
                                }} className="text-brand-muted hover:text-red-400 ml-0.5">&times;</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input type="text" placeholder="Yeni mahalle ekle..." value={newMahalle} onChange={e => setNewMahalle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && newMahalle.trim()) { setEditMahalle({ ...editMahalle, mahalleler: [...editMahalle.mahalleler, newMahalle.trim()] }); setNewMahalle('') } }}
                              className="flex-1 px-3 py-1.5 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-xs focus:border-brand-coral focus:outline-none" />
                            <button onClick={() => { if (newMahalle.trim()) { setEditMahalle({ ...editMahalle, mahalleler: [...editMahalle.mahalleler, newMahalle.trim()] }); setNewMahalle('') } }}
                              className="px-3 py-1.5 bg-brand-surface text-brand-muted rounded-lg text-xs hover:bg-white/10">Ekle</button>
                          </div>
                          <button onClick={async () => {
                            try {
                              await adminApi.updateMahalleler(token, editMahalle.ilce, editMahalle.mahalleler)
                              show('Mahalleler güncellendi', 'ok')
                              setEditMahalle(null)
                              loadRegions()
                            } catch { show('Güncelleme basarisiz', 'err') }
                          }}
                            className="px-4 py-1.5 bg-brand-coral text-white rounded-lg text-xs font-semibold hover:bg-brand-coral-light transition">Kaydet</button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {regions.length === 0 && <p className="text-brand-muted text-sm text-center py-4">Bölgeler yükleniyor...</p>}
              </div>
            </div>
          )}

          {/* TOURNAMENTS */}
          {view === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Turnuva Yönetimi</h2>
                <button onClick={() => setShowTournamentForm(!showTournamentForm)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-coral text-white rounded-lg text-xs font-semibold hover:bg-brand-coral-light transition">
                  <I.Plus /> Özel Turnuva
                </button>
              </div>
              {showTournamentForm && (
                <div className="bg-brand-card border border-white/5 rounded-xl p-4 space-y-3">
                  <input type="text" placeholder="Turnuva Başlığı" value={tournamentForm.title} onChange={e => setTournamentForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
                  <textarea placeholder="Açıklama" value={tournamentForm.description} onChange={e => setTournamentForm(p => ({ ...p, description: e.target.value }))} rows={2}
                    className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none resize-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-brand-muted">Başlangıç</label>
                      <input type="time" value={tournamentForm.slot_start} onChange={e => setTournamentForm(p => ({ ...p, slot_start: e.target.value }))}
                        className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-brand-muted">Bitiş</label>
                      <input type="time" value={tournamentForm.slot_end} onChange={e => setTournamentForm(p => ({ ...p, slot_end: e.target.value }))}
                        className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Mutfak Filtresi (isteğe bağlı)" value={tournamentForm.cuisine_filter} onChange={e => setTournamentForm(p => ({ ...p, cuisine_filter: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
                    <input type="text" placeholder="Bölge Filtresi (isteğe bağlı)" value={tournamentForm.area_filter} onChange={e => setTournamentForm(p => ({ ...p, area_filter: e.target.value }))}
                      className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { if (!tournamentForm.title.trim()) { show('Başlık gerekli', 'err'); return }; try { await adminApi.createTournament(token, tournamentForm); show('Turnuva oluşturuldu', 'ok'); setTournamentForm({ title: '', description: '', slot_start: '11:00', slot_end: '14:00', cuisine_filter: '', area_filter: '' }); setShowTournamentForm(false); loadTournaments() } catch { show('Oluşturma başarısız', 'err') } }}
                      className="px-4 py-2 bg-brand-fresh text-white rounded-lg text-sm font-semibold hover:bg-brand-fresh/80 transition">Oluştur</button>
                    <button onClick={() => setShowTournamentForm(false)}
                      className="px-4 py-2 bg-brand-surface text-brand-muted rounded-lg text-sm hover:bg-white/10 transition">İptal</button>
                  </div>
                </div>
              )}
              <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                <h3 className="font-bold text-sm mb-3">Sabit Turnuva Slotları</h3>
                <div className="space-y-2">
                  {SLOT_PRESETS.map(s => (
                    <div key={s.slot} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm font-semibold">{s.label}</span>
                      <span className="text-xs text-brand-muted">{s.start} - {s.end}</span>
                    </div>
                  ))}
                </div>
              </div>
              {tournaments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm">Özel Turnuvalar</h3>
                  {tournaments.map(t => (
                    <div key={t.id} className="bg-brand-card border border-white/5 rounded-xl px-4 py-3">
                      <p className="font-semibold text-sm">{t.title}</p>
                      <p className="text-xs text-brand-muted">{t.slot_start} - {t.slot_end}</p>
                      {t.description && <p className="text-xs text-brand-muted mt-1">{t.description}</p>}
                      <div className="flex gap-2 mt-1">
                        {t.cuisine_filter && <span className="text-xs px-2 py-0.5 bg-brand-coral/20 text-brand-coral-light rounded-full">Mutfak: {t.cuisine_filter}</span>}
                        {t.area_filter && <span className="text-xs px-2 py-0.5 bg-brand-amber/20 text-brand-amber rounded-full">Bölge: {t.area_filter}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tournaments.length === 0 && !showTournamentForm && <p className="text-brand-muted text-sm text-center py-4">Henüz özel turnuva yok</p>}
            </div>
          )}

          {/* CARDS */}
          {view === 'cards' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">İlham Kartları</h2>
              <div className="bg-brand-card border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Emoji" value={newCard.emoji} onChange={e=>setNewCard(p=>({...p,emoji:e.target.value}))} className="w-16 px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-center text-lg focus:border-brand-coral focus:outline-none"/>
                <input type="text" placeholder="Kart metni" value={newCard.text} onChange={e=>setNewCard(p=>({...p,text:e.target.value}))} className="flex-1 px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none"/>
                <select value={newCard.category} onChange={e=>setNewCard(p=>({...p,category:e.target.value}))} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="">Kategori</option><option value="mood">Mood</option><option value="speed">Hız</option><option value="nutrition">Beslenme</option><option value="adventure">Macera</option><option value="social">Sosyal</option><option value="budget">Bütçe</option>
                </select>
                <button onClick={async()=>{if(!newCard.text){show('Metin gerekli','err');return};try{await adminApi.createCard(token,newCard);show('Kart eklendi','ok');setNewCard({text:'',emoji:'',category:''});loadCards()}catch{show('Ekleme başarısız','err')}}} className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light transition"><I.Plus/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cards.map(c=>(
                  <div key={c.id} className="bg-brand-card border border-white/5 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-3xl">{c.emoji||'🍽️'}</span>
                    <div className="flex-1"><p className="text-sm text-brand-cream">{c.text}</p>{c.category&&<span className="text-xs text-brand-muted mt-1 inline-block">{c.category}</span>}</div>
                    <button onClick={async()=>{await adminApi.deleteCard(token,c.id);loadCards()}} className="text-brand-muted hover:text-red-400 transition shrink-0"><I.Trash/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXPORT */}
          {view === 'export' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Veri Export</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-brand-card border border-white/5 rounded-xl p-6 text-center space-y-3">
                  <h3 className="font-bold">Restoran Verisi</h3>
                  <div className="flex gap-2 justify-center">
                    <button onClick={async()=>{try{const d=await adminApi.exportRestaurants(token,'json');const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='restaurants.json';a.click();URL.revokeObjectURL(u);show('JSON indirildi','ok')}catch{show('Export başarısız','err')}}} className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light transition">JSON</button>
                    <button onClick={async()=>{try{const res=await fetch(`/api/admin/restaurants/export?format=csv`,{headers:{Authorization:`Bearer ${token}`}});const text=await res.text();const b=new Blob([text],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='restaurants.csv';a.click();URL.revokeObjectURL(u);show('CSV indirildi','ok')}catch{show('Export başarısız','err')}}} className="px-4 py-2 bg-brand-surface text-brand-muted rounded-lg text-sm hover:bg-white/10 transition">CSV</button>
                  </div>
                </div>
                <div className="bg-brand-card border border-white/5 rounded-xl p-6 text-center space-y-3">
                  <h3 className="font-bold">Event Verisi</h3>
                  <div className="flex gap-2 justify-center">
                    <button onClick={async()=>{try{const d=await adminApi.exportEvents(token,'json');const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='events.json';a.click();URL.revokeObjectURL(u);show('JSON indirildi','ok')}catch{show('Export başarısız','err')}}} className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light transition">JSON</button>
                    <button onClick={async()=>{try{const res=await fetch(`/api/admin/events/export?format=csv`,{headers:{Authorization:`Bearer ${token}`}});const text=await res.text();const b=new Blob([text],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='events.csv';a.click();URL.revokeObjectURL(u);show('CSV indirildi','ok')}catch{show('Export başarısız','err')}}} className="px-4 py-2 bg-brand-surface text-brand-muted rounded-lg text-sm hover:bg-white/10 transition">CSV</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {showForm && <RestForm initial={editRest} token={token} onSave={loadData} onClose={()=>{setShowForm(false);setEditRest(undefined)}} show={show}/>}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t=>(<div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold animate-slide-up ${t.type==='ok'?'bg-brand-fresh':'bg-red-500'}`}>{t.msg}</div>))}
      </div>
    </div>
  )
}
