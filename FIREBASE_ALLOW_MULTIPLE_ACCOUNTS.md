# Cho phép cùng Email với nhiều Provider (Google & Facebook)

## Vấn đề 1: Unauthorized Domain Error

### Lỗi:
```
Firebase: Error (auth/unauthorized-domain)
```

### Nguyên nhân:
IP `10.10.0.192` (hoặc domain khác) chưa được thêm vào Authorized domains

### Giải pháp:
1. Vào Firebase Console: https://console.firebase.google.com
2. Chọn project **LingoBros**
3. **Authentication** → **Settings** tab
4. Scroll xuống **Authorized domains**
5. Click **Add domain**
6. Thêm các domain sau:
   - `localhost`
   - `10.10.0.192` (hoặc IP máy bạn)
   - Domain production của bạn
7. Click **Add**

---

## Vấn đề 2: Multiple Accounts với cùng Email

### Vấn đề hiện tại:
Firebase mặc định **KHÔNG CHO PHÉP** cùng 1 email đăng nhập bằng nhiều provider khác nhau.
- Email: test@gmail.com đăng nhập Facebook → OK
- Cùng email test@gmail.com đăng nhập Google → ❌ Lỗi conflict

### Giải pháp: Cho phép Multiple Accounts

#### Bước 1: Vào Firebase Console
1. Truy cập: https://console.firebase.google.com
2. Chọn project **LingoBros** của bạn

#### Bước 2: Vào Authentication Settings
1. Click menu bên trái: **Authentication**
2. Click tab: **Settings** (ở trên cùng)
3. Scroll xuống phần: **User account linking**

#### Bước 3: Chọn "Create multiple accounts"
Bạn sẽ thấy 2 options:
- ⭕ Link accounts that use the same email
- ⭕ **Create multiple accounts for each identity provider** ← Chọn cái này

#### Bước 4: Save
- Click **Save**

## Kết quả:
✅ Giờ cùng 1 email có thể:
- Đăng nhập Google → Account A
- Đăng nhập Facebook → Account B (riêng biệt)

## Lưu ý:
- Đây là hành vi **tách biệt hoàn toàn** 2 accounts
- User sẽ có 2 profiles khác nhau trong database
- Nếu muốn merge data sau này sẽ khó hơn

---
**Sau khi config xong, thử:**
1. Đăng nhập Facebook với email X
2. Logout  
3. Đăng nhập Google với cùng email X
4. ✅ Sẽ tạo 2 accounts riêng biệt!
