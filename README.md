# Topex Ustoz — o'qituvchi paneli

Topex Texnikum o'qituvchilari uchun mustaqil panel (build talab qilinmaydi, faqat HTML/CSS/JS).

## Imkoniyatlar
- Login (namuna: `ustoz` / `1234`, Profil → Kirish va xavfsizlik bo'limida o'zgartiriladi)
- Asosiy: reyting, oylik (yashirish/ko'rsatish), guruhlar, "Barchasi / Bugun" filtri, guruh qo'shish
- Guruh sahifasi: sana bo'yicha davomat (Keldi / Kelmadi / Sababli), o'quvchi qo'shish
- O'quvchilar: qidiruv, guruh filtri, qo'shish / tahrirlash / o'chirish, CSV yuklab olish
- Statistika: guruhlar va hafta kunlari bo'yicha davomat, qarzdorlar
- Uy vazifalari: berish, topshirganlarni belgilash, o'chirish
- Chat: guruhlar bo'yicha xabarlar
- Profil: shaxsiy ma'lumotlar, rasm, parol, bildirishnomalar, to'lovlar tarixi
- Och / to'q mavzu, telefon uchun moslashuvchan dizayn

## Ishga tushirish
VS Code da papkani oching va `index.html` ni **Live Server** bilan ishga tushiring
(yoki `index.html` ni to'g'ridan-to'g'ri brauzerda oching).

## GitHub ga yuklash
```bash
git init
git add .
git commit -m "Topex Ustoz paneli"
git branch -M main
git remote add origin <repo-manzili>
git push -u origin main
```
GitHub Pages: Settings → Pages → Branch: `main` / root.

## Muhim
Ma'lumotlar brauzerning `localStorage` xotirasida saqlanadi (har bir brauzerda alohida). Hamma ma'lumot namunaviy.
Haqiqiy ko'p foydalanuvchili ishlash uchun keyingi qadam — backend (masalan, Node.js + PostgreSQL) ulash.
