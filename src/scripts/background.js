// Hareketli Arkaplan Animasyonu - Sadece ürün kartları için
let particles = [];
let opt = {
  particles: 60, // Performans için daha da azaltıldı
  noiseScale: 0.008,
  angle: Math.PI / 180 * -90,
  // Mavi tonları için renkler (0ea5e9 - ana tema rengi için)
  h1: 210, // mavi
  h2: 200, // açık mavi
  s1: 80,  // canlı
  s2: 70,  // biraz daha az canlı
  l1: 60,  // orta parlaklık
  l2: 70,  // biraz daha parlak
  strokeWeight: 1.0, // İnce çizgiler
  tail: 90, // Daha uzun iz
};

let time = 0;
let canvases = [];
let menuItems = [];

// Yardımcı fonksiyonlar
const deg = (a) => Math.PI / 180 * a;
const rand = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));

// Particle sınıfı
class Particle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.lx = x;
    this.ly = y;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.width = width;
    this.height = height;
    this.hueSemen = Math.random();
    this.hue = this.hueSemen > .5 ? 20 + opt.h1 : 20 + opt.h2;
    this.sat = this.hueSemen > .5 ? opt.s1 : opt.s2;
    this.light = this.hueSemen > .5 ? opt.l1 : opt.l2;
    this.maxSpeed = this.hueSemen > .5 ? 2 : 1; // Performans için azaltıldı
  }
  
  randomize() {
    this.hueSemen = Math.random();
    this.hue = this.hueSemen > .5 ? 20 + opt.h1 : 20 + opt.h2;
    this.sat = this.hueSemen > .5 ? opt.s1 : opt.s2;
    this.light = this.hueSemen > .5 ? opt.l1 : opt.l2;
    this.maxSpeed = this.hueSemen > .5 ? 2 : 1;
  }
  
  update(width, height) {
    this.follow();
    
    this.vx += this.ax;
    this.vy += this.ay;
    
    var p = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    var a = Math.atan2(this.vy, this.vx);
    var m = Math.min(this.maxSpeed, p);
    this.vx = Math.cos(a) * m;
    this.vy = Math.sin(a) * m;
    
    this.x += this.vx;
    this.y += this.vy;
    this.ax = 0;
    this.ay = 0;
    
    this.edges(width, height);
  }
  
  follow() {
    let angle = (noise(this.x * opt.noiseScale, this.y * opt.noiseScale, time * opt.noiseScale)) * Math.PI * 0.5 + opt.angle;
    
    this.ax += Math.cos(angle);
    this.ay += Math.sin(angle);
  }
  
  updatePrev() {
    this.lx = this.x;
    this.ly = this.y;
  }
  
  edges(width, height) {
    if (this.x < 0) {
      this.x = width;
      this.updatePrev();
    }
    if (this.x > width) {
      this.x = 0;
      this.updatePrev();
    }
    if (this.y < 0) {
      this.y = height;
      this.updatePrev();
    }
    if (this.y > height) {
      this.y = 0;
      this.updatePrev();
    }
  }
  
  render(ctx) {
    // Gradyan oluştur
    const gradient = ctx.createLinearGradient(this.x, this.y, this.lx, this.ly);
    gradient.addColorStop(0, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, .6)`);
    gradient.addColorStop(1, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, .3)`);
    
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.lx, this.ly);
    ctx.lineWidth = 1.5; // Biraz daha kalın çizgiler
    ctx.stroke();
    this.updatePrev();
  }
}

// Ürün kartlarını bulma ve canvas ekleme
function setupMenuItemCanvases() {
  // Mevcut canvas'ları temizle
  canvases.forEach(canvas => {
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });
  canvases = [];
  particles = [];
  
  // Ürün kartlarını bul
  menuItems = document.querySelectorAll('.menu-item');
  
  // Her ürün kartı için canvas oluştur
  menuItems.forEach((item, index) => {
    // Canvas oluştur
    const canvas = document.createElement('canvas');
    canvas.className = 'item-background-canvas';
    canvas.width = item.offsetWidth;
    canvas.height = item.offsetHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.borderRadius = 'inherit';
    
    // Canvas'ı ürün kartının başına ekle
    item.style.position = 'relative';
    item.insertBefore(canvas, item.firstChild);
    
    // Canvas'ı kaydet
    canvases.push(canvas);
    
    // Her canvas için parçacıklar oluştur
    const particleCount = Math.max(10, Math.floor(opt.particles / menuItems.length));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        particle: new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          canvas.width,
          canvas.height
        ),
        canvasIndex: index
      });
    }
  });
}

// Animasyonu güncelleme
function updateAnimation() {
  time++;
  
  // Her canvas için çizim yap
  canvases.forEach((canvas, index) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - opt.tail/100})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bu canvas'a ait parçacıkları güncelle ve çiz
    particles.filter(p => p.canvasIndex === index).forEach(p => {
      p.particle.update(canvas.width, canvas.height);
      p.particle.render(ctx);
    });
  });
  
  // Animasyonu devam ettir
  requestAnimationFrame(updateAnimation);
}

// Sayfa yüklendiğinde ve boyut değiştiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Menü öğeleri yüklendiğinde canvas'ları oluştur
  setTimeout(() => {
    setupMenuItemCanvases();
    updateAnimation();
  }, 500); // Menü öğelerinin yüklenmesi için biraz bekle
});

// Pencere boyutu değiştiğinde
window.addEventListener('resize', () => {
  // Boyut değiştiğinde canvas'ları yeniden oluştur
  setTimeout(setupMenuItemCanvases, 300);
});

// Renkleri değiştirmek için tıklama olayı
document.addEventListener('click', () => {
  opt.h1 = rand(0, 360);
  opt.h2 = rand(0, 360);
  opt.s1 = rand(20, 90);
  opt.s2 = rand(20, 90);
  opt.l1 = rand(30, 80);
  opt.l2 = rand(30, 80);
  opt.angle += deg(rand(30, 60)) * (Math.random() > .5 ? 1 : -1);
  
  particles.forEach(p => {
    p.particle.randomize();
  });
});