-- ADİSTOW QR Menü Sistemi Veritabanı Şeması

-- Restoran bilgilerini tutan tablo
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id TEXT UNIQUE NOT NULL, -- Benzersiz Restaurant ID (kullanıcı girişi için)
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcıları tutan tablo (Restoran sahipleri ve personel)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Şifrelenmiş şifre saklanacak
    full_name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'owner', 'manager', 'staff'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Masaları tutan tablo
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    name TEXT,
    qr_code_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, number) -- Restoran içinde masa numarası benzersiz olmalı
);

-- Menü kategorilerini tutan tablo
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menü öğelerini tutan tablo
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menü öğesi seçeneklerini tutan tablo (porsiyon, acı seviyesi, vb.)
CREATE TABLE item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    option_name TEXT NOT NULL, -- örn. "Porsiyon", "Acı Seviyesi"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menü öğesi seçenek değerlerini tutan tablo
CREATE TABLE option_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_option_id UUID REFERENCES item_options(id) ON DELETE CASCADE,
    value TEXT NOT NULL, -- örn. "Normal", "Büyük", "Acısız", "Az Acılı"
    price_addition DECIMAL(10, 2) DEFAULT 0, -- Ekstra fiyat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Siparişleri tutan tablo
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'preparing', 'ready', 'delivered', 'canceled', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sipariş öğelerini tutan tablo
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sipariş öğesi seçeneklerini tutan tablo
CREATE TABLE order_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    option_name TEXT NOT NULL, -- örn. "Porsiyon", "Acı Seviyesi"
    option_value TEXT NOT NULL, -- örn. "Normal", "Büyük", "Acısız", "Az Acılı"
    price_addition DECIMAL(10, 2) DEFAULT 0, -- Ekstra fiyat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Çağrıları tutan tablo (garson çağırma, köz isteme, vb.)
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    call_type TEXT NOT NULL, -- 'waiter', 'coal', 'bill'
    status TEXT NOT NULL, -- 'pending', 'completed', 'canceled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abonelik paketlerini tutan tablo
CREATE TABLE subscription_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 'starter', 'medium', 'professional', 'enterprise'
    description TEXT NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2) NOT NULL,
    table_limit INTEGER NOT NULL, -- Maksimum masa sayısı
    features JSONB, -- Paket özellikleri
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restoran aboneliklerini tutan tablo
CREATE TABLE restaurant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    package_id UUID REFERENCES subscription_packages(id) ON DELETE RESTRICT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_period TEXT NOT NULL, -- 'monthly', 'yearly'
    status TEXT NOT NULL, -- 'active', 'pending', 'canceled', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ödemeleri tutan tablo
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES restaurant_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- 'credit_card', 'bank_transfer'
    payment_id TEXT, -- Shopier ödeme ID'si
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analitik veriler için tablo
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    top_menu_items JSONB, -- En çok satılan ürünler
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Politikaları
-- Restoran verileri için güvenlik politikası
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY restaurant_owner_policy ON restaurants
    USING (auth.uid() IN (
        SELECT user_id FROM users 
        WHERE restaurant_id = restaurants.id AND role = 'owner'
    ));

-- Kullanıcılar için güvenlik politikası
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_same_restaurant_policy ON users
    USING (auth.uid() IN (
        SELECT id FROM users 
        WHERE restaurant_id = users.restaurant_id
    ));

-- Masalar için güvenlik politikası
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY tables_same_restaurant_policy ON tables
    USING (auth.uid() IN (
        SELECT user_id FROM users 
        WHERE restaurant_id = tables.restaurant_id
    ));

-- Diğer tablolar için benzer güvenlik politikaları...

-- Fonksiyonlar ve Tetikleyiciler

-- updated_at alanını güncellemek için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tablolar için updated_at tetikleyicileri
CREATE TRIGGER update_restaurant_updated_at BEFORE UPDATE
ON restaurants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE
ON tables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE
ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE
ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE
ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE
ON calls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscription_packages_updated_at BEFORE UPDATE
ON subscription_packages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_restaurant_subscriptions_updated_at BEFORE UPDATE
ON restaurant_subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE
ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Benzersiz Restaurant ID oluşturmak için fonksiyon
CREATE OR REPLACE FUNCTION generate_restaurant_id()
RETURNS TEXT AS $$
DECLARE
    id_prefix TEXT := 'ADW';
    random_chars TEXT;
    result TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- 6 haneli rastgele karakter oluştur
        SELECT string_agg(substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ceil(random() * 36)::integer, 1), '')
        INTO random_chars
        FROM generate_series(1, 6);
        
        result := id_prefix || random_chars;
        
        -- Bu ID daha önce kullanıldı mı kontrol et
        SELECT EXISTS(SELECT 1 FROM restaurants WHERE restaurant_id = result) INTO exists_already;
        
        -- Benzersiz ise döngüden çık
        EXIT WHEN NOT exists_already;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;
