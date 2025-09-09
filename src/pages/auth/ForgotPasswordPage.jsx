// src/pages/auth/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useForgotPasswordMutation } from "../../store/api/authApi";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState("");
    const [forgot, { isLoading }] = useForgotPasswordMutation();

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        try {
            await forgot(email).unwrap();
            setSent(true);
        } catch (e) {
            setErr(e?.data?.message || "Gửi email thất bại. Thử lại sau.");
        }
    };

    return (
        <div className="container-page max-w-md">
            <h1 className="mb-4">Quên mật khẩu </h1>

            {err && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {err}
                </div>
            )}

            {!sent ? (
                <form onSubmit={onSubmit} className="space-y-3 card p-4">
                    <div>
                        <label className="mb-1 block text-sm">Email đã đăng ký</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Đang gửi..." : "Gửi email khôi phục"}
                    </Button>

                    <p className="text-center text-sm text-gray-500">
                        Nhớ mật khẩu rồi? <Link to="/login" className="text-sky-600 hover:underline">Đăng nhập</Link>
                    </p>
                </form>
            ) : (
                <div className="card p-4 space-y-3">
                    <p>Email khôi phục đã được gửi (nếu email tồn tại trong hệ thống).</p>
                    <ol className="list-disc pl-5 text-sm text-gray-600">
                        <li>Trong email, bạn sẽ nhận được <b>link</b> và mẫ <b>OTP</b>để đổi mật khẩu.</li>
                        <li>Bạn có thể nhấn trực tiếp vào link hoặc chọn <b>đổi bằng mã OTP dưới đây </b> để nhập mã OTP</li>
                    </ol>

                    <Button asChild className="w-full">
                        <Link to={`/reset-password/code?email=${encodeURIComponent(email)}`}>Đổi bằng mã OTP</Link>
                    </Button>   

                        <p className="text-xs text-gray-500">Nếu không thấy mail, kiểm tra hộp thư rác/Spam.</p>
                </div>
            )}
        </div>
    );
}
