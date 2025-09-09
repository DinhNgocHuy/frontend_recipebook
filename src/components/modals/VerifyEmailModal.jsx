import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import {
    useRequestVerifyEmailMutation,
    useConfirmVerifyCodeMutation,
} from "../../store/api/authApi";
import { setUser, logout } from "../../store/slices/authSlice";

export default function VerifyEmailModal({ open, onClose, afterVerified }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((s) => s.auth.user);
    const [code, setCode] = useState("");
    const [msg, setMsg] = useState("");

    const [requestVerify, { isLoading: sending }] = useRequestVerifyEmailMutation();
    const [confirmCode, { isLoading: confirming }] = useConfirmVerifyCodeMutation();

    useEffect(() => {
        if (!open) return;
        // mở modal lần đầu: gửi email luôn cho tiện
        (async () => {
            try {
                await requestVerify().unwrap(); // POST /auth/verify/request
                setMsg("Đã gửi email xác thực. Kiểm tra hộp thư để lấy mã OTP hoặc click đường link.");
            } catch (e) {
                setMsg(e?.data?.message || "Không gửi được email xác thực.");
            }
        })();
    }, [open]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await confirmCode(code.trim()).unwrap(); // POST /auth/verify/confirm-code
            // cập nhật state local: set emailVerified = true
            if (user) dispatch(setUser({ ...user, emailVerified: true }));
            setMsg("Xác thực thành công!");
            afterVerified?.();
            onClose?.();
            setTimeout(() => {
                dispatch(logout())
                navigate("/login", { replace: true })
                location.reload()
            }, 1500);
        } catch (e) {
            setMsg(e?.data?.message || "Mã không đúng hoặc đã hết hạn.");
        }
    };

    const onResend = async () => {
        setMsg("");
        try {
            await requestVerify().unwrap();
            setMsg("Đã gửi lại email xác thực.");
        } catch (e) {
            setMsg(e?.data?.message || "Gửi lại thất bại.");
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Xác thực email">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Một email kèm <b>đường link</b> và/hoặc <b>mã OTP</b> đã được gửi tới hộp thư của bạn.
                    Bạn có thể bấm link trong email hoặc nhập mã OTP dưới đây.
                </p>

                {msg && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{msg}</div>}

                <form onSubmit={onSubmit} className="flex items-center gap-2">
                    <Input
                        placeholder="Nhập mã OTP"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={confirming || !code.trim()}>
                        {confirming ? "Đang xác thực..." : "Xác nhận"}
                    </Button>
                </form>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Mã có hiệu lực trong thời gian giới hạn.</span>
                    <Button variant="outline" onClick={onResend} disabled={sending}>
                        Gửi lại email
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
