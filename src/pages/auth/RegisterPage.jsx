import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials, logout } from "../../store/slices/authSlice";
import { useRegisterMutation } from "../../store/api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import VerifyEmailModal from "../../components/modals/VerifyEmailModal";

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [fullname, setFullname] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errMsg, setErrMsg] = useState("");

    // hỏi người dùng có muốn xác thực ngay không
    const [askVerify, setAskVerify] = useState(false);
    const [pendingCreds, setPendingCreds] = useState(null);

    // modal OTP
    const [verifyOpen, setVerifyOpen] = useState(false);

    const [register, { isLoading }] = useRegisterMutation();

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrMsg("");
        setAskVerify(false);

        if (password !== confirmPassword) {
            setErrMsg("Mật khẩu nhập lại không khớp");
            return;
        }

        try {
            const res = await register({ username, email, fullname, password, confirmPassword }).unwrap();
            const data = res?.data ?? res;

            // Lưu lại creds tạm để dùng khi người dùng chọn "Xác thực ngay"
            setPendingCreds({ token: data?.token, user: data?.user });
            setAskVerify(true); // Hiện khối xác nhận: Xác thực ngay / Để sau
        } catch (e) {
            setErrMsg(e?.data?.message || "Đăng ký thất bại");
        }
    };

    // Người dùng chọn "Xác thực ngay"
    const startVerifyNow = async () => {
        if (!pendingCreds?.token) {
            // Nếu server không trả token sau đăng ký, buộc quay về login
            navigate("/login", { replace: true });
            return;
        }
        // Nạp token tạm vào Redux để gọi /auth/verify/* trong modal
        // skipStoreToken: true -> KHÔNG lưu localStorage, tránh bị GuestOnlyRoute đá
        dispatch(setCredentials({ ...pendingCreds, skipStoreToken: true }));
        setAskVerify(false);
        setVerifyOpen(true); // mở modal (modal sẽ tự gửi email verify khi open)
    };

    // Người dùng chọn "Để sau"
    const verifyLater = () => {
        setAskVerify(false);
        navigate("/login", { replace: true });
    };

    return (
        <div className="mx-auto max-w-md py-6">
            <h1 className="mb-4 text-center text-2xl font-semibold">Đăng ký</h1>

            {errMsg && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errMsg}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3 card p-4">
                <div>
                    <label className="mb-1 block text-sm">User Name</label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Email</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Tên hiển thị</label>
                    <Input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Mật khẩu</label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Nhập lại mật khẩu</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
                </Button>

                <p className="text-center text-sm text-gray-500">
                    Đã có tài khoản? <Link to="/login" className="text-sky-600 hover:underline">Đăng nhập</Link>
                </p>
            </form>

            {/* Hỏi người dùng sau khi đăng ký xong */}
            {askVerify && (
                <div className="card mt-4 p-4">
                    <p className="mb-2">Bạn có muốn xác thực email ngay bây giờ không (để tiện reset mật khẩu sau này)?</p>
                    <div className="flex gap-2">
                        <Button onClick={startVerifyNow}>Xác thực ngay</Button>
                        <Button variant="outline" onClick={verifyLater}>Để sau (về đăng nhập)</Button>
                    </div>
                </div>
            )}

            <VerifyEmailModal
                open={verifyOpen}
                onClose={() => setVerifyOpen(false)}
                afterVerified={() => {
                    // Verified xong -> đăng xuất token tạm và điều hướng về login
                    dispatch(logout());
                    navigate("/login", { replace: true });
                }}
            />
        </div>
    );
}
