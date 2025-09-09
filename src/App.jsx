import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/ui/Navbar";
import RecipesPage from "./pages/RecipesPage";
import BlogsPage from "./pages/BlogsPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import { useFetchProfileQuery } from "./store/api/authApi";
import { logout } from "./store/slices/authSlice";
import BlogDetailPage from "./pages/BlogDetailPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import GuestOnlyRoute from "./routes/GuestOnlyRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/user/ProfilePage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import CreatRecipePage from "./pages/recipes/CreateRecipePage";
import UpdateRecipePage from "./pages/recipes/UpdateRecipePage";

function Layout({ children }) {
  return <main className="py-6">{children}</main>;
}

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);


  useFetchProfileQuery(undefined, { skip: !token });

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={() => dispatch(logout())} />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="*" element={<Navigate to="/recipes" replace />} />

          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/recipes/create" element={<CreatRecipePage />} />
            <Route path="/recipes/update/:id" element={<UpdateRecipePage />} />
          </Route>

          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
