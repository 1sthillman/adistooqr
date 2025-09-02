// Dashboard Etkileşimleri

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.dashboard-page');
    const pageTitle = document.getElementById('page-title');
    const userDropdownBtn = document.querySelector('.user-btn');
    const userDropdownContent = userDropdownBtn?.nextElementSibling;
    const notificationsBtn = document.querySelector('.notifications-dropdown .icon-btn');
    const notificationsContent = notificationsBtn?.nextElementSibling;

    // Sidebar toggle
    toggleSidebarBtn?.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    closeSidebarBtn?.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Navigation page switch
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const pageId = item.dataset.page;
            pages.forEach(p => {
                p.classList.toggle('active', p.id === pageId);
            });

            pageTitle.textContent = item.textContent.trim();
            // Eğer mobilde sidebar açıksa kapat
            if (window.innerWidth <= 992) sidebar.classList.remove('open');
        });
    });

    // Dropdown toggles
    userDropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownContent?.classList.toggle('show');
        notificationsContent?.classList.remove('show');
    });

    notificationsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationsContent?.classList.toggle('show');
        userDropdownContent?.classList.remove('show');
    });

    // Close dropdowns on outside click
    window.addEventListener('click', () => {
        userDropdownContent?.classList.remove('show');
        notificationsContent?.classList.remove('show');
    });

    // QR Kod butonları
    document.querySelectorAll('.action-btn.qr').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tableCard = btn.closest('.table-card');
            const tableHeader = tableCard.querySelector('h4');
            const tableNumber = tableHeader ? tableHeader.textContent.replace(/[^0-9]/g, '') : '';
            const restaurantId = document.getElementById('restaurant-id-display')?.textContent.replace('ID:','').trim() || 'DEMO';
            const qrUrl = supabaseModule.tables.generateQrCodeUrl(restaurantId, tableNumber);
            const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
            
            // Yeni pencere aç ve QR göster
            const qrWindow = window.open('', '_blank');
            qrWindow.document.write(`<title>Masa ${tableNumber} QR</title><img src="${qrImgUrl}" alt="QR Code">`);
        });
    });

    // Initialize Chart.js example for sales trend
    const salesCtx = document.getElementById('sales-chart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
                datasets: [{
                    label: 'Satış',
                    data: [500, 700, 900, 650, 1100, 950, 1200],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                    backgroundColor: 'rgba(78,84,200,0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
});
