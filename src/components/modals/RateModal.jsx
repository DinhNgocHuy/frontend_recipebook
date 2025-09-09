import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import RatingStars from "../ui/RatingStars";
import {
    useAddRatingMutation,
    useUpdateRatingMutation,
    useDeleteMyRatingMutation,
} from "../../store/api/recipeApi";

export default function RateModal({ open, onClose, recipeId, current, afterSuccess }) {
    const [value, setValue] = useState(5);
    const [content, setContent] = useState("");

    const [addRating, { isLoading: adding }] = useAddRatingMutation();
    const [updateRating, { isLoading: updating }] = useUpdateRatingMutation();
    const [deleteRating, { isLoading: deleting }] = useDeleteMyRatingMutation();

    useEffect(() => {
        if (!open) return;
        // map đúng field từ API: stars/comment
        setValue(current?.stars ?? current?.value ?? 5);
        setContent(current?.comment ?? current?.content ?? "");
    }, [open, current]);

    const onSave = async () => {
        const payload = { id: recipeId, value, content }; // API của bạn nhận {value, content}
        // nhận diện "đang sửa" theo stars (hoặc có _id)
        const isEditing = current?.stars != null || current?._id != null || current?.value != null;
        if (isEditing) await updateRating(payload);
        else await addRating(payload);
        afterSuccess?.();
        onClose?.();
    };

    const onDelete = async () => {
        await deleteRating(recipeId);
        afterSuccess?.();
        onClose?.();
    };
    
    return (
        <Modal open={open} onClose={onClose} title="Đánh giá công thức">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Số sao:</span>
                    <RatingStars value={value} editable onChange={setValue} />
                    <span className="text-sm text-gray-500">{value}/5</span>
                </div>

                <Textarea
                    placeholder="Nhận xét (không bắt buộc)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                <div className="flex items-center justify-end gap-2">
                    {current?.value != null && (
                        <Button variant="danger" onClick={onDelete} disabled={deleting}>
                            Xoá đánh giá
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={onSave} disabled={adding || updating}>
                        {adding || updating ? "Đang lưu..." : "Lưu"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
