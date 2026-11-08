// TOPEX Ustoz Paneli — Sun'iy Intellekt (AI) Dvigateli
// Google Gemini API + O'rnatilgan Ta'limiy AI (Topex EduAI Engine)

const https = require('https');

// Gemini API orqali javob olish (agar GEMINI_API_KEY bo'lsa)
async function callGeminiAPI(prompt, systemInstruction = '', apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      console.warn("Gemini API status:", res.status);
      return null;
    }

    const data = await res.json();
    const candidate = data.candidates && data.candidates[0];
    const text = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;
    return text || null;
  } catch (err) {
    console.warn("Gemini API so'rovida xatolik:", err.message);
    return null;
  }
}

// O'rnatilgan professional Ta'limiy AI (Topex EduAI) dvigateli
function generateSmartResponse(message, context = {}) {
  const q = String(message || '').trim().toLowerCase();
  const teacherName = context.teacherName || "Ustoz";
  const groupName = context.groupName || "O'quv guruhi";

  // 1. Salomlashish
  if (/^(salom|assalomu\s*alaykum|hayrli\s*(kun|tong|kech)|privet|hi|hello)/i.test(q)) {
    return `Assalomu alaykum, hurmatli ${teacherName}! 🌟

Men **Topex AI** — sizning shaxsiy ta'lim va metodika yordamchingizman. Bugun qaysi yo'nalishda yordam bera olaman?

• 📋 **Dars rejasi va konspekt tuzish** (45 yoki 80 daqiqalik)
• 💡 **Amaliy mashq va uyga vazifalar yaratish**
• 💻 **Dasturlash (React, JS, Python, SQL) bo'yicha kod va tushuntirish**
• ❓ **Oraliq nazorat uchun test savollari tuzish**
• 👥 **${groupName} guruhi o'quvchilari bilan ishlash bo'yicha tavsiyalar**

Qanday savolingiz yoki topshirig'ingiz bor?`;
  }

  // 2. Sen kimsan / Bot haqida
  if (/(sen\s*kimsan|o'zing\s*haqingda|kim\s*bu|vazifang\s*nima|botmisan)/i.test(q)) {
    return `🤖 **Men — Topex Ustoz AI yordamchisiman!**

Men TOPEX Texnikumi o'qituvchilari uchun maxsus yaratilgan sun'iy intellekt tizimiman. 

**Mening imkoniyatlarim:**
1. **Metodik yordam:** Darslarni rejalashtirish, dars ishlanmasi (konspekt) tayyorlash.
2. **Texnik yordam:** Dasturlash (JavaScript, Python, React, HTML/CSS, SQL), algoritmlar va xatolarni tuzatish.
3. **Baholash va testlar:** Mavzular bo'yicha ko'p variantli testlar va amaliy keyslar tuzish.
4. **Pedagogik maslahatlar:** Talabalarning darsdagi faolligini oshirish, davomatni yaxshilash va qiyin mavzularni sodda tushuntirish.

Istalgan savolingizni yozing, birgalikda eng yaxshi yechimni topamiz! 🚀`;
  }

  // 3. Rahmat / Minnatdorchilik
  if (/(rahmat|katta\s*rahmat|tashakkur|zo'r|super|gap\s*yo'q|tushundim|barakalla)/i.test(q)) {
    return `Arzimaydi, ${teacherName}! Sizga yordam berganimdan juda xursandman. 🤝✨

Darslaringiz doimo qiziqarli, sermahsul va talabalaringiz a'lochi bo'lishini tilayman! Yana biron mavzuda yordam kerak bo'lsa, bemalol yozing.`;
  }

  // 4. Dars rejasi / Konspekt tuzish
  if (/(dars\s*reja|konspekt|dars\s*ishlanma|darsni\s*reja|mavzu\s*reja)/i.test(q)) {
    return `📋 **80 daqiqalik namunaviy dars rejasi:**

**Mavzu:** Interaktiv amaliy mashg'ulot va yangi ko'nikmalar
**Guruh:** ${groupName}
**O'qituvchi:** ${teacherName}

---

### ⏱️ Dars bosqichlari va vaqt taqsimoti:

1. **Tashkiliy qism va Davomat (5 daqiqa):**
   - Talabalar davomatini Topex tizimida belgilash.
   - O'tgan darsdagi vazifalar bo'yicha qisqa savol-javob (Warm-up).

2. **Yangi mavzu bayoni (25 daqiqa):**
   - Mavzuning nazariy asoslari va real hayotdagi ahamiyati.
   - Doskada yoki ekranda jonli misollar (Live-coding / Demonstratsiya).
   - "Aql charxi" — talabalardan taxmin va fikrlar so'rash.

3. **Amaliy mashg'ulot (Mini-vazifa) (35 daqiqa):**
   - Talabalarga mustaqil yoki 2 kishilik juftlikda bajarish uchun topshiriq berish.
   - O'qituvchi tomonidan har bir talabaga individual yo'nalish berish.
   - Xatoliklar ustida ishlash.

4. **Mustahkamlash va Baholash (10 daqiqa):**
   - 2-3 nafar talabaning ishini umumiy ekranda tahlil qilish.
   - Faol ishtirok etganlarni rag'batlantirish va Topex Jurnalida baholash.

5. **Xulosa va Uyga vazifa (5 daqiqa):**
   - Asosiy xulosalarni eslatish.
   - Mustaqil bajarish uchun topshiriq va adabiyotlar havolasi.

💡 *Maslahat: Aniq mavzuni aytsangiz (masalan, "React Hooks" yoki "Python Funksiyalar"), aynan shu mavzuga mos batafsil konspekt tayyorlab beraman!*`;
  }

  // 5. Uy vazifasi / Topshiriq berish
  if (/(uyga\s*vazifa|vazifa\s*tuz|topshiriq|amaliy\s*ish|homework)/i.test(q)) {
    return `💡 **Guruh uchun 3 darajali amaliy uy vazifasi to'plami:**

**Guruh:** ${groupName}

---

### 🟢 1-Daraja (Boshlang'ich — asosiy tushunchalar):
- Mavzu bo'yicha berilgan kod namunasini o'z kompyuteringizda ishga tushiring.
- Har bir qatorga izoh (comment) yozib, qanday ishlashini daftarga yoki README fayliga tushuntiring.
- **Maksimal ball:** 60-70 ball.

### 🟡 2-Daraja (O'rta — mustaqil qo'llash):
- Mavjud yechimga kamida 2 ta yangi funksionallik (masalan, qidiruv yoki filtrlash) qo'shing.
- Foydalanuvchi noto'g'ri ma'lumot kiritganda xatolik xabarini ko'rsating (Validation).
- **Maksimal ball:** 70-85 ball.

### 🔴 3-Daraja (Murakkab / Kreativ — a'lochilar uchun):
- Loyihani to'liq yakunlab, zamonaviy dizayn (UI) bering.
- Kodni GitHub repositoriyasiga yuklab, havola (link) topshiring.
- **Maksimal ball:** 85-100 ball.

🎯 *Ushbu vazifani to'g'ridan-to'g'ri "Vazifalar" bo'limiga nusxalab kiritishingiz mumkin!*`;
  }

  // 6. Test / Nazorat savollari tuzish
  if (/(test|nazorat\s*savol|savollar\s*tuz|quiz|imtihon)/i.test(q)) {
    return `📝 **Mavzuni tekshirish uchun 5 ta nazorat test savoli:**

---

**1-savol:** Dasturlashda o'zgaruvchilarni e'lon qilishda to'g'ri yondashuv qaysi?
- A) Har doim global o'zgaruvchilar ishlatish
- B) O'zgarmas qiymatlar uchun \`const\`, o'zgaruvchilar uchun \`let\` ishlatish ✅
- C) Faqat funksiyasiz kod yozish
- D) O'zgaruvchilarga raqam bilan boshlanadigan nom berish

**2-savol:** Funksiyaning asosiy afzalligi nimada?
- A) Kod hajmini sun'iy ravishda oshirish
- B) Kodni qayta ishlatish (reusability) va tartiblash ✅
- C) Faqat matematik hisob-kitoblar qilish
- D) Kompyuter xotirasini tejashning yagona yo'li

**3-savol:** Xatoliklarni ushlash va qayta ishlash uchun qaysi blok ishlatiladi?
- A) \`if...else\`
- B) \`switch...case\`
- C) \`try...catch\` ✅
- D) \`for...while\`

**4-savol:** Asinxron operatsiyalar bilan ishlashda qaysi kalit so'zlar juftligi qo'llaniladi?
- A) \`import / export\`
- B) \`async / await\` ✅
- C) \`break / continue\`
- D) \`public / private\`

**5-savol:** Git versiya boshqaruv tizimida o'zgarishlarni saqlash qaysi buyruq bilan qilinadi?
- A) \`git pull\`
- B) \`git clone\`
- C) \`git commit -m "xabar"\` ✅
- D) \`git reset --hard\`

---
✅ **To'g'ri javoblar:** 1-B, 2-B, 3-C, 4-B, 5-C.
*Ushbu testlarni talabalarga tarqatish yoki og'zaki so'rovda qo'llashingiz mumkin.*`;
  }

  // 7. React va Frontend
  if (/(react|hooks|usestate|useeffect|component|jsx|props|frontend)/i.test(q)) {
    return `⚛️ **React bo'yicha batafsil tushuntirish va kod namunasi:**

React ilovalarida komponent holatini boshqarish va tashqi hodisalarga munosabat bildirish uchun asosiy hooklar qo'llaniladi:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function StudentCounter() {
  // 1. Holat (State) yaratish
  const [count, setCount] = useState(0);
  const [groupName, setGroupName] = useState("${groupName}");

  // 2. Nojo'ya ta'sir (Side-effect) — har safar count o'zgarganda ishlaydi
  useEffect(() => {
    document.title = \`\${groupName}: \${count} ta talaba\`;
  }, [count, groupName]);

  return (
    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
      <h3>{groupName} davomati</h3>
      <p>Bugun kelganlar: <b>{count}</b> nafar</p>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setCount(c => c + 1)}>+ O'quvchi keldi</button>
        <button onClick={() => setCount(c => Math.max(0, c - 1))}>- Kamaytirish</button>
      </div>
    </div>
  );
}

export default StudentCounter;
\`\`\`

**Muhim qoidalar:**
1. Hooklar faqat React funksiya komponentining eng yuqori qismida chaqiriladi.
2. \`useEffect\` massividagi qaramliklar (\`dependencies\`) to'g'ri ko'rsatilsa, cheksiz render bo'lishining oldi olinadi.`;
  }

  // 8. Python va Backend
  if (/(python|django|fastapi|flask|backend|pip|list|dict)/i.test(q)) {
    return `🐍 **Python dasturlash tili bo'yicha amaliy namuna:**

Talabalar ro'yxati va ularning o'rtacha ballarini hisoblovchi toza va ixcham kod:

\`\`\`python
# Topex o'quvchilari ma'lumotlar bazasi namunasi
students = [
    {"name": "Azizbek Karimov", "scores": [85, 90, 95]},
    {"name": "Dilnoza Aliyeva", "scores": [90, 92, 88]},
    {"name": "Bobur Saidov", "scores": [75, 80, 85]}
]

def calculate_averages(data):
    results = []
    for s in data:
        avg = sum(s["scores"]) / len(s["scores"])
        status = "A'lochi" if avg >= 90 else ("Yaxshi" if avg >= 80 else "Qoniqarli")
        results.append({
            "name": s["name"],
            "average": round(avg, 1),
            "status": status
        })
    return results

# Natijalarni chiroyli chiqarish
for res in calculate_averages(students):
    print(f"👤 {res['name']}: {res['average']} ball ({res['status']})")
\`\`\`

💡 **Talabalarga tushuntirish uchun eslatma:**
- \`list comprehension\` va \`dict\` tuzilmalari orqali kodni yanada qisqartirish mumkin.`;
  }

  // 9. JavaScript va Web dasturlash
  if (/(javascript|js|async|await|promise|array|map|filter|reduce)/i.test(q)) {
    return `⚡ **JavaScript zamonaviy usullari (ES6+):**

Massiv metodlari (\`map\`, \`filter\`, \`reduce\`) va asinxron so'rovlar namunasi:

\`\`\`javascript
// 1. O'quvchilarni saralash va filtrlash
const students = [
  { id: 1, name: "Azizbek", score: 92, active: true },
  { id: 2, name: "Dilnoza", score: 88, active: true },
  { id: 3, name: "Bobur", score: 74, active: false }
];

// Faqat faol va 80 dan yuqori ball olganlar
const topStudents = students
  .filter(s => s.active && s.score >= 80)
  .map(s => \`\${s.name} (A'lochi: \${s.score})\`);

console.log(topStudents);

// 2. Asinxron ma'lumot yuklash (Async/Await)
async function loadGroupData(groupId) {
  try {
    const res = await fetch(\`/api/groups/\${groupId}\`);
    if (!res.ok) throw new Error("Tarmoq xatosi");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Xatolik yuz berdi:", err.message);
  }
}
\`\`\`

Talabalarga aynan qaysi mavzu qiyinlik tug'dirayotganini aytsangiz, shunga mos mini-darslik tayyorlayman!`;
  }

  // 10. Davomat va Pedagogik maslahat
  if (/(davomat|kelmadi|kelmayapti|qiziqish|sust|faol\s*emas|motivatsiya)/i.test(q)) {
    return `👥 **Darsda talabalar davomati va faolligini oshirish bo'yicha 5 ta samarali metod:**

1. **Gamification (O'yinlashtirish):**
   - Dars boshida 5 daqiqalik qiziqarli Kahoot yoki tezkor viktorina o'tkazing. G'oliblarga Topex jurnalida +5 rag'bat bali qo'ying.

2. **Peer Learning (Bir-biriga o'rgatish):**
   - Kuchli talabani biroz orqada qolayotgan talabaga "mentor" qilib biriktiring. Bu ikkala tomon uchun ham juda foydali.

3. **Real-world Projects (Haqiqiy loyihalar):**
   - Quruq nazariya o'rniga "Ertaga ushbu bilimiz bilan real sayt/bot yaratamiz" deb darsni jonli misolga bog'lang.

4. **Kichik g'alabalarni nishonlash:**
   - Hatto oddiy topshiriqni bajargan talabani ham guruh oldida e'tirof eting. Bu ularga ishonch bag'ishlaydi.

5. **Individual yondashuv:**
   - Darsdan so'ng muntazam dars qoldirayotgan o'quvchi bilan 2 daqiqa xoli suhbatlashing — sabab ko'pincha dars qiyinligida yoki shaxsiy muammoda bo'ladi.`;
  }

  // 11. Umumiy savollarga mantiqiy javob
  return `💡 **Topex AI Yordamchisi javobi:**

Hurmatli ${teacherName}, savolingizni qabul qildim:
*"${message}"*

Ushbu mavzu bo'yicha asosiy tavsiyalar va yechim:

1. **Rejalashtirish:** Avvalo mavzuni kichik va tushunarli bo'laklarga ajratib oling.
2. **Amaliy qo'llash:** Har bir tushuncha orqasidan darhol kichik amaliy misol yoki mashq bajartiring.
3. **Qayta aloqa (Feedback):** Mavzu oxirida talabalar o'z so'zlari bilan nima tushunganini so'rang.

Agar aniq dars rejasi, kod namunasi, test savollari yoki metodik qo'llanma kerak bo'lsa, mavzuni aniqroq yozing — darhol tayyorlab beraman! ✨`;
}

module.exports = {
  callGeminiAPI,
  generateSmartResponse
};
