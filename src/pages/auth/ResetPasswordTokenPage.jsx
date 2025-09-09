// src/pages/auth/ResetPasswordTokenPage.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useResetPasswordByTokenMutation } from "../../store/api/authApi";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordTokenPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = (params.get("token") || "").trim();

    const [pwd, setPwd] = useState("");
    const [pwd2, setPwd2] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const [resetByToken, { isLoading, isSuccess }] = useResetPasswordByTokenMutation();

    useEffect(() => {
        if (!token) setErr("Thiếu hoặc sai token.");
    }, [token]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");
        if (pwd.length < 6) return setErr("Mật khẩu tối thiểu 6 ký tự.");
        if (pwd !== pwd2) return setErr("Xác nhận mật khẩu không khớp.");
        try {
            await resetByToken({ token, newPassword: pwd }).unwrap();
            setMsg("Đổi mật khẩu thành công. Bạn có thể đăng nhập lại.");
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (e) {
            setErr(e?.data?.message || "Đổi mật khẩu thất bại.");
        }
    };

    return (
        <div className="container-page max-w-md">
            <h1 className="mb-4">Đổi mật khẩu (theo link)</h1>

            {err && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
            {msg && <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

            <form onSubmit={onSubmit} className="space-y-3 card p-4">
                <div>
                    <label className="mb-1 block text-sm">Mật khẩu mới</label>
                    <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Nhập lại mật khẩu</label>
                    <Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} required />
                </div>

                <Button type="submit" disabled={isLoading || !token} className="w-full">
                    {isLoading ? "Đang đổi..." : "Đổi mật khẩu"}
                </Button>

                {isSuccess && (
                    <p className="text-center text-sm">
                        <Link to="/login" className="text-sky-600 hover:underline">Về trang đăng nhập</Link>
                    </p>
                )}
            </form>
        </div>
    );
}
