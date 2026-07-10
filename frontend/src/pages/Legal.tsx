function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  )
}

interface Props { page: 'kvkk' | 'terms' | 'cookies' }

export default function Legal({ page }: Props) {
  const contents = {
    kvkk: {
      title: 'KVKK Aydınlatma Metni',
      updated: '1 Mart 2026',
      body: `
## Veri Sorumlusu
FoodHunt ("Platform"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmektedir.

## Toplanan Veriler
**Platform kullanımı sırasında aşağıdaki veriler işlenebilir:**
- Konum verisi: Yalnızca yakındaki restoranları listelemek amacıyla, açık rızanız dahilinde kullanılır. Oturum sonunda silinir.
- Anonim kullanım verileri: Oyun başlatma, tamamlama, deeplink tıklama gibi eventi içerir. Kişisel kimlik bilgisi içermez.
- Hesap verisi (isteğe bağlı): E-posta adresi, yalnızca giriş yapan kullanıcılar için saklanır.

## İşleme Amaçları
Veriler yalnızca hizmetin sunulması, iyileştirilmesi ve analitik amaçlarla işlenmektedir.

## Veri Güvenliği
Tüm veriler HTTPS üzerinden iletilir. Kişisel veriler şifrelenerek saklanır. Yalnızca yetkili ekip üyeleri erişebilir.

## Haklarınız
KVKK madde 11 kapsamında: verilerinize erişim, düzeltme, silme, işlemenin kısıtlanması ve itiraz hakkına sahipsiniz.

## İletişim
Talepleriniz için: **privacy@foodhunt.app**
      `
    },
    terms: {
      title: 'Kullanım Şartları',
      updated: '1 Mart 2026',
      body: `
## Kabul
Bu platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.

## Hizmet Kapsamı
FoodHunt, kullanıcıya restoran önerisi sunan bir karar motorudur. Sipariş işlemleri partner platformlara (Yemeksepeti, Getir, Trendyol) yönlendirilerek tamamlanır. FoodHunt, söz konusu platformlar üzerinde gerçekleştirilen işlemlerden sorumlu değildir.

## Kullanım Koşulları
- Platform yalnızca yasal amaçlarla kullanılabilir.
- Otomatik erişim (bot, scraper) yasaktır.
- Platform içeriği ticari amaçla kopyalanamaz.

## Sorumluluk Sınırlaması
FoodHunt, üçüncü parti platformlardaki fiyat, stok veya hizmet bilgilerinin doğruluğunu garanti etmez.

## Değişiklikler
Şartlar önceden bildirim yapılmaksızın güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır.

## İletişim
**hello@foodhunt.app**
      `
    },
    cookies: {
      title: 'Çerez Politikası',
      updated: '1 Mart 2026',
      body: `
## Çerez Kullanımı
FoodHunt, hizmet kalitesini artırmak amacıyla sınırlı çerez kullanır.

## Kullanılan Çerezler

**Zorunlu Çerezler**
- Oturum yönetimi (giriş yapmış kullanıcılar için)
- Dil tercihi

**Analitik Çerezler**
- Google Analytics 4: Anonim kullanım verisi toplar. IP anonimleştirme aktiftir.

## Çerezleri Yönetme
Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin engellenmesi hizmeti olumsuz etkileyebilir.

## İletişim
**privacy@foodhunt.app**
      `
    }
  }

  const { title, updated, body } = contents[page]

  // Simple markdown-like renderer
  const renderBody = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-brand-cream mt-8 mb-3">{line.slice(3)}</h2>
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-brand-cream/90 mt-4 mb-1">{line.slice(2,-2)}</p>
      if (line.startsWith('- ')) return <li key={i} className="text-brand-cream/70 ml-4 mb-1 list-disc">{line.slice(2)}</li>
      if (line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-brand-cream/70 mb-2 leading-relaxed">{line}</p>
    })

  return (
    <div className="min-h-dvh bg-brand-dark p-6 max-w-2xl mx-auto">
      <a href="/" className="inline-flex items-center gap-2 text-brand-cream/50 hover:text-brand-cream/90 transition-colors mb-8 text-sm">
        <ArrowLeftIcon /> Ana sayfaya dön
      </a>
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">{title}</h1>
        <p className="text-sm text-brand-cream/40 mb-8">Son güncelleme: {updated}</p>
        <div className="prose prose-invert max-w-none">
          {renderBody(body)}
        </div>
      </div>
    </div>
  )
}
