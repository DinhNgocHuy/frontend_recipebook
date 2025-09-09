# Frontend RecipeBook

Ứng dụng **Frontend RecipeBook** – giao diện web cho hệ thống Sổ tay Công Thức Nấu Ăn, xây bằng **React + Vite** và **Redux Toolkit**. Dự án kết nối tới backend Express/MongoDB (đã triển khai riêng) để cung cấp các tính năng đăng ký/đăng nhập, xác thực email, quên mật khẩu, quản lý công thức, blog, đánh giá & bình luận.

> Lưu ý: README này được viết theo stack chuẩn của dự án React + Vite của bạn. Nếu cấu trúc thư mục có khác, bạn chỉ cần cập nhật lại phần “Cấu trúc thư mục”.

---

## 🎯 Tính năng chính

- 🔐 **Xác thực & Phân quyền**
  - Đăng ký / Đăng nhập (JWT, lưu token phía client)
  - Xác thực email (nhập OTP hoặc qua link)
  - **Quên mật khẩu** → gửi mail đặt lại → đặt mật khẩu mới
  - Cập nhật thông tin cá nhân, đổi email (đặt lại trạng thái xác thực email)
- 📖 **Công thức (Recipes)**
  - Danh sách, chi tiết, tìm kiếm, lọc
  - Thêm/Sửa/Xóa công thức (tác giả)
  - Đánh giá (1–5 sao), bình luận
- 📰 **Blog**
  - Danh sách, chi tiết, tìm kiếm, sắp xếp
  - Bình luận (chống spam cơ bản phía client)
- ⭐ **Yêu thích / Lưu trữ** (nếu có)
- 💬 **Thông báo UI**: toast, modal xác nhận, loading state
- 📱 **Responsive** cho desktop/tablet/mobile

---

## 🧱 Công nghệ

- **Vite + React 18**
- **Redux Toolkit** + `react-redux` (quản lý state)
- **React Router** (điều hướng)
- **Axios** (gọi API, interceptor gắn JWT)
- **ESLint** (quy tắc code)
- UI tùy chọn: Tailwind CSS / Ant Design / Material UI (tùy bạn đang dùng)

---

## ⚙️ Yêu cầu môi trường

- Node.js >= 18
- NPM >= 9 (hoặc dùng pnpm/yarn nếu thích)

---

## 🚀 Bắt đầu

```bash
# 1) Clone
git clone https://github.com/TannHV/frontend_recipebook.git
cd frontend_recipebook

# 2) Cài đặt gói
npm i

# 3) Tạo file .env từ .env.example và sửa giá trị
cp .env.example .env

# 4) Chạy dev
npm run dev
# Mặc định Vite chạy tại http://localhost:5173

# 5) Build & preview
npm run build
npm run preview
```

---

## 🔑 Biến môi trường (`.env`)

Ví dụ (điều chỉnh theo backend của bạn):

```
# URL backend (Render/Heroku/localhost)
VITE_API_URL=https://your-backend.example.com/api

# Prefix để lưu key vào localStorage/sessionStorage
VITE_STORAGE_KEY_PREFIX=recipebook_
```

> **Mẹo**: nếu bạn dùng nhiều môi trường, thêm `.env.development` / `.env.production` với các giá trị khác nhau.

---

## 📁 Cấu trúc thư mục gợi ý

> Điều chỉnh cho khớp code thực tế của bạn.

```
src/
  api/                 # axios instance, services gọi API
  components/          # button, input, modal, layout...
  features/            # Redux slices (auth, recipe, blog, user...)
  hooks/               # custom hooks (useAuth, useDebounce...)
  pages/               # trang (Home, Recipes, RecipeDetail, Blog, Profile...)
  routes/              # cấu hình route bảo vệ (PrivateRoute, AdminRoute...)
  utils/               # helpers (formatTime, validators, storage...)
  assets/              # ảnh, icon, fonts
  styles/              # global.css, tailwind.css (nếu dùng)
  main.jsx
  App.jsx
```

---

## 🧭 Điều hướng (gợi ý)

| Đường dẫn | Mô tả |
|---|---|
| `/` | Trang chủ |
| `/recipes` | Danh sách công thức + tìm kiếm/lọc |
| `/recipes/:id` | Chi tiết công thức, rating & comment |
| `/recipes/new` | Tạo công thức (cần đăng nhập) |
| `/recipes/:id/edit` | Sửa công thức (chỉ tác giả) |
| `/blogs` | Danh sách blog + tìm kiếm/sort |
| `/blogs/:id` | Chi tiết blog |
| `/auth/sign-in` | Đăng nhập |
| `/auth/sign-up` | Đăng ký |
| `/forgot-password` | Nhập email nhận link/code |
| `/reset-password` | Đặt mật khẩu mới (token/OTP) |
| `/verify-email` | Xác thực email |
| `/profile` | Hồ sơ người dùng, đổi thông tin |
| `/profile/recipes` | Công thức của tôi |

---

## 🧩 Redux Slices (ví dụ)

- `authSlice`: login/logout, register, verify email, forgot/reset password, refresh profile
- `recipeSlice`: list/search/filter, detail, create/update/delete, rate/comment
- `blogSlice`: list/search/sort, detail, comment
- `uiSlice` (tuỳ chọn): loading, toast, modal

> Mỗi slice nên dùng **createAsyncThunk** để gọi API; xử lý pending/fulfilled/rejected để hiện loading & thông báo.

---

## 🌐 Lớp gọi API (Axios)

- Tạo `api/axios.js` với `baseURL = import.meta.env.VITE_API_URL`
- **Request interceptor**: gắn `Authorization: Bearer <token>` nếu có
- **Response interceptor**: bắt lỗi 401 → đá về `/auth/sign-in` khi token hết hạn
- Chuẩn hóa lỗi để hiển thị toast dễ hiểu

---

## 🔒 Bảo vệ route

- Tạo `PrivateRoute` kiểm tra `auth.isAuthenticated`
- Nếu chưa đăng nhập → chuyển hướng `/auth/sign-in?next=<path>`
- Với trang cần quyền tác giả (sửa công thức) → kiểm tra `recipe.authorId === user.id`

---

## 🧪 Kiểm thử (tùy chọn)

- Test component với `@testing-library/react`
- Test logic slice với Jest (mock API)

---

## 🧹 Scripts (NPM)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

---

## 📦 Triển khai

- **Netlify/Vercel**: Build command `npm run build`, output directory `dist`
- Cấu hình biến `VITE_API_URL` trên dashboard deploy
- Nếu backend khác domain, bật CORS phía server

---


