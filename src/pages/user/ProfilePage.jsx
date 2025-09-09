import { useDispatch, useSelector } from "react-redux";
import {
  useFetchProfileQuery,
  useUpdateInfoMutation,
  useLogoutMutation,
  useUploadAvatarMutation,
} from "../../store/api/authApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useEffect, useMemo, useState } from "react";
import { logout, setUser } from "../../store/slices/authSlice";
import { displayName, defaultAvatar } from "../../utils/userDisplay";
import { useGetUserRecipesQuery } from "../../store/api/recipeApi";
import RecipeCard from "../../components/RecipeCard";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  const { data: meData, isLoading: loadingMe } = useFetchProfileQuery(undefined, { skip: !token });
  const me = meData?.data || meData || {};

  // ====== Form state ======
  const [email, setEmail] = useState(me?.email || "");
  const [fullname, setFullname] = useState(me?.fullname || me?.fullName || me?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    setEmail(me?.email || "");
    setFullname(me?.fullname || me?.fullName || me?.name || "");
  }, [me?.email, me?.fullname, me?.fullName, me?.name]);

  // ====== Mutations ======
  const [updateInfo, { isLoading: updating }] = useUpdateInfoMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [doLogout, { isLoading: loggingOut }] = useLogoutMutation();

  const onSave = async (e) => {
    e.preventDefault();
    try {
      // 1) update info
      if (fullname?.trim() || email?.trim()) {
        const res = await updateInfo({ fullname: fullname?.trim(), email: email?.trim() }).unwrap();
        if (res?.user) dispatch(setUser(res.user));
      }
      // 2) upload avatar nếu có
      if (avatarFile instanceof File) {
        const r = await uploadAvatar(avatarFile).unwrap();
        if (r?.user) dispatch(setUser(r.user));
      }
      alert("Cập nhật hồ sơ thành công");
      window.location.reload();
    } catch (err) {
      console.error("Update profile error:", err);
      alert(err?.data?.message || "Cập nhật thất bại");
    }
  };

  const onLogout = async () => {
    try {
      await doLogout().unwrap();
      dispatch(logout());
    } catch { }
  };

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    setAvatarFile(f || null);
    if (f) setAvatarPreview(URL.createObjectURL(f));
    else setAvatarPreview("");
  };

  // ====== My Recipes ======
  const userId = me._id || me.id;

  const { data: listData, isLoading: loadingList } =
    useGetUserRecipesQuery({ userId, page: 1, limit: 100, sort: "newest" }, { skip: !token || !userId });

  const myRecipes = listData?.data?.items  || [];

  const myName = displayName(me);
  const avatarUrl = avatarPreview || me?.avatar || defaultAvatar;
  console.log("me:", me);
  console.log("myRecipes:", listData);

  return (
    <div className="container-page space-y-8">
      <div className="flex items-start gap-6">
        {/* Avatar + basic */}
        <div className="w-48 shrink-0">
          <img src={avatarUrl} alt={myName} className="w-48 h-48 object-cover rounded-full border" />
          <div className="mt-3">
            <input type="file" accept="image/*" onChange={onPickAvatar} />
            {uploading && <div className="text-sm text-gray-500 mt-1">Đang tải ảnh...</div>}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="flex-1 space-y-4">
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm">Tên hiển thị</label>
            <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={updating || uploading}>Lưu</Button>
            <Button variant="outline" onClick={onLogout} disabled={loggingOut}>Đăng xuất</Button>
          </div>
        </form>
      </div>

      {/* My recipes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Công thức của tôi</h2>
        {loadingList ? (
          <div>Đang tải...</div>
        ) : myRecipes?.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRecipes.map((r) => (
              <RecipeCard key={r._id} recipe={r} onView={(id) => (window.location.href = `/recipes/${id}`)} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Chưa có công thức nào.</div>
        )}
      </div>
    </div>
  );
}
