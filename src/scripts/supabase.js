// Supabase İstemci Yapılandırması

// Supabase JavaScript istemcisini import et (index.html'e CDN ile eklenecek)
// import { createClient } from '@supabase/supabase-js'

// Supabase client oluştur
// Supabase Client Initialization
// Assumes <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script> is loaded before this script
const supabaseUrl = 'https://kqbmcbpzojkcmbgjflsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYm1jYnB6b2prY21iZ2pmbHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTIzOTMsImV4cCI6MjA3MTk4ODM5M30.mc3K97HycaVTqaxKYSncE381HY9N13pubXlOeOXU-5s';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Kimlik Doğrulama İşlemleri
const supabaseAuth = {
  // Restaurant ID ve şifre ile giriş yapma
  async signInWithRestaurantId(restaurantId, password) {
    try {
      // İlk olarak bu restaurant ID'ye sahip restoranı bul
      const { data: restaurantData, error: restaurantError } = await supabaseClient
        .from('restaurants')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .single();
      
      if (restaurantError) throw restaurantError;
      if (!restaurantData) throw new Error('Restaurant bulunamadı');
      
      // Şimdi kullanıcı bilgileriyle giriş yap
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: `${restaurantId}@example.com`, // Gerçek email yerine Restaurant ID'yi kullanabiliriz
        password: password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  },
  
  // Yeni restoran ve kullanıcı kaydı oluşturma
  async registerRestaurant(restaurantName, email, password, phone, packageType, subscriptionPeriod) {
    try {
      // Önce kullanıcıyı auth sistemine kaydet
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: restaurantName,
            phone: phone
          }
        }
      });
      
      if (authError) throw authError;
      
      // Yeni restoran kaydı oluştur
      const { data: restaurantData, error: restaurantError } = await supabaseClient
        .from('restaurants')
        .insert([{
          name: restaurantName,
          email: email,
          phone: phone,
          restaurant_id: null // Otomatik oluşturulacak (trigger ile)
        }])
        .select()
        .single();
      
      if (restaurantError) throw restaurantError;
      
      // Kullanıcıyı restoran ile ilişkilendir
      const { error: userError } = await supabaseClient
        .from('users')
        .insert([{
          restaurant_id: restaurantData.id,
          email: email,
          full_name: restaurantName,
          role: 'owner',
          password: 'HASHED_PASSWORD_PLACEHOLDER' // Gerçek uygulamada hash kullanılacak
        }]);
      
      if (userError) throw userError;
      
      // Abonelik paketi seç
      const { data: packageData, error: packageError } = await supabaseClient
        .from('subscription_packages')
        .select('*')
        .eq('name', packageType)
        .single();
      
      if (packageError) throw packageError;
      
      // Abonelik oluştur
      const startDate = new Date();
      const endDate = new Date();
      
      if (subscriptionPeriod === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscriptionPeriod === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      const { error: subscriptionError } = await supabaseClient
        .from('restaurant_subscriptions')
        .insert([{
          restaurant_id: restaurantData.id,
          package_id: packageData.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_period: subscriptionPeriod,
          status: 'pending' // Ödeme sonrası 'active' olacak
        }]);
      
      if (subscriptionError) throw subscriptionError;
      
      return {
        restaurantData,
        packageData
      };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  },
  
  // Çıkış yapma
  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  },
  
  // Geçerli kullanıcıyı alma
  async getCurrentUser() {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error);
      return null;
    }
  }
};

