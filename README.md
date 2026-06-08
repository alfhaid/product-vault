# Product Vault 🗃️

نظام إدارة المنتجات الشخصي مع QR قابل للمسح.

## خطوات الرفع على Vercel

### 1. ارفع المشروع على GitHub

```bash
# في terminal على جهازك
cd product-vault
git init
git add .
git commit -m "init"
```

ثم:
- اذهب لـ github.com → New repository
- اسمه `product-vault` → Create
- نفّذ الأوامر التي تظهر (git remote add origin ...)

---

### 2. ارفع على Vercel

- اذهب لـ [vercel.com](https://vercel.com) → Sign up with GitHub
- اضغط **Add New Project**
- اختر repository `product-vault`
- قبل الضغط Deploy، اضغط **Environment Variables** وأضف:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://lggulqwhtvayopsxbalg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (المفتاح الكامل) |
| `VITE_APP_URL` | *(اتركه فارغاً الآن، ستضيفه بعد أول deploy)* |

- اضغط **Deploy** وانتظر دقيقة

---

### 3. أضف رابط التطبيق

بعد اكتمال الـ Deploy، Vercel يعطيك رابطاً مثل:
`https://product-vault-xyz.vercel.app`

- ارجع لـ Vercel → Settings → Environment Variables
- أضف `VITE_APP_URL` = رابطك الكامل
- اضغط **Redeploy**

الآن الـ QR يفتح صفحة المنتج مباشرة عند المسح ✓

---

## كيف يعمل

```
مسح QR بالجوال
      ↓
يفتح: https://your-app.vercel.app/product/PRODUCT_ID
      ↓
يعرض كل بيانات المنتج + الفاتورة + حالة الضمان
```

## التقنيات

- **React + Vite** — frontend
- **Supabase** — قاعدة بيانات PostgreSQL مجانية
- **Vercel** — استضافة مجانية
- **Tailwind CSS** — تصميم
