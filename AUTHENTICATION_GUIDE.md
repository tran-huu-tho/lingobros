# 🔐 Authentication Guide - LingoBros

## Overview
LingoBros hỗ trợ **4 phương thức đăng nhập** với Firebase Authentication + MongoDB:

1. **Google OAuth** - Đăng nhập nhanh với tài khoản Google
2. **Facebook OAuth** - Đăng nhập với tài khoản Facebook  
3. **Phone/SMS** - Đăng nhập với số điện thoại (OTP qua SMS)
4. **Email & Password** - Đăng nhập truyền thống với email/password

---

## 🏗️ Architecture

### Firebase Authentication
- **Client SDK** (`firebase/auth`): Xác thực người dùng
- **Admin SDK** (`firebase-admin`): Server-side verification
- **Storage**: Firebase Storage cho ảnh đại diện

### MongoDB Integration
- **User Model**: Lưu trữ profile, XP, hearts, streak, gems
- **Firebase UID Link**: `firebaseUid` field liên kết với Firebase Auth
- **Auto-sync**: User được tự động tạo/cập nhật khi đăng nhập

### Flow Diagram
```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Login Request
       ▼
┌─────────────────┐
│  Firebase Auth  │  ← Google/Facebook/Phone/Email
└────────┬────────┘
         │
         │ 2. Auth Token
         ▼
┌─────────────────┐
│  AuthContext    │  ← React Context API
└────────┬────────┘
         │
         │ 3. Create/Update User
         ▼
┌─────────────────┐
│  /api/auth/     │  ← Next.js API Route
│    signup       │
└────────┬────────┘
         │
         │ 4. Save to DB
         ▼
┌─────────────────┐
│    MongoDB      │  ← User Collection
│  (LingoBros DB) │
└─────────────────┘
```

---

## 📝 Implementation Details

### 1. AuthContext (`contexts/AuthContext.tsx`)

Quản lý authentication state và cung cấp methods:

```typescript
const {
  user,              // Firebase User object
  userData,          // MongoDB User data
  loading,           // Loading state
  
  // Methods
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail,
  signUpWithEmail,
  signInWithPhone,
  verifyPhoneCode,
  resetPassword,
  signOut,
} = useAuth();
```

### 2. Auth Modal (`components/auth/AuthModal.tsx`)

UI component với:
- **Tab switching**: Login ↔ Signup
- **Method switching**: Social ↔ Email ↔ Phone
- **Form validation**: Email format, password strength
- **OTP verification**: 6-digit code input
- **Error handling**: Hiển thị lỗi bằng tiếng Việt
- **Loading states**: Disable buttons khi đang xử lý

### 3. API Route (`app/api/auth/signup/route.ts`)

Server-side user creation:

```typescript
POST /api/auth/signup
Body: {
  firebaseUid: string,
  email: string,
  displayName: string,
  photoURL?: string
}

Response: {
  success: true,
  user: { ... }
}
```

**Logic:**
1. Tìm user theo `firebaseUid`
2. Nếu chưa tồn tại → Tạo mới với XP=0, hearts=5
3. Nếu đã tồn tại → Cập nhật `displayName`, `photoURL`, `lastActiveAt`

---

## 🔑 Demo Accounts

3 tài khoản mẫu đã được tạo sẵn:

| Email | Password | Role | XP | Streak |
|-------|----------|------|-----|--------|
| `demo@lingobros.com` | `password123` | User | 150 | 5 |
| `student@lingobros.com` | `password123` | User | 520 | 12 |
| `admin@lingobros.com` | `password123` | Admin | 9999 | ∞ |

**Firebase UIDs đã được link:**
- Demo: `84wHv3wVRIMwJR68zwosZ3unlOc2`
- Student: `Zl9J9sVFL8OB94N9DNK8LtF8Azk2`
- Admin: `m6goBBSI3ig0jhqiXSLG3uTGDq82`

---

## 🚀 Usage Examples

