document.addEventListener('DOMContentLoaded', () => {
    // URL'den parametreleri alma
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('restaurant_id');
    const tableId = urlParams.get('table_id');
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
    let selectedPortion = 'normal';
    let selectedSpicyLevel = 'none';

    // Başlangıç değerlerini ayarlama
    tableNumberElement.textContent = tableId;

    // Restaurant bilgilerini yükleme (Supabase’den çekilecek)
    const loadRestaurantInfo = async () => {
        try {
            const { data: restaurantInfo, error } = await supabaseModule.restaurant.getRestaurantInfo(restaurantId);
            if (error || !restaurantInfo) {
                throw error || new Error('Restoran bulunamadı');
            }
            const { name, description, logo_url } = restaurantInfo;
            document.getElementById('restaurant-name').textContent = name;
            document.getElementById('restaurant-description').textContent = description || '';
            document.getElementById('restaurant-logo').src = logo_url || '../assets/images/placeholder-logo.png';
        } catch (err) {
            console.error('Restaurant bilgileri yüklenirken hata oluştu:', err);
            showNotification('Restoran bilgileri alınamadı', 'error');
        }
    };

    // Menüyü Supabase'den yükleme
    const loadMenu = async () => {
        try {
            // Supabase ile kategorilere göre menü öğelerini çek
            const items = await supabaseModule.menu.getMenuItems(restaurantId);
            menuData = items.map(mi => ({
                id: mi.id,
                title: mi.name,
                description: mi.description,
                price: mi.price,
                category: mi.categories.name,
                image: mi.image_url,
                options: { portions: [], spicyLevels: [] }
            }));
            // Benzersiz kategorileri belirle
            categories = [...new Set(menuData.map(i => i.category))];
            renderCategories();
            renderMenuItems(menuData);
        } catch (error) {
            console.error('Menü yüklenirken hata oluştu:', error);
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
                    <img src="${item.image || '../assets/images/menu/placeholder.jpg'}" alt="${item.title}">
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
    const openProductModal = (product) => {
        currentProduct = product;
        selectedPortion = 'normal';
        selectedSpicyLevel = 'none';
        
        // Modal içeriğini güncelle
        modalProductTitle.textContent = product.title;
        modalProductImage.src = product.image || '../assets/images/menu/placeholder.jpg';
        modalProductDescription.textContent = product.description;
        modalProductPrice.textContent = `${product.price.toFixed(2)}₺`;
        productQuantityInput.value = 1;
        productNoteInput.value = '';
        
        // Seçenekleri sıfırla
        resetOptions();
        
        // Modalı göster
        productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    // Opsiyon seçimi resetleme
    const resetOptions = () => {
        // Porsiyon seçeneklerini sıfırla
        const portionOptions = document.querySelectorAll('#portion-options .option-btn');
        portionOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.value === 'normal') {
                option.classList.add('active');
            }
        });
        
        // Acı seviyesi seçeneklerini sıfırla
        const spicyOptions = document.querySelectorAll('#spicy-options .option-btn');
        spicyOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.value === 'none') {
                option.classList.add('active');
            }
        });
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
        const portionPrice = selectedPortion === 'large' ? 15 : 0;
        const totalPrice = (currentProduct.price + portionPrice) * quantity;
        
        // Sepet öğesi oluştur
        const cartItem = {
            id: Date.now(), // Benzersiz bir ID
            productId: currentProduct.id,
            title: currentProduct.title,
            price: currentProduct.price,
            portion: selectedPortion,
            portionPrice: portionPrice,
            spicyLevel: selectedSpicyLevel,
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
            
            const portionText = item.portion === 'normal' ? 'Normal' : 'Büyük Boy (+15₺)';
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
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.totalPrice.toFixed(2)}₺</div>
                    </div>
                    <div class="cart-item-options">
                        ${portionText}, ${spicyText}
                        ${item.notes ? `<br>Not: ${item.notes}` : ''}
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
        item.totalPrice = (item.price + item.portionPrice) * item.quantity;
        
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
            // Supabase ile sipariş oluşturma
            const orderId = await supabaseModule.orders.createOrder(restaurantId, tableId, cartItems, totalPrice, orderNoteText.value.trim());
            document.getElementById('order-id').textContent = orderId;
            
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
        notificationText.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.className = 'notification'; // Reset class
        }, 3000);
    };

    // Event listeners
    document.getElementById('add-to-cart').addEventListener('click', addToCart);
    document.getElementById('decrease-quantity').addEventListener('click', () => updateCartItemQuantity(currentProduct.id, -1));
    document.getElementById('increase-quantity').addEventListener('click', () => updateCartItemQuantity(currentProduct.id, 1));
    document.getElementById('menu-search').addEventListener('input', (e) => searchMenu(e.target.value));
    document.getElementById('call-waiter').addEventListener('click', () => showNotification('Mekanbazı çağrıldı!', 'info'));
    document.getElementById('request-coal').addEventListener('click', () => showNotification('Kömür talebi gönderildi!', 'info'));
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