// Restoran İşlemleri
const supabaseRestaurant = {
  // Restoran bilgilerini getirme
  async getRestaurantInfo(restaurantId) {
    try {
      // Try selecting address (used as description)
      const { data, error } = await supabaseClient
        .from('restaurants')
        .select('id, name, address, logo_url')
        .eq('id', restaurantId)
        .single();
      if (error) throw error;
      // Map address field to description for UI
      return { id: data.id, name: data.name, description: data.address, logo_url: data.logo_url };
    } catch (error) {
      // Fallback if description column was still requested elsewhere
      console.error('Restoran bilgileri alınamadı:', error);
      throw error;
    }
  },
  
  // Restoran bilgilerini güncelleme
  async updateRestaurantInfo(restaurantId, updateData) {
    try {
      const { data, error } = await supabaseClient
        .from('restaurants')
        .update(updateData)
        .eq('id', restaurantId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Restoran bilgileri güncellenemedi:', error);
      throw error;
    }
  }
};

// Menü İşlemleri
const supabaseMenu = {
  // Kategorileri getirme
  async getCategories(restaurantId) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategoriler alınamadı:', error);
      throw error;
    }
  },
  
  // Kategori ekleme
  async addCategory(restaurantId, categoryData) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .insert([{
          ...categoryData,
          restaurant_id: restaurantId
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      throw error;
    }
  },
  
  // Kategori güncelleme
  async updateCategory(categoryId, updateData) {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori güncellenemedi:', error);
      throw error;
    }
  },
  
  // Kategori silme
  async deleteCategory(categoryId) {
    try {
      const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      throw error;
    }
  },
  
  // Menü öğelerini getirme
  async getMenuItems(restaurantId, categoryId = null) {
    try {
      let query = supabaseClient
        .from('products')
        .select('* , categories(name)') // join category name
        .eq('restaurant_id', restaurantId);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Menü öğeleri alınamadı:', error);
      throw error;
    }
  },
  
  // Menü öğesi ekleme
  async addMenuItem(restaurantId, itemData) {
    try {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .insert([{
          ...itemData,
          restaurant_id: restaurantId
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Menü öğesi eklenemedi:', error);
      throw error;
    }
  },
  
  // Menü öğesi güncelleme
  async updateMenuItem(itemId, updateData) {
    try {
      const { data, error } = await supabaseClient
        .from('menu_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Menü öğesi güncellenemedi:', error);
      throw error;
    }
  },
  
  // Menü öğesi silme
  async deleteMenuItem(itemId) {
    try {
      const { error } = await supabaseClient
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Menü öğesi silinemedi:', error);
      throw error;
    }
  },
  
  // Menü öğesi seçeneklerini getirme
  async getItemOptions(menuItemId) {
    try {
      const { data, error } = await supabaseClient
        .from('item_options')
        .select(`
          *,
          option_values (*)
        `)
        .eq('menu_item_id', menuItemId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Öğe seçenekleri alınamadı:', error);
      throw error;
    }
  }
};

// Masa İşlemleri
const supabaseTables = {
  // Masaları getirme
  async getTables(restaurantId) {
    try {
      const { data, error } = await supabaseClient
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('number', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Masalar alınamadı:', error);
      throw error;
    }
  },
  
  // Masa ekleme
  async addTable(restaurantId, tableData) {
    try {
      const { data, error } = await supabaseClient
        .from('tables')
        .insert([{
          ...tableData,
          restaurant_id: restaurantId
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Masa eklenemedi:', error);
      throw error;
    }
  },
  
  // Masa güncelleme
  async updateTable(tableId, updateData) {
    try {
      const { data, error } = await supabaseClient
        .from('tables')
        .update(updateData)
        .eq('id', tableId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Masa güncellenemedi:', error);
      throw error;
    }
  },
  
  // Masa silme
  async deleteTable(tableId) {
    try {
      const { error } = await supabaseClient
        .from('tables')
        .delete()
        .eq('id', tableId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Masa silinemedi:', error);
      throw error;
    }
  },
  
  // QR kod URL'si oluşturma
  generateQrCodeUrl(restaurantId, tableNumber) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/src/customer/menu.html?restaurant=${restaurantId}&table=${tableNumber}`;
  }
};

// Sipariş İşlemleri
const supabaseOrders = {
  // Siparişleri getirme
  async getOrders(restaurantId, status = null) {
    try {
      let query = supabaseClient
        .from('orders')
        .select(`
          *,
          tables (id, number, name),
          order_items (
            *,
            menu_items (id, name, price),
            order_item_options (*)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Siparişler alınamadı:', error);
      throw error;
    }
  },
  
  // Sipariş oluşturma
  async createOrder(restaurantId, tableId, items, totalAmount, note = '') {
    try {
      // Önce sipariş oluştur
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert([{ 
            restaurant_id: restaurantId,
            table_id: tableId,
            total_amount: totalAmount,
            note: note,
            status: 'pending'
           }])
          .select()
          .single();
      if (orderError) throw orderError;
      
      // Sipariş öğelerini ekle
      for (const item of items) {
        const { data: orderItemData, error: itemError } = await supabaseClient
          .from('order_items')
          .insert([{ 
            order_id: order.id,
            menu_item_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.totalPrice,
            notes: item.notes
          }])
          .select()
          .single();
        if (itemError) throw itemError;
        
        // Sipariş öğesi seçeneklerini ekle
        // Dinamik ürün seçeneklerini de ekle
        const options = [];
        // Porsiyon ve acı seviyesi seçenekleri zaten işleniyor, ancak products.options içindeki seçenekleri ekleyelim
        if (item.portion || item.spicyLevel) {
          
          if (item.portion) {
            options.push({
              order_item_id: orderItemData.id,
              option_name: 'Porsiyon',
              option_value: item.portion === 'normal' ? 'Normal' : 'Büyük Boy',
              price_addition: item.portionPrice || 0
            });
          }
          
          if (item.spicyLevel) {
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
            
            options.push({
              order_item_id: orderItemData.id,
              option_name: 'Acı Seviyesi',
              option_value: spicyText,
              price_addition: 0
            });
          }
        }
        // products.options dizisindeki diğer seçenekleri ekle
        if (item.options && Array.isArray(item.options)) {
          item.options.forEach(opt => {
            options.push({
              order_item_id: orderItemData.id,
              option_name: 'Seçenek',
              option_value: opt,
              price_addition: 0
            });
          });
        }
        if (options.length > 0) {
          const { error: optionsError } = await supabaseClient
            .from('order_item_options')
            .insert(options);
          if (optionsError) throw optionsError;
        }
      }
      
      return order;
    } catch (error) {
      console.error('Sipariş oluşturulamadı:', error);
      throw error;
    }
  },
  
  // Sipariş durumunu güncelleme
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      throw error;
    }
  }
};

// Çağrı İşlemleri (Garson çağırma, köz isteme)
const supabaseCalls = {
  // Çağrı oluşturma
  async createCall(restaurantId, tableId, callType) {
    try {
      const { data, error } = await supabaseClient
        .from('calls')
        .insert([{
          restaurant_id: restaurantId,
          table_id: tableId,
          type: callType,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Çağrı oluşturulamadı:', error);
      throw error;
    }
  },
  
  // Çağrıları getirme
  async getCalls(restaurantId, status = 'pending') {
    try {
      const { data, error } = await supabaseClient
        .from('calls')
        .select(`
          *,
          tables (id, number, name)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', status)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Çağrılar alınamadı:', error);
      throw error;
    }
  },
  
  // Çağrı durumunu güncelleme
  async updateCallStatus(callId, status) {
    try {
      const { data, error } = await supabaseClient
        .from('calls')
        .update({ status })
        .eq('id', callId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Çağrı durumu güncellenemedi:', error);
      throw error;
    }
  }
};

// Realtime waiter_calls helper
function subscribeWaiterCalls(restaurantId, onInsert) {
  return supabaseClient
    .channel('waiter-calls-rt')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'calls',
      filter: `restaurant_id=eq.${restaurantId}`
    }, payload => onInsert(payload.new))
    .subscribe();
}

window.subscribeWaiterCalls = subscribeWaiterCalls;

// Gerçek zamanlı abonelikler
const supabaseRealtime = {
  // Yeni siparişleri dinleme
  subscribeToNewOrders(restaurantId, callback) {
    return supabaseClient
      .channel('orders-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  },
  
  // Sipariş durumu değişikliklerini dinleme
  subscribeToOrderStatusChanges(callback) {
    return supabaseClient
      .channel('order-status-channel')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders' 
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  },
  
  // Yeni çağrıları dinleme
  subscribeToNewCalls(restaurantId, callback) {
    return supabaseClient
      .channel('calls-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'calls',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  }
};

// Ana modül
const supabaseModule = {
  client: supabaseClient,
  auth: supabaseAuth,
  restaurant: supabaseRestaurant,
  menu: supabaseMenu,
  tables: supabaseTables,
  orders: supabaseOrders,
  calls: supabaseCalls,
  realtime: supabaseRealtime
};

// Modülü global window nesnesine ekle
window.supabaseModule = supabaseModule;
