import { useDispatch, useSelector } from "react-redux";
import { useFetchProfileQuery, useUpdateProfileMutation, useLogoutMutation } from "../../store/api/authApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useEffect, useState } from "react";
import { logout, setUser } from "../../store/slices/authSlice";

export default function ProfilePage() {
    const dispatch = useDispatch();
    const token = useSelector((s) => s.auth.token);

    const { data: meData, isLoading } = useFetchProfileQuery(undefined, { skip: !token });
    const me = meData?.data || meData || {};

    console.log('data', me);

    const [fullname, setFullname] = useState(me?.fullname || me?.name || "");
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation?.() || [() => { }, { isLoading: false }];
    const [doLogout, { isLoading: loggingOut }] = useLogoutMutation();

    useEffect(() => {
        setFullname(me?.fullname || me?.name || "");
    }, [me?.fullname, me?.name]);

    const onSave = async (e) => {
        e.preventDefault();
        if (!updateProfile) return;
        const res = await updateProfile({ fullname }).unwrap();
        const updated = res?.data ?? res;
        dispatch(setUser(updated));
    };

    const onLogout = async () => {
        try { await doLogout().unwrap(); } catch { }
        dispatch(logout());
    };

    if (isLoading) {
        return <div className="container-page">Đang tải hồ sơ…</div>;
    }

    return (
        <div className="container-page max-w-xl space-y-4">
            <h1>Hồ sơ</h1>

            <form onSubmit={onSave} className="card p-4 space-y-3">
                <div>
                    <label className="mb-1 block text-sm">Email</label>
                    <Input value={me?.email || ""} disabled />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Tên hiển thị</label>
                    <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
                </div>

                <div className="flex items-center gap-2">
                    {updateProfile && (
                        <Button type="submit" disabled={updating}>Lưu</Button>
                    )}
                    <Button variant="outline" onClick={onLogout} disabled={loggingOut}>Đăng xuất</Button>
                </div>
            </form>
        </div>
    );
}