### 1. Google Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginButton() {
  const { signInWithGoogle } = useAuth();
  
  return (
    <button onClick={signInWithGoogle}>
      Đăng nhập với Google
    </button>
  );
}
```

### 2. Email/Password Login

```tsx
function EmailLoginForm() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      // Success - user redirected to dashboard
    } catch (error) {
      // Error toast automatically shown
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
```

### 3. Phone Login (2-step)

```tsx
function PhoneLoginForm() {
  const { signInWithPhone, verifyPhoneCode } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleSendOTP = async () => {
    const result = await signInWithPhone('+84' + phoneNumber);
    setConfirmationResult(result);
  };

  const handleVerifyOTP = async () => {
    await verifyPhoneCode(confirmationResult, otp);
    // Success
  };

  return (
    <>
      {!confirmationResult ? (
        <div>
          <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
          <button onClick={handleSendOTP}>Gửi OTP</button>
          <div id="recaptcha-container"></div>
        </div>
      ) : (
        <div>
          <input value={otp} onChange={e => setOtp(e.target.value)} />
          <button onClick={handleVerifyOTP}>Xác thực</button>
        </div>
      )}
    </>
  );
}
```

### 4. Signup with Email

```tsx
function SignupForm() {
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signUpWithEmail(email, password, displayName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Tên" value={displayName} onChange={e => setDisplayName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
```

---

## 🛡️ Security Features

### 1. Firebase Authentication
- ✅ Secure token-based authentication
- ✅ Auto token refresh
- ✅ Email verification support
- ✅ Password reset via email
- ✅ Rate limiting on auth endpoints

### 2. MongoDB Security
- ✅ Unique indexes on `email` and `firebaseUid`
- ✅ Server-side validation
- ✅ No password storage (Firebase handles it)
- ✅ Token verification on protected routes

### 3. Client Security
- ✅ HTTPS only (production)
- ✅ HTTP-only cookies for tokens
- ✅ XSS protection via React escaping
- ✅ CSRF protection via SameSite cookies

---

## 📱 Phone Authentication Setup

Phone auth cần cấu hình Firebase:

### 1. Enable Phone Authentication
```
Firebase Console → Authentication → Sign-in method → Phone
```

### 2. Add Test Phone Numbers (optional)
```
Firebase Console → Authentication → Settings → Test phone numbers
Example: +84 901234567 → 123456
```

### 3. ReCAPTCHA Configuration
- Tự động embed invisible reCAPTCHA
- Element ID: `recaptcha-container`
- Auto-clears sau mỗi lần verify

### 4. Phone Number Format
```javascript
// Vietnamese format
Input: 0901234567
Converted to: +84901234567

// International format
Input: +84901234567
Kept as: +84901234567
```

---

## 🎨 Toast Notifications

Sử dụng `react-hot-toast` để hiển thị thông báo:

### Success Messages
- ✅ "Đăng nhập thành công!"
- ✅ "Đăng ký thành công!"
- ✅ "Mã OTP đã được gửi!"
- ✅ "Xác thực thành công!"
- ✅ "Email đặt lại mật khẩu đã được gửi!"

### Error Messages
- ❌ "Tài khoản không tồn tại"
- ❌ "Mật khẩu không đúng"
- ❌ "Email không hợp lệ"
- ❌ "Email đã được sử dụng"
- ❌ "Mật khẩu quá yếu (tối thiểu 6 ký tự)"
- ❌ "Mã OTP không đúng"
- ❌ "Gửi OTP thất bại"

---

## 🧪 Testing

### Manual Testing

1. **Test Google Login:**
```bash
# Open browser → Click "Đăng nhập" → Choose Google
# Should redirect to dashboard after successful login
```

2. **Test Email Login:**
```bash
# Email: demo@lingobros.com
# Password: password123
```

3. **Test Phone Login:**
```bash
# Phone: +84901234567 (test number)
# OTP: 123456 (if configured in Firebase)
```

4. **Test Signup:**
```bash
# Create new account with any email
# Should create both Firebase user and MongoDB document
```

### Automated Testing (Future)
```typescript
// Example test with Vitest/Jest
describe('Authentication', () => {
  it('should login with email/password', async () => {
    const { signInWithEmail } = useAuth();
    await signInWithEmail('demo@lingobros.com', 'password123');
    expect(user).toBeDefined();
  });
});
```

---

## 🐛 Troubleshooting

### Issue: "Firebase: Error (auth/popup-blocked)"
**Solution:** Allow popups for localhost:3000

### Issue: "ReCAPTCHA verification failed"
**Solution:** 
- Check Firebase Console → Authentication → Settings
- Ensure domain is whitelisted
- Try using test phone numbers

### Issue: "User not found in MongoDB"
**Solution:**
- Check `/api/auth/signup` endpoint
- Verify MongoDB connection
- Check network tab for API errors

### Issue: "Invalid phone number format"
**Solution:**
- Ensure +84 country code
- Remove leading 0
- Example: 0901234567 → +84901234567

---

## 🔄 Migration Scripts

### Create Firebase Demo Accounts
```bash
node scripts/create-demo-accounts.js
```

### Link MongoDB Users with Firebase
```bash
node scripts/link-firebase-users.js
```

### Verify Sync
```bash
# Check MongoDB
mongosh lingobros --eval "db.users.find({}, {email: 1, firebaseUid: 1})"

# Check Firebase Console
# Authentication → Users → Should see 3 users
```

---

## 📚 References

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/security/)
- [React Hot Toast](https://react-hot-toast.com/)

---

## ✅ Checklist

- [x] Firebase Client SDK configured
- [x] Firebase Admin SDK configured
- [x] Google OAuth enabled
- [x] Facebook OAuth enabled
- [x] Phone authentication enabled
- [x] Email/Password authentication enabled
- [x] AuthContext implementation
- [x] AuthModal UI component
- [x] API route for user creation
- [x] MongoDB User model
- [x] Demo accounts created
- [x] Firebase ↔ MongoDB linking
- [x] Toast notifications
- [x] Error handling
- [x] Vietnamese translations
- [x] Documentation complete

🎉 **Authentication system is 100% ready!**
