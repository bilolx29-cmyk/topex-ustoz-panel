# TOPEX CRM & USTOZ PANEL — MONGODB ATLAS INTEGRATSIYA QO'LLANMASI

Ushbu hujjat **TOPEX Ustoz Paneli** va asosiy **TOPEX CRM** tizimlarini yagona bulutli **MongoDB Atlas** ma'lumotlar bazasiga o'tkazish, Vercel'da production deployment qilish va to'liq sinxronlikni ta'minlash bo'yicha to'liq qo'llanmadir.

---

## 1. MONGODB ATLAS SOZLASH (3 DAQIQA)

1. [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) sahifasiga kiring va bepul klaster (M0 Free Tier) oching.
2. **Database Access** bo'limida yangi foydalanuvchi yarating (masalan: `topex_admin` va xavfsiz parol).
3. **Network Access** bo'limida IP manzil qo'shing: `0.0.0.0/0` (Vercel serverless konteynerlari har xil IP dan ulanishi uchun).
4. **Connect -> Drivers -> Node.js** bo'limidan Connection String (URI) nusxasini oling:
   ```text
   mongodb+srv://topex_admin:<PASSWORD>@cluster0.xxxx.mongodb.net/topex?retryWrites=true&w=majority
   ```

---

## 2. LOKAL ISHGA TUSHIRISH VA MIGRATSIYA

### 1-qadam: `.env` faylini yaratish
`topex-ustoz-panel` papkasida `.env` fayli yarating va MongoDB URI kiriting:
```env
MONGODB_URI=mongodb+srv://topex_admin:Parolingiz@cluster0.xxxx.mongodb.net/topex?retryWrites=true&w=majority
MONGODB_DB_NAME=topex
PORT=3000
```

### 2-qadam: SQLite'dan MongoDB Atlas'ga xavfsiz migratsiya
Mavjud SQLite bazasidagi barcha ma'lumotlarni dublikatsiz va yo'qotishlarsiz MongoDB Atlas'ga ko'chirish:
```bash
npm run migrate
```

**Migratsiya jarayoni:**
* SQLite bazasidan avtomatik zaxira nusxasi (`.backup-pre-mongo-...`) olinadi.
* MongoDB Atlas kolleksiyalari va indekslari (unique ID, TTL index) yaratiladi.
* `teachers`, `groups`, `students`, `enrollments`, `attendance`, `grades`, `homework`, `workers`, `roles` kolleksiyalari xavfsiz tarzda `upsert` qilinadi.
* Har bir kolleksiya soni SQLite bilan solishtirilib, to'liq hisobot beriladi.

---

## 3. VERCEL PRODUCTION SOZLAMALARI

Vercel boshqaruv panelida (Project Settings -> Environment Variables) quyidagi o'zgaruvchilarni qo'shing:

| O'zgaruvchi nomi | Qiymati | Izoh |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas ulanish manzili |
| `MONGODB_DB_NAME` | `topex` | Ma'lumotlar bazasi nomi |

> **Muhim xavfsizlik qoidasi:** `MONGODB_URI` faqat Vercel serverless backend (`/api/index.js`) tomonidan o'qiladi. U hech qachon brauzerga yoki frontendga uzatilmaydi.

---

## 4. ASOSIY TOPEX CRM BILAN YAGONA MA'LUMOTLAR MANBASI

### Muammo:
Asosiy TOPEX CRM hozircha lokal SQLite faylidan (`app.db`) foydalanmoqda. Ustozlar paneli esa Vercel'da MongoDB Atlas orqali ishlaydi. 

### Yechim va Integratsiya:
Admin asosiy CRM orqali yangi ustoz ochganda yoki bloklaganda, u Ustozlar panelida bir zumda aks etishi uchun asosiy CRM ham aynan shu MongoDB Atlas'ga ulanishi kerak:

1. **Yagona hisoblar:**
   Ustozlarning paroli `scrypt` algoritmi orqali shifrlanadi. CRM ham, Ustozlar paneli ham bir xil formuladan foydalanadi:
   `salt + ':' + scryptSync(password, salt, 32)`
2. **Sinxronlik:**
   * Admin CRM orqali ustoz yaratganda: MongoDB `teachers` kolleksiyasiga yoziladi.
   * Admin ustozni bloklaganda yoki o'chirganda: MongoDB `teachers` da `active: false` yoki `_archived: true` bo'ladi.
   * Ustozlar panelidagi `userOf()` filtri real-vaqtda buni aniqlab, bloklangan ustozning sessiyasini darhol bekor qiladi.

---

## 5. MONGODB ATLAS KOLLEKSIYALARI VA INDEKSLARI

| Kolleksiya | Indekslar | Maqsadi |
| :--- | :--- | :--- |
| `teachers` | `{ id: 1 }` (unique), `{ phone: 1 }`, `{ active: 1 }` | Ustozlar hisobi, telefon va scrypt xeshlangan parollar |
| `groups` | `{ id: 1 }` (unique), `{ teacherId: 1 }` | Guruhlar ro'yxati, dars kunlari va vaqti |
| `students` | `{ id: 1 }` (unique), `{ phone: 1 }` | O'quvchilar ro'yxati va balansi |
| `enrollments` | `{ id: 1 }` (unique), `{ studentId: 1, groupId: 1 }` | O'quvchini guruhga biriktirish |
| `attendance` | `{ id: 1 }` (unique), `{ groupId: 1, date: 1 }` | Kunlik davomat yozuvlari |
| `grades` | `{ id: 1 }` (unique), `{ groupId: 1, key: 1 }` | Baholash ma'lumotlari |
| `homework` | `{ id: 1 }` (unique), `{ groupId: 1 }`, `{ teacherId: 1 }` | Uy vazifalari va topshirish holatlari |
| `sessions` | `{ token: 1 }` (unique), `{ expiresAt: 1 }` (TTL: 0s) | Serverless avtorizatsiya sessiyalari (avtomatik tozalanadi) |
| `workers` | `{ id: 1 }` (unique), `{ phone: 1 }` | CRM administrator va xodimlar hisobi |
