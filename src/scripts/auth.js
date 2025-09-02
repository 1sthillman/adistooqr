document.addEventListener('DOMContentLoaded', () => {
    // DOM elementlerini seçme
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    // URL'den parametreleri alma
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPackage = urlParams.get('package');

    // Şifre görünürlüğünü değiştirme
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const passwordInput = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Giriş formunu işleme
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const restaurantId = document.getElementById('restaurant-id').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember').checked;
            
            try {
                // Form validasyonu
                if (!restaurantId || !password) {
                    showNotification('Lütfen tüm alanları doldurun', 'error');
                    return;
                }
                
                // Gerçek projede Supabase ile kimlik doğrulama yapılacak
                console.log('Giriş yapılıyor:', { restaurantId, password, rememberMe });
                
                // Başarılı giriş
                showNotification('Giriş başarılı, yönlendiriliyorsunuz...', 'success');
                
                // Yönetim paneline yönlendirme (3 saniyelik gecikme ile)
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                console.error('Giriş sırasında hata:', error);
                showNotification('Giriş sırasında bir hata oluştu', 'error');
            }
        });
    }

    // Kayıt formunu işleme
    if (registerForm) {
        // URL'den seçilen paketi ayarla
        if (selectedPackage) {
            const packageRadio = document.getElementById(`package-${selectedPackage}`);
            if (packageRadio) {
                packageRadio.checked = true;
            }
        }
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const restaurantName = document.getElementById('restaurant-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAccepted = document.getElementById('terms').checked;
            
            // Seçilen paket ve abonelik süresi
            const selectedPackage = document.querySelector('input[name="package"]:checked').value;
            const subscriptionPeriod = document.querySelector('input[name="subscription-period"]:checked').value;
            
            try {
                // Form validasyonu
                if (!restaurantName || !email || !phone || !password || !confirmPassword) {
                    showNotification('Lütfen tüm alanları doldurun', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showNotification('Şifreler eşleşmiyor', 'error');
                    return;
                }
                
                if (password.length < 8) {
                    showNotification('Şifre en az 8 karakter olmalıdır', 'error');
                    return;
                }
                
                if (!termsAccepted) {
                    showNotification('Kullanım şartlarını kabul etmelisiniz', 'error');
                    return;
                }
                
                // Gerçek projede Supabase ile kayıt işlemi yapılacak
                console.log('Kayıt yapılıyor:', { 
                    restaurantName, 
                    email, 
                    phone, 
                    password, 
                    selectedPackage, 
                    subscriptionPeriod 
                });
                
                // Başarılı kayıt
                showNotification('Kayıt başarılı, ödeme sayfasına yönlendiriliyorsunuz...', 'success');
                
                // Ödeme sayfasına yönlendirme (3 saniyelik gecikme ile)
                setTimeout(() => {
                    window.location.href = 'payment.html?package=' + selectedPackage + '&period=' + subscriptionPeriod;
                }, 1500);
            } catch (error) {
                console.error('Kayıt sırasında hata:', error);
                showNotification('Kayıt sırasında bir hata oluştu', 'error');
            }
        });
    }

    // Bildirim gösterme
    function showNotification(message, type = 'info') {
        const notificationIcon = notification.querySelector('.notification-icon i');
        
        // Icon ve renk ayarla
        notificationIcon.className = '';
        notification.classList.remove('success', 'error', 'warning');
        
        switch (type) {
            case 'success':
                notificationIcon.className = 'fas fa-check-circle';
                notification.classList.add('success');
                break;
            case 'error':
                notificationIcon.className = 'fas fa-times-circle';
                notification.classList.add('error');
                break;
            case 'warning':
                notificationIcon.className = 'fas fa-exclamation-triangle';
                notification.classList.add('warning');
                break;
            default:
                notificationIcon.className = 'fas fa-info-circle';
                break;
        }
        
        // Mesajı ayarla
        notificationText.textContent = message;
        
        // Göster
        notification.classList.add('show');
        
        // Otomatik kapat
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
