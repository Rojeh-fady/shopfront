# Shopfront — E-commerce Front End

متجر إلكتروني (Front End فقط) مبني على **React + Vite + Zustand + React Router**، وبيستخدم [Fake Store API](https://fakestoreapi.com) من غير أي باك إند حقيقي.

## التشغيل

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build في فولدر dist
npm run preview  # تجربة الـ build
```

## المميزات

- **صفحة المنتجات**: عرض كل المنتجات، بحث (debounced)، فلترة بالـ category والسعر، وترتيب (السعر، التقييم، الاسم).
  الفلاتر محفوظة في الـ URL (`?q=bag&cat=electronics&sort=price-asc`) فينفع تعمل share أو تستخدم زرار Back.
- **صفحة تفاصيل المنتج**: صورة، وصف، تقييم، اختيار الكمية، Add to cart / Buy now، ومنتجات مشابهة.
- **السلة**: تعديل الكمية، حذف، إجمالي، شحن مجاني فوق $100، وبتتحفظ في `localStorage`.
- **الدفع (3 خطوات)**: Shipping → Payment → Review. فيه validation كامل (إيميل، تليفون، كارت بـ Luhn، تاريخ انتهاء)، وخيار Cash on Delivery.
- **صفحة نجاح الطلب** بملخص الأوردر.
- **Responsive**: موبايل / تابلت / ديسكتوب، مع skeleton loading وحالات error وempty.

> كارت تجريبي للدفع: `4242 4242 4242 4242` — أي تاريخ مستقبلي وأي CVC. مفيش أي فلوس بتتسحب.

## هيكل المشروع

```
src/
├── lib/
│   ├── api.js          # Fake Store API + cache بسيط
│   ├── pricing.js      # حسابات السعر والشحن وformatting
│   └── validators.js   # validation للفورم + Luhn
├── store/
│   ├── cartStore.js    # Zustand (persist → localStorage)
│   ├── checkoutStore.js# بيانات الدفع وآخر أوردر (sessionStorage)
│   └── toastStore.js
├── hooks/              # useAsync (fetch + abort + retry), useDebounce
├── components/         # Layout, ProductCard, Rating, QtyControl, OrderSummary, States
├── pages/              # Products, ProductDetails, Cart, Checkout, OrderSuccess, NotFound
├── App.jsx             # الـ routes
└── styles.css
```

## الـ Routes

| Path | الصفحة |
| --- | --- |
| `/` | المنتجات + الفلاتر |
| `/product/:id` | تفاصيل المنتج |
| `/cart` | السلة |
| `/checkout` | خطوات الدفع |
| `/order-success` | تأكيد الطلب |

## ملاحظات

- Fake Store API بتقبل `POST /carts` لكن مبتحفظش حاجة، فالأوردر بيتبعت للـ API وبيتحفظ محليًا بس لعرض صفحة النجاح.
- أفكار للتطوير: Pagination، Wishlist، Dark mode، تسجيل دخول عن طريق `/auth/login` في نفس الـ API، اختبارات بـ Vitest + Testing Library.
