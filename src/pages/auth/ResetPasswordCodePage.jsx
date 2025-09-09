// src/pages/auth/ResetPasswordCodePage.jsx
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useResetPasswordByCodeMutation } from "../../store/api/authApi";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordCodePage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const prefillEmail = (params.get("email") || "").trim();

    const [email, setEmail] = useState(prefillEmail);
    const [code, setCode] = useState("");
    const [pwd, setPwd] = useState("");
    const [pwd2, setPwd2] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const [resetByCode, { isLoading, isSuccess }] = useResetPasswordByCodeMutation();

    useEffect(() => { if (prefillEmail) setEmail(prefillEmail); }, [prefillEmail]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setMsg("");
        if (!email) return setErr("Thiếu email.");
        if (!code) return setErr("Thiếu mã OTP.");
        if (pwd.length < 6) return setErr("Mật khẩu tối thiểu 6 ký tự.");
        if (pwd !== pwd2) return setErr("Xác nhận mật khẩu không khớp.");

        try {
            await resetByCode({ email, code, newPassword: pwd }).unwrap();
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
            <h1 className="mb-4">Đổi mật khẩu (bằng mã OTP)</h1>

            {err && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
            {msg && <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

            <form onSubmit={onSubmit} className="space-y-3 card p-4">
                <Input type="hidden" value={email} onChange={(e) => setEmail(e.target.value)} required disabled />
                <div>
                    <label className="mb-1 block text-sm">Mã OTP</label>
                    <Input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Mật khẩu mới</label>
                    <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Nhập lại mật khẩu</label>
                    <Input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} required />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
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
