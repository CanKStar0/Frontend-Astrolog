<div align="center">

# 🌌 COSMIC EXPLORER v2.0
### İnteraktif 3D Güneş Sistemi Simülasyonu

[![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge&logo=rocket)](https://github.com/CanKStar0/Frontend-Astrolog)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.14.2-green?style=for-the-badge&logo=greensock)](https://greensock.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br>

**[🚀 CANLI DEMO İÇİN TIKLA](https://frontend-astrolog.up.railway.app/)**

<p>
  Three.js ile geliştirilmiş, gerçek zamanlı fizik, dinamik aydınlatma ve<br>
  sinematik efektlerle donatılmış yeni nesil uzay keşif deneyimi.
</p>

</div>

---

## ✨ Özellikler

### 🌍 Gerçekçi Gezegen Sistemi
* **Prosedürel Texture:** Her gezegen için özel canvas tabanlı kaplamalar.
* **Atmosferik Shader:** Işık kırılması ve atmosfer yoğunluğu simülasyonu.
* **Dinamik Aydınlatma:** Güneş'ten gelen gerçekçi ışık ve gölge hesaplamaları.
* **Uydu Sistemleri:** Ay, Phobos, Europa, Titan gibi gerçek uydular.

### 🚀 Uçuş Modu (Flight Mode)
* **6DOF Kontrol:** Uzay gemisiyle tam serbestlik (6 Degrees of Freedom).
* **Fizik Motoru:** Momentum, sürtünmesiz ortam ve itiş gücü fiziği.
* **Warp Drive:** Gezegenler arası hızlı seyahat için warp efekti.
* **HUD Sistemi:** Hız, yön ve hedef göstergeleri.

### 📊 Model Vitrini & Karşılaştırma
* **Detaylı Modeller:** Hubble Teleskobu, ISS, Voyager 1 gibi araçları yakından inceleyin.
* **Boyut Karşılaştırması:** Gezegenleri yan yana getirip ölçeklerini kıyaslayın.
* **Sinematik Kamera:** Otomatik odaklanma ve yumuşak geçişler.

### 🎨 Görsel & İşitsel Efektler
* **Black Hole:** Olay ufku (Event Horizon) ve ışık bükülmesi simülasyonu.
* **Meteor Yağmurları:** Dinamik ve rastgele meteor geçişleri.
* **Ses Tasarımı:** Uzay atmosferi, motor sesleri ve UI efektleri.

---

## 🎮 Kontroller

| Tuş | Aksiyon | Mod |
| :---: | :--- | :--- |
| **W, A, S, D** | Gemiyi Yönlendir / İlerle | Uçuş |
| **SHIFT** | Turbo Boost (Hızlandır) | Uçuş |
| **F** | Uçuş Modunu Aç/Kapa | Genel |
| **SCROLL** | Yakınlaş / Uzaklaş | Orbit |
| **SOL TIK** | Kamerayı Döndür | Orbit |
| **ESC** | Menüye Dön / Çıkış | Genel |

---

## 🛠️ Kurulum

Projeyi kendi bilgisayarında çalıştırmak için şu adımları izle:

### 1. Projeyi Klonla
git clone <strong>https://github.com/CanKStar0/Frontend-Astrolog.git </strong>
cd Frontend-Astrolog

### 2. Bağımlılıkları Yükle
npm install

### 3. Kütüphaneleri Hazırla
Gerekli Three.js ve GSAP dosyalarını lib klasörüne taşımak için:
node setup-libs.js

### 4. Başlat 🚀
Windows için:
start.bat

Mac/Linux için:
./start.sh

Veya manuel olarak: npm start

---

## 📁 Proje Yapısı

Frontend-Astrolog/
├── 📂 assets/           
├── 📂 js/
│   ├── 📂 core/        
│   ├── 📂 factories/  
│   ├── 📂 systems/    
│   └── 📂 config/     
├── 📂 styles/          
└── index.html          

---

## 👥 Geliştiriciler

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/CanKStar0">
        <img src="https://github.com/CanKStar0.png" width="100px;" alt="Canpolat Kaya" style="border-radius: 50%"/>
        <br />
        <b>Canpolat Kaya</b>
      </a>
      <br />
      <sub>👑 Proje Sahibi & Lead Dev</sub>
    </td>
    <td align="center">
      <a href="https://github.com/SercanAkcelik">
        <img src="https://github.com/SercanAkcelik.png" width="100px;" alt="Sercan Akçelik" style="border-radius: 50%"/>
        <br />
        <b>Sercan Akçelik</b>
      </a>
      <br />
      <sub>🚀 Model Showcase & Features</sub>
    </td>
    <td align="center">
      <a href="https://github.com/S-pectral">
        <img src="https://github.com/S-pectral.png" width="100px;" alt="Spectral" style="border-radius: 50%"/>
        <br />
        <b>Spectral</b>
      </a>
      <br />
      <sub>🎨 Contributor</sub>
    </td>
  </tr>
</table>

---

## 🤝 Katkıda Bulunun

1.  Bu repoyu **Fork** edin.
2.  Yeni bir branch oluşturun (git checkout -b feature/yeniozellik).
3.  Değişikliklerinizi yapın ve **Commit** atın.
4.  Branch'inizi **Push** edin.
5.  Bir **Pull Request** oluşturun.

---

<div align="center">
  
  Created with ❤️ by **CanKStar0**
  
  <img src="https://img.shields.io/badge/Powered_by-Cosmic_Energy-purple?style=flat-square" />
</div>