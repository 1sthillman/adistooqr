document.addEventListener('DOMContentLoaded', () => {
    // URL'den parametreleri alma
    const urlParams = new URLSearchParams(window.location.search);
    // URL parametrelerini okuma (hem 'restaurant' hem 'restaurant_id' parametreleri destekleniyor)
    const restaurantId = urlParams.get('restaurant') || urlParams.get('restaurant_id');
    const tableId = urlParams.get('table') || urlParams.get('table_id');
    if (!restaurantId || !tableId) {
        showNotification('Restaurant veya masa ID bulunamadı', 'error');
        return;
    }

    // Menü verisi (Gerçek projede Supabase'den çekilecek)
    let menuData = [];
    let cartItems = [];
    let categories = [];

    // DOM elementlerini seçme
    const tableNumberElement = document.getElementById('table-number');
    const menuItemsContainer = document.querySelector('.menu-items');
    const categoriesContainer = document.querySelector('.categories-scroll');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const placeOrderButton = document.getElementById('place-order');
    const menuSearchInput = document.getElementById('menu-search');
    const callWaiterButton = document.getElementById('call-waiter');
    const requestCoalButton = document.getElementById('request-coal');
    const clearCartButton = document.getElementById('clear-cart');
    const openCartButton = document.getElementById('open-cart');
    const closeCartButton = document.getElementById('close-cart');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartContainer = document.querySelector('.cart-container');
    const cartItemCount = document.getElementById('cart-item-count');

    // Modal elementleri
    const productModal = document.getElementById('product-modal');
    const orderModal = document.getElementById('order-modal');
    const successModal = document.getElementById('success-modal');
    const modalProductTitle = document.getElementById('modal-product-title');
    const modalProductImage = document.getElementById('modal-product-image');
    const modalProductDescription = document.getElementById('modal-product-description');
    const modalProductPrice = document.getElementById('modal-product-price');
    const productQuantityInput = document.getElementById('product-quantity');
    const productNoteInput = document.getElementById('product-note');
    const addToCartButton = document.getElementById('add-to-cart');
    const decreaseQuantityButton = document.getElementById('decrease-quantity');
    const increaseQuantityButton = document.getElementById('increase-quantity');
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalPrice = document.getElementById('order-total-price');
    const confirmOrderButton = document.getElementById('confirm-order');
    const cancelOrderButton = document.getElementById('cancel-order');
    const closeSuccessButton = document.getElementById('close-success');
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const orderNoteText = document.getElementById('order-note-text');

    // Seçim takibi için değişkenler
    let currentProduct = null;
    let selectedDynamicOptions = {}; // dynamic options only

    // Başlangıç değerlerini ayarlama (element mevcutsa)
    if (tableNumberElement) {
        tableNumberElement.textContent = tableId;
    }

    // Restaurant bilgilerini yükleme (Supabase’den çekilecek)
    const loadRestaurantInfo = async () => {
        try {
            const restaurantInfo = await supabaseModule.restaurant.getRestaurantInfo(restaurantId);
            const { name, address, logo_url } = restaurantInfo;
            const nameEl = document.getElementById('restaurant-name');
            if (nameEl) nameEl.textContent = name;
            const descEl = document.getElementById('restaurant-description');
            if (descEl) descEl.textContent = address || '';
            const logoEl = document.getElementById('restaurant-logo');
            if (logoEl) logoEl.src = logo_url || 'https://via.placeholder.com/100';
        } catch (err) {
            console.error('Restaurant bilgileri yüklenirken hata oluştu:', err);
            showNotification('Restoran bilgileri alınamadı', 'error');
        }
    };

    // Menüyü doğrudan Supabase ürünü tablosundan yükleyen fonksiyon
    const loadMenu = async () => {
        try {
            // Supabase module ile ürünleri getirme
            const items = await supabaseModule.menu.getMenuItems(restaurantId);
            
            menuData = items.map(item => ({
                id: item.id,
                title: item.name,
                description: item.description,
                price: item.price,
                category: item.categories && item.categories.name ? item.categories.name : '',
                image: item.image_url,
                options: (() => {
                    const optsField = item.options;
                    if (Array.isArray(optsField)) {
                        return optsField;
                    } else if (typeof optsField === 'string' && optsField.trim().startsWith('[')) {
                        try { return JSON.parse(optsField); } catch {};
                    } else if (typeof optsField === 'string') {
                        return optsField.split(',').map(o => o.trim()).filter(Boolean);
                    }
                    return [];
                })()
            }));
            categories = [...new Set(menuData.map(i => i.category))];
            renderCategories();
            renderMenuItems(menuData);
        } catch (err) {
            console.error('Menü yüklenirken hata oluştu:', err);
            showNotification('Menü yüklenirken bir hata oluştu', 'error');
        }
    };

    // Kategorileri render etme
    const renderCategories = () => {
        // "Tümü" kategorisi zaten HTML'de mevcut
        categories.forEach(category => {
            const categoryBtn = document.createElement('button');
            categoryBtn.className = 'category-btn';
            categoryBtn.textContent = category;
            categoryBtn.dataset.category = category;
            categoryBtn.addEventListener('click', () => filterByCategory(category));
            categoriesContainer.appendChild(categoryBtn);
        });
    };

    // Menü öğelerini render etme
    const renderMenuItems = (items) => {
        menuItemsContainer.innerHTML = '';
        
        if (items.length === 0) {
            const noItemsElement = document.createElement('div');
            noItemsElement.className = 'no-items';
            noItemsElement.textContent = 'Aradığınız kriterlere uygun ürün bulunamadı.';
            menuItemsContainer.appendChild(noItemsElement);
            return;
        }
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.title}">
                </div>
                <div class="menu-item-details">
                    <div class="menu-item-header">
                        <h3 class="menu-item-title">${item.title}</h3>
                        <span class="menu-item-price">${item.price.toFixed(2)}₺</span>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <button class="add-item-btn">Sepete Ekle</button>
                </div>
            `;
            
            menuItem.addEventListener('click', () => openProductModal(item));
            menuItemsContainer.appendChild(menuItem);
        });
    };

    // Kategori ile filtreleme
    const filterByCategory = (category) => {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category || (category === 'all' && btn.dataset.category === 'all')) {
                btn.classList.add('active');
            }
        });

        const filteredItems = category === 'all' 
            ? menuData 
            : menuData.filter(item => item.category === category);
        
        renderMenuItems(filteredItems);
    };

    // Arama fonksiyonu
    const searchMenu = (query) => {
        const searchQuery = query.toLowerCase().trim();
        if (searchQuery === '') {
            renderMenuItems(menuData);
            return;
        }

        const filteredItems = menuData.filter(item => 
            item.title.toLowerCase().includes(searchQuery) || 
            item.description.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(searchQuery)
        );
        
        renderMenuItems(filteredItems);
    };

    // Ürün modalını açma
    const openProductModal = async (product) => {
        currentProduct = product;
        selectedDynamicOptions = {};
        
        // Modal içeriğini güncelle
        modalProductTitle.textContent = product.title;
        if (modalProductImage) modalProductImage.src = product.image || '../assets/images/menu/placeholder.jpg';
        modalProductDescription.textContent = product.description;
        modalProductPrice.textContent = `${product.price.toFixed(2)}₺`;
        productQuantityInput.value = 1;
        productNoteInput.value = '';
        
        // Ürün tablosundaki options alanından seçenekleri oluştur
        const dynamicOptionsContainer = document.getElementById('dynamic-options');
        dynamicOptionsContainer.innerHTML = '';
        if (Array.isArray(product.options) && product.options.length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'option-group';
            const title = document.createElement('h3');
            title.textContent = 'Seçenekler';
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'option-buttons';
            selectedDynamicOptions = {};
            product.options.forEach(val => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = val;
                btn.dataset.value = val;
                btn.addEventListener('click', () => {
                    buttonsDiv.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedDynamicOptions[val] = val;
                });
                buttonsDiv.appendChild(btn);
            });
            groupDiv.appendChild(title);
            groupDiv.appendChild(buttonsDiv);
            dynamicOptionsContainer.appendChild(groupDiv);
            // Varsayılan olarak hiçbir seçenek seçilmemiş olacak
            // Kullanıcının manuel olarak seçmesi gerekiyor
        }
        
        // Modalı göster
        productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    // Modalları kapatma
    const closeModals = () => {
        productModal.style.display = 'none';
        orderModal.style.display = 'none';
        successModal.style.display = 'none';
        document.body.style.overflow = '';
    };

    // Sepete öğe ekleme
    const addToCart = () => {
        if (!currentProduct) return;
        const quantity = parseInt(productQuantityInput.value);
        const notes = productNoteInput.value.trim();
        // Dinamik seçenek fiyat eklemeleri
        let priceAddition = 0;
        const selectedOptions = [];
        
        // Seçeneklerin olup olmadığını kontrol et
        const dynamicOptionsContainer = document.getElementById('dynamic-options');
        const hasOptions = dynamicOptionsContainer && dynamicOptionsContainer.children.length > 0;
        const hasSelectedOptions = Object.keys(selectedDynamicOptions).length > 0;
        
        // Artık seçenek seçmek zorunlu değil, kullanıcı seçenek olmadan da devam edebilir
        
        for (const key in selectedDynamicOptions) {
            const val = selectedDynamicOptions[key];
            selectedOptions.push(val.value || val);
            priceAddition += val.price || 0;
        }
        const totalPrice = (currentProduct.price + priceAddition) * quantity;
        
        // Sepet öğesi oluştur
        const cartItem = {
            id: Date.now(), // Benzersiz bir ID
            productId: currentProduct.id,
            title: currentProduct.title,
            price: currentProduct.price,
            options: selectedOptions,
            optionsPrice: priceAddition,
            quantity: quantity,
            notes: notes,
            totalPrice: totalPrice
        };
        
        // Sepete ekle
        cartItems.push(cartItem);
        
        // Sepeti güncelle
        updateCart();
        
        // Modal kapat
        closeModals();
        
        // Bildirim göster
        showNotification(`${currentProduct.title} sepete eklendi!`, 'success');
    };

    // Sepeti güncelleme
    const updateCart = () => {
        // Sepetteki ürün sayısını güncelle (mobil için)
        if (cartItemCount) {
            cartItemCount.textContent = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        }
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Sepetiniz boş</p>
                </div>
            `;
            placeOrderButton.disabled = true;
            return;
        }
        
        placeOrderButton.disabled = false;
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            // Seçilen dinamik seçenekler ve notlar
            const optionsText = (item.options && item.options.length) ? item.options.join(', ') : '';
            const notesText = item.notes ? `<br>Not: ${item.notes}` : '';
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.totalPrice.toFixed(2)}₺</div>
                    </div>
                    <div class="cart-item-options">
                        ${optionsText}${notesText}
                    </div>
                    <div class="cart-item-quantity">
                        <div>
                            <button class="decrease-cart-quantity" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="increase-cart-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">×</button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
            total += item.totalPrice;
        });
        
        // Sepetteki butonlara event listener ekle
        document.querySelectorAll('.decrease-cart-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateCartItemQuantity(btn.dataset.id, -1);
            });
        });
        
        document.querySelectorAll('.increase-cart-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateCartItemQuantity(btn.dataset.id, 1);
            });
        });
        
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromCart(btn.dataset.id);
            });
        });
        
        // Toplam fiyatı güncelle
        cartTotalPrice.textContent = `${total.toFixed(2)}₺`;
    };

    // Sepet öğesi adetini güncelleme
    const updateCartItemQuantity = (id, change) => {
        const itemIndex = cartItems.findIndex(item => item.id == id);
        if (itemIndex === -1) return;
        
        cartItems[itemIndex].quantity += change;
        
        if (cartItems[itemIndex].quantity < 1) {
            cartItems[itemIndex].quantity = 1;
        } else if (cartItems[itemIndex].quantity > 10) {
            cartItems[itemIndex].quantity = 10;
        }
        
        // Toplam fiyatı güncelle
        const item = cartItems[itemIndex];
        item.totalPrice = (item.price + item.optionsPrice) * item.quantity;
        
        // Sepeti güncelle
        updateCart();
    };

    // Sepetten öğe çıkarma
    const removeFromCart = (id) => {
        cartItems = cartItems.filter(item => item.id != id);
        updateCart();
    };

    // Sipariş modalını açma
    const openOrderModal = () => {
        orderItemsContainer.innerHTML = '';
        let total = 0;
        const globalNote = orderNoteText ? orderNoteText.value.trim() : '';
        
        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            
            const portionText = item.portion === 'normal' ? 'Normal' : 'Büyük Boy';
            let spicyText = 'Acısız';
            
            switch(item.spicyLevel) {
                case 'mild':
                    spicyText = 'Az Acılı';
                    break;
                case 'hot':
                    spicyText = 'Acılı';
                    break;
                case 'extra':
                    spicyText = 'Çok Acılı';
                    break;
            }
            
            itemElement.innerHTML = `
                <div class="order-item-details">
                    <div class="order-item-title">${item.title} x ${item.quantity}</div>
                    <div class="order-item-options">
                        ${portionText}, ${spicyText}
                        ${item.notes ? `<br>Not: ${item.notes}` : ''}
                    </div>
                </div>
            `;
            
            orderItemsContainer.appendChild(itemElement);
            total += item.totalPrice;
        });
        
        orderTotalPrice.textContent = `${total.toFixed(2)}₺`;
        orderNoteText.value = globalNote;
        orderModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    // Siparişi onaylama
    const confirmOrder = async () => {
        try {
            const totalPrice = parseFloat(cartTotalPrice.textContent.replace('₺',''));
            // Supabase ile sipariş oluşturma
            const order = await supabaseModule.orders.createOrder(
                restaurantId,
                tableId,
                cartItems.map(ci => ({
                    productId: ci.productId,
                    quantity: ci.quantity,
                    price: ci.price,
                    totalPrice: ci.totalPrice,
                    notes: ci.notes,
                    options: ci.options || [],
                    optionsPrice: ci.optionsPrice || 0
                })),
                totalPrice,
                orderNoteText.value.trim()
            );
            document.getElementById('order-id').textContent = order.id;
            
            // Sepeti temizle
            cartItems = [];
            updateCart();
            
            // Sipariş modalını kapat ve başarı modalını göster
            orderModal.style.display = 'none';
            successModal.style.display = 'block';
        } catch (error) {
            console.error('Sipariş oluşturulurken hata:', error);
            showNotification('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
            closeModals();
        }
    };

    // Başarılı sipariş modalını kapatma
    const closeSuccessModal = () => {
        successModal.style.display = 'none';
        document.body.style.overflow = '';
        // Siparişi onayladıktan sonra menüye dönmek için
        loadMenu();
    };

    // Menüye dönmek için
    const goBackToMenu = () => {
        closeModals();
        loadMenu();
    };

    // Bildirim gösterme
    const showNotification = (message, type) => {
        // Bildirim içeriğini hazırla
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fas fa-check-circle notification-icon success"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle notification-icon error"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle notification-icon warning"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle notification-icon info"></i>';
                break;
        }
        
        // Bildirim içeriğini ayarla
        notification.innerHTML = `
            ${icon}
            <div class="notification-message">
                <p>${message}</p>
            </div>
        `;
        
        // Bildirim sınıflarını ayarla
        notification.className = 'notification';
        notification.classList.add(type);
        notification.classList.add('show');
        
        // Zamanlayıcı ile bildirimi kapat
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.className = 'notification'; // Reset class
            }, 300); // Geçiş animasyonu tamamlandıktan sonra
        }, 5000); // Bildirim 5 saniye görünür kalacak
    };

    // Sepeti açma/kapama fonksiyonu
    const toggleCart = (show) => {
        if (show) {
            cartContainer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Sayfanın scroll'unu engelleme
        } else {
            cartContainer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = ''; // Scroll'u tekrar etkinleştir
        }
    };

    // Event listeners
    document.getElementById('add-to-cart').addEventListener('click', addToCart);
    document.getElementById('decrease-quantity').addEventListener('click', () => updateCartItemQuantity(currentProduct.id, -1));
    document.getElementById('increase-quantity').addEventListener('click', () => updateCartItemQuantity(currentProduct.id, 1));
    document.getElementById('menu-search').addEventListener('input', (e) => searchMenu(e.target.value));
    
    // Mobil sepet butonları
    if (openCartButton) {
        openCartButton.addEventListener('click', () => toggleCart(true));
    }
    if (closeCartButton) {
        closeCartButton.addEventListener('click', () => toggleCart(false));
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => toggleCart(false));
    }
    document.getElementById('call-waiter').addEventListener('click', async () => {
        try {
            // Önce bildirim göster
            showNotification('Garson çağrılıyor...', 'info');
            // Çağrıyı oluştur
            await supabaseModule.calls.createCall(restaurantId, tableId, 'waiter');
            // Başarılı bildirim göster
            setTimeout(() => {
                showNotification('Garson çağrınız başarıyla iletildi!', 'success');
            }, 1000);
        } catch (err) {
            console.error('Garson çağrı hatası:', err);
            showNotification('Garson çağrılamadı', 'error');
        }
    });
    document.getElementById('request-coal').addEventListener('click', async () => {
        try {
            // Önce bildirim göster
            showNotification('Köz talebi gönderiliyor...', 'info');
            // Çağrıyı oluştur
            await supabaseModule.calls.createCall(restaurantId, tableId, 'coal');
            // Başarılı bildirim göster
            setTimeout(() => {
                showNotification('Köz talebiniz başarıyla iletildi!', 'success');
            }, 1000);
        } catch (err) {
            console.error('Köz talebi hatası:', err);
            showNotification('Köz talebi gönderilemedi', 'error');
        }
    });
    document.getElementById('clear-cart').addEventListener('click', () => {
        cartItems = [];
        updateCart();
        showNotification('Sepet temizlendi!', 'success');
    });
    document.getElementById('place-order').addEventListener('click', openOrderModal);
    document.getElementById('confirm-order').addEventListener('click', confirmOrder);
    document.getElementById('cancel-order').addEventListener('click', closeModals);
    document.getElementById('close-success').addEventListener('click', closeSuccessModal);
    modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModals));

    // Sayfa yüklendiğinde tüm modal'ları kapat
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModals();
        }
    });

    // Sayfa yüklendiğinde bilgi mesajlarını kapat
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('notification')) {
            e.target.style.display = 'none';
        }
    });

    // Sayfa yüklendiğinde sipariş notunu kaydetme
    document.getElementById('order-note-text').addEventListener('input', (e) => {
        localStorage.setItem('orderNote', e.target.value);
    });

    // Sayfa yüklendiğinde sipariş notunu yükleme
    const loadOrderNote = () => {
        const savedNote = localStorage.getItem('orderNote');
        if (savedNote) {
            orderNoteText.value = savedNote;
        }
    };
    loadOrderNote();

    // Sayfa yüklendiğinde menüyü yükleme
    loadMenu();
    loadRestaurantInfo();
});

// loadProductOptions fonksiyonu kaldırıldı; ürün seçenekleri products.options ile işleniyor