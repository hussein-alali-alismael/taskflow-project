# TaskFlow - نظام إدارة المشاريع والمهام 📊

نظام web متكامل لإدارة فريق العمل والمهام مع لوحة تحكم شاملة.

## 🎯 الميزات

- ✅ إدارة الأعضاء (إضافة، تعديل، حذف)
- ✅ إنشاء وتعيين المهام
- ✅ متابعة تقدم المهام
- ✅ نظام admin و member roles
- ✅ واجهة عصرية مع React
- ✅ API RESTful مع Django
- ✅ قابل للتوسع والصيانة

---

## 🛠️ التقنيات المستخدمة

### Backend
- **Django 5.2.8** - Framework web
- **Django REST Framework** - API
- **PostgreSQL** - قاعدة بيانات (إنتاج)
- **Gunicorn** - WSGI server

### Frontend
- **React 18** - مكتبة UI
- **Vite** - build tool
- **React Router** - routing
- **Context API** - state management

---

## 📋 المتطلبات

- Python 3.13+
- Node.js 18+

---

## 🚀 التثبيت المحلي

### 1. استنساخ المشروع
```bash
git clone <repo-url>
cd taskflow
```

### 2. إعداد Backend

```bash
# إنشاء virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# تثبيت المتطلبات
pip install -r requirements.txt

# إعداد قاعدة البيانات
python manage.py migrate

# إنشاء superuser (اختياري)
python manage.py createsuperuser

# تشغيل السيرفر
python manage.py runserver
```

Backend متاح على: http://localhost:8000

### 3. إعداد Frontend

```bash
cd frontend

# تثبيت المتطلبات
npm install

# تشغيل dev server
npm run dev
```

Frontend متاح على: http://localhost:3000

---

## 📚 البنية

```
taskflow/
├── taskflow/                   # Backend (Django)
│   ├── core/             
│   │   ├── models.py           
│   │   ├── views.py      
│   │   ├── services.py         # Logic business
│   │   └── repositories.py     # Data arraived
│   └── settings.py             # Django setting
├── frontend/                   # Frontend (React)
│   ├── src/
│   │   ├── pages/              # Main pages
│   │   ├── components/  
│   │   ├── context/            # Context API
│   │   └── hooks/              # Custom hooks
│   └── package.json
├── requirements.txt            # Python requierments
```

---

##  المفاهيم المعمارية

### Service + Repository Pattern
- **Repository**: وصول البيانات
- **Service**: منطق العمل
- **View**: واجهة HTTP

### Context API + Hooks
- **AuthContext**: إدارة المصادقة
- **TaskContext**: إدارة المهام
- **TeamContext**: إدارة الأعضاء
- **Custom Hooks**: واجهات سهلة الاستخدام

---

## 📡 API Endpoints

### Authentication
```
POST   /login/              - تسجيل دخول
POST   /register/           - إنشاء حساب
POST   /logout/             - تسجيل خروج
```

### Tasks
```
GET    /api/assignments/    - قائمة المهام
POST   /add-task/           - إضافة مهمة
POST   /edit-task/<id>/     - تعديل مهمة
POST   /delete-task/<id>/   - حذف مهمة
POST   /mark-task-complete/<id>/ - إكمال مهمة
```

### Members
```
GET    /api/members/        - قائمة الأعضاء
POST   /add-member/         - إضافة عضو
POST   /edit-member/<id>/   - تعديل عضو
POST   /delete-member/<id>/ - حذف عضو
```

---


##  الأمان

-  CSRF protection
-  CORS configuration
-  SESSION security
-  Secret key management
-  HTTPS support

---

##  الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي والتعليمي.

---

##  تطوير مستقبلي

- [ ] إضافة نظام الإشعارات
- [ ] تقارير متقدمة وإحصائيات
- [ ] نظام الأدوار والصلاحيات (Permissions)
- [ ] تقويم المشاريع
- [ ] chat/comments على المهام
- [ ] الملفات والمرفقات
- [ ] Mobile app

---

##  الدعم

للأسئلة والدعم:
- أنشئ issue في GitHub
- أرسل بريد إلى: support@example.com

---

**تم تطويره من قبل فريق Infinty Sentax**


Copy dist contents into Django static files (or add to STATICFILES_DIRS) then run python manage.py collectstatic and serve with WhiteNoise or Nginx.
Or let an external web server (Nginx) serve static files and proxy API requests to Django.
Ensure ALLOWED_HOSTS is set, DEBUG=False, and STATIC_ROOT and WhiteNoise are configured in settings.py.
