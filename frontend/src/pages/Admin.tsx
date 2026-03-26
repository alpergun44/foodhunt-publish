import { useState, useEffect, useRef, useMemo } from 'react'
import { adminApi, Restaurant, AdminStats, safeGetItem, safeSetItem, safeRemoveItem } from '../api'

// ─── Constants ──────────────────────────────────────────────────────────────
const CUISINES = ['Turk Mutfagi','Italyan','Japon','Cin','Meksika','Hint','Fast Food','Deniz Urunleri','Vegan','Kahvalti','Tatlici','Cafe','Kokorec','Doner','Kebap','Pizza','Burger','Sushi','Thai','Kore','Balik','Ev Yemekleri','Meyhane','Sokak Lezzetleri','Diger']
const AREAS = ['Kadikoy','Besiktas','Beyoglu','Sisli','Uskudar','Fatih','Bakirkoy','Atasehir','Maltepe','Sariyer','Diger']
const DISTRICTS = [
  { name: 'Kadikoy', lat: 40.9828, lng: 29.0290 },
  { name: 'Besiktas', lat: 41.0420, lng: 29.0070 },
  { name: 'Beyoglu', lat: 41.0370, lng: 28.9770 },
  { name: 'Sisli', lat: 41.0600, lng: 28.9870 },
  { name: 'Uskudar', lat: 41.0235, lng: 29.0153 },
  { name: 'Fatih', lat: 41.0186, lng: 28.9497 },
  { name: 'Bakirkoy', lat: 40.9800, lng: 28.8720 },
  { name: 'Atasehir', lat: 40.9830, lng: 29.1100 },
  { name: 'Maltepe', lat: 40.9340, lng: 29.1320 },
  { name: 'Sariyer', lat: 41.1670, lng: 29.0500 },
]
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
  })
  const [tagInput, setTagInput] = useState((initial?.tags || []).join(', '))
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(initial?.image_url || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await adminApi.uploadImage(token, file)
      set('image_url', url)
      setImagePreview(url)
      show('Gorsel yuklendi', 'ok')
    } catch { show('Yukleme basarisiz', 'err') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) { show('Restoran adi zorunlu', 'err'); return }
    if (!form.cuisine?.trim()) { show('Mutfak tipi zorunlu', 'err'); return }
    if (!form.area?.trim()) { show('Bolge zorunlu', 'err'); return }
    setLoading(true)
    try {
      const data = { ...form, tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) }
      if (isEdit) {
        await adminApi.updateRestaurant(token, initial!.id!, data)
        show('Restoran guncellendi', 'ok')
      } else {
        await adminApi.createRestaurant(token, data)
        show('Restoran eklendi', 'ok')
      }
      onSave()
      onClose()
    } catch { show('Kaydetme basarisiz', 'err') }
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
          <h3 className="text-lg font-bold text-brand-cream">{isEdit ? 'Restoran Duzenle' : 'Yeni Restoran'}</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-white"><I.X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inp('Restoran Adi *', 'name')}
            <div>
              <label className="block text-xs text-brand-muted mb-1">Mutfak Tipi *</label>
              <select value={form.cuisine || ''} onChange={e => set('cuisine', e.target.value)}
                className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none">
                <option value="">Sec...</option>
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Bolge *</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {DISTRICTS.map(d => (
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
            <label className="block text-xs text-brand-muted mb-1">Aciklama</label>
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
            <label className="block text-xs text-brand-muted mb-1">Gorsel</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-muted text-sm hover:bg-white/10">
                <I.Upload /> Yukle
              </button>
              <input type="text" value={form.image_url || ''} onChange={e => { set('image_url', e.target.value); setImagePreview(e.target.value) }}
                placeholder="veya URL yapistir" className="flex-1 px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-24 rounded-lg object-cover" onError={() => setImagePreview('')} />}
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Etiketler (virgul ile ayir)</label>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="turk, kebap, kadikoy"
              className="w-full px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-brand-cream text-sm focus:border-brand-coral focus:outline-none" />
            {tagInput && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagInput.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-brand-coral/20 text-brand-coral-light rounded-full text-xs">{t}</span>
                ))}
              </div>
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer" onClick={() => set('is_active', form.is_active ? 0 : 1)}>
            <div className={`w-10 h-5 rounded-full transition relative ${form.is_active ? 'bg-brand-fresh' : 'bg-brand-elevated'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-brand-cream">{form.is_active ? 'Aktif' : 'Pasif'}</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-brand-surface text-brand-muted rounded-xl hover:bg-white/10 text-sm font-semibold">Iptal</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-brand-coral text-white rounded-xl hover:bg-brand-coral-light text-sm font-semibold disabled:opacity-50 transition">
              {loading ? 'Kaydediliyor...' : isEdit ? 'Guncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Admin ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [view, setView] = useState<'dashboard' | 'restaurants' | 'cards' | 'export'>('dashboard')
  const [token, setToken] = useState(safeGetItem('local', 'fh_admin_token') || '')
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [search, setSearch] = useState('')
  const [filterArea, setFilterArea] = useState('')
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

  const { toasts, show } = useToasts()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (token) loadData() }, [token])

  const loadData = async () => {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([adminApi.getStats(token), adminApi.getRestaurants(token)])
      setStats(s); setRestaurants(r)
    } catch (err: any) {
      if (err.message?.includes('Unauthorized') || err.status === 401) {
        safeRemoveItem('local', 'fh_admin_token'); setToken(''); show('Oturum suresi doldu', 'err')
      }
    } finally { setLoading(false) }
  }

  const loadCards = async () => {
    try { setCards(await adminApi.getCards(token)) } catch { show('Kartlar yuklenemedi', 'err') }
  }

  useEffect(() => { if (token && view === 'cards') loadCards() }, [token, view])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { token: tk } = await adminApi.login(password)
      safeSetItem('local', 'fh_admin_token', tk); setToken(tk); setPassword('')
    } catch { show('Hatali sifre', 'err') }
  }

  const handleLogout = () => { safeRemoveItem('local', 'fh_admin_token'); setToken('') }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu restorani silmek istediginize emin misiniz?')) return
    try { await adminApi.deleteRestaurant(token, id); show('Silindi', 'ok'); loadData() }
    catch { show('Silme basarisiz', 'err') }
  }

  const handleToggle = async (r: Restaurant) => {
    try {
      await adminApi.updateRestaurant(token, r.id, { ...r, is_active: r.is_active === 1 ? 0 : 1 })
      show('Guncellendi', 'ok'); loadData()
    } catch { show('Guncelleme basarisiz', 'err') }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selected.size === 0) return
    if (!confirm(`${selected.size} restoran uzerinde islem yapilacak. Emin misiniz?`)) return
    for (const id of selected) {
      if (action === 'delete') await adminApi.deleteRestaurant(token, id).catch(() => {})
      else await adminApi.updateRestaurant(token, id, { is_active: action === 'activate' ? 1 : 0 } as any).catch(() => {})
    }
    show(`${selected.size} restoran guncellendi`, 'ok')
    setSelected(new Set()); loadData()
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
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
      } catch { show('Import basarisiz', 'err') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleNearbySearch = async () => {
    const d = DISTRICTS.find(x => x.name === nearbyDistrict)
    if (!d) { show('Ilce secin', 'err'); return }
    setNearbyLoading(true)
    try {
      const { results } = await adminApi.searchByLocation(token, d.lat, d.lng, 3000)
      setNearbyResults(results)
      if (results.length === 0) show('Restoran bulunamadi', 'err')
    } catch { show('Arama basarisiz', 'err') }
    finally { setNearbyLoading(false) }
  }

  const handleSaveNearby = async (r: Restaurant) => {
    try {
      await adminApi.createRestaurant(token, { ...r, id: undefined as any, is_active: 1 })
      show(`${r.name} eklendi`, 'ok'); loadData()
    } catch { show('Ekleme basarisiz', 'err') }
  }

  const filtered = useMemo(() => {
    let list = restaurants
    if (search) { const q = search.toLowerCase(); list = list.filter(r => (r.name||'').toLowerCase().includes(q) || (r.cuisine||'').toLowerCase().includes(q)) }
    if (filterArea) list = list.filter(r => r.area === filterArea)
    if (filterActive) list = list.filter(r => String(r.is_active) === filterActive)
    if (sortBy === 'name') list = [...list].sort((a,b) => (a.name||'').localeCompare(b.name||''))
    else if (sortBy === 'rating') list = [...list].sort((a,b) => (b.rating||0) - (a.rating||0))
    else list = [...list].sort((a,b) => (b.id||0) - (a.id||0))
    return list
  }, [restaurants, search, filterArea, filterActive, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  // ─── LOGIN ────
  if (!token) return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-brand-card border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-brand-cream">FoodHunt Admin</h1>
          <p className="text-brand-muted text-sm mt-1">Yonetim paneline giris</p>
        </div>
        <input type="password" placeholder="Admin sifresi" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-brand-surface border border-white/10 rounded-xl text-brand-cream mb-4 focus:border-brand-coral focus:outline-none" />
        <button type="submit" className="w-full py-3 bg-brand-coral text-white rounded-xl font-semibold hover:bg-brand-coral-light transition active:scale-95">Giris Yap</button>
      </form>
    </div>
  )

  const navItems: { key: typeof view; label: string; icon: JSX.Element }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <I.Grid /> },
    { key: 'restaurants', label: 'Restoranlar', icon: <I.Menu /> },
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
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition"><I.LogOut /> Cikis</button>
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
          {loading && <div className="text-brand-muted text-sm animate-pulse mb-4">Yukleniyor...</div>}

          {/* DASHBOARD */}
          {view === 'dashboard' && stats && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{l:'Toplam Restoran',v:stats.total,c:'text-brand-coral'},{l:'Aktif',v:stats.active,c:'text-brand-fresh'},{l:'Bolge',v:stats.areas,c:'text-brand-amber'},{l:'Bugun Event',v:stats.todayEvents,c:'text-purple-400'}].map(s=>(
                  <div key={s.l} className="bg-brand-card border border-white/5 rounded-xl p-4"><p className="text-brand-muted text-xs">{s.l}</p><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3">Mutfak Dagilimi</h3>
                  {stats.topCuisines?.slice(0,8).map(c=>(
                    <div key={c.cuisine} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-sm">{c.cuisine}</span>
                      <div className="flex items-center gap-2"><div className="w-24 h-1.5 bg-brand-surface rounded-full overflow-hidden"><div className="h-full bg-brand-coral rounded-full" style={{width:`${(c.n/(stats.topCuisines?.[0]?.n||1))*100}%`}}/></div><span className="text-xs text-brand-muted w-6 text-right">{c.n}</span></div>
                    </div>
                  ))}
                </div>
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
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[{l:'Toplam Event',v:stats.totalEvents},{l:'Tamamlama',v:stats.completions},{l:'Deeplink',v:stats.deeplinks}].map(s=>(
                  <div key={s.l} className="bg-brand-card border border-white/5 rounded-xl p-4 text-center"><p className="text-brand-muted text-xs">{s.l}</p><p className="text-xl font-bold">{s.v}</p></div>
                ))}
              </div>
              {stats.topWinners && stats.topWinners.length > 0 && (
                <div className="bg-brand-card border border-white/5 rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3">En Cok Kazanan</h3>
                  {stats.topWinners.slice(0,5).map((w,i)=>(
                    <div key={w.restaurant_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm"><span className="text-brand-amber font-bold mr-2">{i+1}.</span>{w.name}</span>
                      <span className="text-xs text-brand-coral font-bold">{w.wins} galibiyet</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESTAURANTS */}
          {view === 'restaurants' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <h2 className="text-xl font-bold">Restoranlar ({filtered.length})</h2>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setEditRest(undefined); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-coral text-white rounded-lg text-xs font-semibold hover:bg-brand-coral-light transition"><I.Plus /> Yeni</button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 bg-brand-surface text-brand-muted rounded-lg text-xs hover:bg-white/10 transition"><I.Upload /> Import</button>
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
                  <option value="">Tum Bolgeler</option>{AREAS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
                <select value={filterActive} onChange={e=>{setFilterActive(e.target.value as any);setPage(0)}} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="">Tum Durum</option><option value="1">Aktif</option><option value="0">Pasif</option>
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="id">Yeni eklenen</option><option value="name">Ada gore</option><option value="rating">Puana gore</option>
                </select>
              </div>
              {selected.size > 0 && (
                <div className="flex items-center gap-3 bg-brand-coral/10 border border-brand-coral/30 rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold text-brand-coral">{selected.size} secili</span>
                  <button onClick={()=>handleBulkAction('activate')} className="text-xs px-2 py-1 bg-brand-fresh/20 text-brand-fresh rounded hover:bg-brand-fresh/30">Aktif</button>
                  <button onClick={()=>handleBulkAction('deactivate')} className="text-xs px-2 py-1 bg-brand-amber/20 text-brand-amber rounded hover:bg-brand-amber/30">Pasif</button>
                  <button onClick={()=>handleBulkAction('delete')} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Sil</button>
                  <button onClick={()=>setSelected(new Set())} className="text-xs text-brand-muted ml-auto">Temizle</button>
                </div>
              )}
              <details className="bg-brand-card border border-white/5 rounded-xl">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold flex items-center gap-2 text-brand-muted hover:text-white"><I.MapPin /> Konumdan Restoran Ekle</summary>
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {DISTRICTS.map(d=>(<button key={d.name} onClick={()=>setNearbyDistrict(d.name)} className={`px-3 py-1.5 rounded-lg text-xs transition ${nearbyDistrict===d.name?'bg-brand-coral text-white':'bg-brand-surface text-brand-muted hover:bg-white/10'}`}>{d.name}</button>))}
                  </div>
                  <button onClick={handleNearbySearch} disabled={nearbyLoading||!nearbyDistrict} className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light disabled:opacity-50 transition">{nearbyLoading?'Araniyor...':'Restoranlari Getir'}</button>
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
                      <th className="px-3 py-3 text-left text-brand-muted text-xs hidden md:table-cell">Bolge</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs">Puan</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs hidden sm:table-cell">Fiyat</th>
                      <th className="px-3 py-3 text-left text-brand-muted text-xs">Durum</th>
                      <th className="px-3 py-3 text-right text-brand-muted text-xs">Islem</th>
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
                    ))}{paged.length===0&&<tr><td colSpan={8} className="px-4 py-8 text-center text-brand-muted">Restoran bulunamadi</td></tr>}</tbody>
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

          {/* CARDS */}
          {view === 'cards' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Ilham Kartlari</h2>
              <div className="bg-brand-card border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Emoji" value={newCard.emoji} onChange={e=>setNewCard(p=>({...p,emoji:e.target.value}))} className="w-16 px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-center text-lg focus:border-brand-coral focus:outline-none"/>
                <input type="text" placeholder="Kart metni" value={newCard.text} onChange={e=>setNewCard(p=>({...p,text:e.target.value}))} className="flex-1 px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none"/>
                <select value={newCard.category} onChange={e=>setNewCard(p=>({...p,category:e.target.value}))} className="px-3 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-brand-cream focus:border-brand-coral focus:outline-none">
                  <option value="">Kategori</option><option value="mood">Mood</option><option value="speed">Hiz</option><option value="nutrition">Beslenme</option><option value="adventure">Macera</option><option value="social">Sosyal</option><option value="budget">Butce</option>
                </select>
                <button onClick={async()=>{if(!newCard.text){show('Metin gerekli','err');return};try{await adminApi.createCard(token,newCard);show('Kart eklendi','ok');setNewCard({text:'',emoji:'',category:''});loadCards()}catch{show('Ekleme basarisiz','err')}}} className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light transition"><I.Plus/></button>
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
                    <a href={adminApi.getExportUrl('restaurants','json')} target="_blank" className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light transition">JSON</a>
                    <a href={adminApi.getExportUrl('restaurants','csv')} target="_blank" className="px-4 py-2 bg-brand-surface text-brand-muted rounded-lg text-sm hover:bg-white/10 transition">CSV</a>
                  </div>
                </div>
                <div className="bg-brand-card border border-white/5 rounded-xl p-6 text-center space-y-3">
                  <h3 className="font-bold">Event Verisi</h3>
                  <div className="flex gap-2 justify-center">
                    <a href={adminApi.getExportUrl('events','json')} target="_blank" className="px-4 py-2 bg-brand-coral text-white rounded-lg text-sm font-semibold hover:bg-brand-coral-light transition">JSON</a>
                    <a href={adminApi.getExportUrl('events','csv')} target="_blank" className="px-4 py-2 bg-brand-surface text-brand-muted rounded-lg text-sm hover:bg-white/10 transition">CSV</a>
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
