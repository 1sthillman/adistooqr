# ADİSTOW QR Menü Sistemi - Ürün Özellik Dokümanı

## Genel Bakış

ADİSTOW QR Menü Sistemi, restoranlara özel geliştirilmiş tam kapsamlı bir dijital menü ve sipariş yönetim sistemidir. Müşterilerin masadaki QR kodu okutarak menüye erişmesini, sipariş vermesini, garson çağırmasını ve hatta köz istemesini sağlayan modern bir çözümdür.

## Paket ve Fiyatlandırma Yapısı

ADİSTOW QR Menü Sistemi dört farklı paket seçeneği sunmaktadır:

### Başlangıç Paketi
- **Aylık:** 1.500₺
- **Yıllık:** 15.000₺ (%38 indirimli)
- **Masa Kapasitesi:** 10 masa
- **Özellikler:**
  - QR Kod oluşturma (masa bazlı)
  - Menü sistemi
  - Müşteri siparişleri
  - Garson çağırma
  - Köz isteme
  - Mobil uyumlu arayüz

### Orta Paket
- **Aylık:** 2.500₺
- **Yıllık:** 25.000₺ (%40 indirimli)
- **Masa Kapasitesi:** 25 masa
- **Özellikler:**
  - Başlangıç paketi tüm özellikleri
  - Özel tasarım desteği
  - Gelişmiş raporlama

### Profesyonel Paket
- **Aylık:** 3.500₺
- **Yıllık:** 35.000₺ (%42 indirimli)
- **Masa Kapasitesi:** 50 masa
- **Özellikler:**
  - Orta paket tüm özellikleri
  - 7/24 teknik destek
  - Özel entegrasyonlar
  - Detaylı analitik raporlar

### Kurumsal Paket
- **Aylık:** 4.500₺
- **Yıllık:** 45.000₺ (%46 indirimli)
- **Masa Kapasitesi:** 80 masa
- **Özellikler:**
  - Profesyonel paket tüm özellikleri
  - 7/24 öncelikli destek
  - Özel entegrasyon desteği
  - Çoklu şube yönetimi
  - Özelleştirilmiş gelişmiş raporlar

## Teknik Özellikler

### 1. Sistem Mimarisi
- Frontend: HTML, CSS, JavaScript (GitHub Pages üzerinde barındırma)
- Backend: Supabase (veritabanı, gerçek zamanlı güncellemeler, oturum yönetimi)
- Ödeme Sistemi: Shopier API entegrasyonu
- Kimlik Doğrulama: Restaurant ID tabanlı sistem

### 2. QR Kod Sistemi
- Her masa için benzersiz QR kod üretimi
- Restoran ID ve masa numarası ile parametreli URL yapısı
- Dinamik QR kod içeriği güncelleme

### 3. Müşteri Arayüzü Özellikleri
- **Menü Görüntüleme**
  - Kategori bazlı filtreleme
  - Ürün arama
  - Ürün detayları ve görseller
  - Fiyat gösterimi

- **Sipariş Oluşturma**
  - Ürün seçimi ve özelleştirme (porsiyon, acı seviyesi, vb.)
  - Sepete ekleme/çıkarma
  - Özel notlar ekleme
  - Sipariş onaylama

- **Yardımcı Fonksiyonlar**
  - Garson çağırma
  - Köz isteme
  - Masa değişikliği talebi
  - Hesap isteme

### 4. Restoran Yönetim Paneli
- **Menü Yönetimi**
  - Kategori oluşturma/düzenleme/silme
  - Ürün ekleme/düzenleme/silme
  - Fiyat güncelleme
  - Günlük/özel menüler

- **Sipariş Takibi**
  - Gerçek zamanlı sipariş bildirimleri
  - Sipariş durumu güncelleme (beklemede, hazırlanıyor, servis edildi)
  - Masa bazlı sipariş görüntüleme
  - Toplam ve detaylı hesap oluşturma

- **Çağrı Yönetimi**
  - Garson çağrı bildirimleri
  - Köz isteklerinin takibi
  - Çağrı geçmişi

- **Analitik ve Raporlama**
  - Günlük/haftalık/aylık satış raporları
  - En çok satılan ürünler
  - Ortalama sipariş değeri
  - Doluluk oranları

### 5. Abonelik Yönetimi
- Abonelik durumu kontrolü
- Ödeme takibi
- Paket yükseltme/düşürme
- Otomatik fatura oluşturma

## Güvenlik Özellikleri
- SSL şifreleme
- Güvenli ödeme altyapısı (Shopier)
- Veri şifreleme
- Yetkilendirme ve kimlik doğrulama

## Ödeme Sistemi
- Shopier API entegrasyonu
- Güvenli ödeme işleme
- Restaurant ID bazlı sipariş takibi
- Ödeme durumu bildirimleri

## Kullanım Senaryoları

### Restoran Perspektifi
1. **Kayıt ve Kurulum**
   - Restoran ADİSTOW sistemine kaydolur
   - Restaurant ID alır
   - Paket seçimi yapar ve ödeme gerçekleştirir
   - Menüsünü yükler ve düzenler
   - Masalarına özel QR kodları alır ve yerleştirir

2. **Günlük Operasyon**
   - Gelen siparişleri takip eder
   - Garson ve köz çağrılarını yönetir
   - Sipariş durumlarını günceller
   - Günün sonunda satış raporlarını inceler

### Müşteri Perspektifi
1. **Menüye Erişim**
   - Masadaki QR kodu telefonla tarar
   - Restoran menüsüne erişir
   - Kategorilere göre ürünleri görüntüler

2. **Sipariş Verme**
   - İstediği ürünleri seçer ve özelleştirir
   - Sepete ekler
   - Siparişi onaylar

3. **Ek İşlemler**
   - Garson çağırır
   - Köz ister
   - Hesap talep eder

## Gelecek Özellikler ve Geliştirmeler
- Online ödeme entegrasyonu
- Müşteri sadakat programı
  - Puan toplama
  - Özel kampanyalar
- Çoklu dil desteği
- Sosyal medya entegrasyonu
  - Yemek paylaşımı
  - Restoran değerlendirmesi
- Gelişmiş istatistikler ve AI destekli öneriler

## Teknik Gereksinimler

### Restoran İçin
- İnternet bağlantısı
- Tablet/telefon/bilgisayar (yönetim paneline erişim için)
- QR kodları yazdırma imkanı

### Müşteriler İçin
- QR kod okuyabilen akıllı telefon
- İnternet bağlantısı

## Restaurant ID Sistemi

ADİSTOW sisteminin merkezi özelliklerinden biri olan Restaurant ID sistemi:
- Her restoran için benzersiz bir kimlik oluşturur
- Siparişlerin doğru restorana iletilmesini sağlar
- Abonelik durumunun kontrolünü yapar
- QR kodlar ve sipariş sistemleri arasında bağlantı kurar

## Sonuç

ADİSTOW QR Menü Sistemi, modern restoran işletmeleri için gerekli tüm dijital çözümleri tek bir platformda birleştiren kapsamlı bir sistemdir. Müşteri deneyimini iyileştirirken, restoran operasyonlarını da optimize eder. Farklı büyüklükteki işletmelere uygun paket seçenekleri ve ölçeklenebilir yapısı ile her türlü restoranın ihtiyaçlarına cevap verebilmektedir.
