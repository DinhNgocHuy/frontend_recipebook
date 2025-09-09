import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useConfirmVerifyTokenMutation } from "../../store/api/authApi";
import Button from "../../components/ui/Button";

export default function VerifyEmailPage() {
    const [params] = useSearchParams();
    const token = (params.get("token") || "").trim();

    const [confirmToken] = useConfirmVerifyTokenMutation();
    const [status, setStatus] = useState({ loading: true, ok: false, msg: "" });

    useEffect(() => {
        (async () => {
            try {
                if (!token) throw new Error("Thiếu token");
                await confirmToken(token).unwrap(); // POST /auth/verify/confirm
                setStatus({ loading: false, ok: true, msg: "Xác thực email thành công!" });
            } catch (e) {
                setStatus({
                    loading: false,
                    ok: false,
                    msg: e?.data?.message || "Token không hợp lệ hoặc đã hết hạn.",
                });
            }
        })();
    }, [token]);

    return (
        <div className="container-page max-w-lg space-y-4">
            <h1>Xác thực email</h1>
            {status.loading ? (
                <p>Đang xác thực...</p>
            ) : status.ok ? (
                <>
                    <p className="text-emerald-700">{status.msg}</p>
                    <Button asChild><Link to="/login">Đăng nhập</Link></Button>
                </>
            ) : (
                <>
                    <p className="text-red-600">{status.msg}</p>
                    <p className="text-sm text-gray-500">
                        Hãy thử đăng nhập và yêu cầu gửi lại email xác thực.
                    </p>
                    <Button asChild variant="outline"><Link to="/login">Về trang đăng nhập</Link></Button>
                </>
            )}
        </div>
    );
}
