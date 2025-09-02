document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPackage = urlParams.get('package') || 'starter';
    const period = urlParams.get('period') || 'monthly';

    const paymentSummary = document.getElementById('payment-summary');
    const paymentForm = document.getElementById('payment-form');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');

    const packages = {
        starter: { name: 'Başlangıç', monthly: 1500, yearly: 15000 },
        medium: { name: 'Orta', monthly: 2500, yearly: 25000 },
        professional: { name: 'Profesyonel', monthly: 3500, yearly: 35000 },
        enterprise: { name: 'Kurumsal', monthly: 4500, yearly: 45000 }
    };

    const pkg = packages[selectedPackage];
    const price = period === 'yearly' ? pkg.yearly : pkg.monthly;

    paymentSummary.innerHTML = `
        <h3>${pkg.name} Paketi</h3>
        <p>Abonelik Süresi: <strong>${period === 'yearly' ? 'Yıllık' : 'Aylık'}</strong></p>
        <p>Tutar: <strong>${price.toLocaleString('tr-TR')}₺</strong></p>
        <hr>
    `;

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basit validasyon
        const cardNumber = document.getElementById('card-number').value.replace(/\s+/g, '');
        if (cardNumber.length < 16) {
            show('Kart numarası hatalı', 'error');
            return;
        }

        show('Ödeme işleniyor...', 'info');

        try {
            // Shopier entegrasyonu yerine demo bekleme
            await new Promise(r => setTimeout(r, 1500));
            show('Ödeme başarılı! Yönlendiriliyorsunuz...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
        } catch (err) {
            show('Ödeme sırasında hata oluştu', 'error');
        }
    });

    function show(msg, type='info') {
        notificationText.textContent = msg;
        notification.className = 'notification show ' + type;
        setTimeout(()=>notification.classList.remove('show'), 3000);
    }
});
