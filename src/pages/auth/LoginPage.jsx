import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../../store/slices/authSlice";
import { useLoginMutation } from "../../store/api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errMsg, setErrMsg] = useState("");

    const [login, { isLoading }] = useLoginMutation();

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrMsg("");
        try {
            const res = await login({ identifier, password }).unwrap();
            // backend có thể trả {token, user} hoặc {data:{token,user}}
            const data = res?.data ?? res;
            dispatch(setCredentials({ token: data?.token, user: data?.user }));
            navigate(from, { replace: true });
        } catch (err) {
            setErrMsg(err?.data?.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div className="container-page max-w-md">
            <h1 className="mb-4">Đăng nhập</h1>

            {errMsg && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errMsg}
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3 card p-4">
                <div>
                    <label className="mb-1 block text-sm">Email hoặc User Name</label>
                    <Input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm">Mật khẩu</label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm text-sky-600 hover:underline">
                        Quên mật khẩu?
                    </Link>
                </div>
                <p className="text-center text-sm text-gray-500">
                    Chưa có tài khoản? <Link to="/register" className="text-sky-600 hover:underline">Đăng ký</Link>
                </p>
            </form>
        </div>
    );
}
