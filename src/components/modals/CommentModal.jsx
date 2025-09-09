import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import {
    useAddCommentMutation,
    useDeleteMyCommentMutation,
} from "../../store/api/recipeApi";

export default function CommentModal({ open, onClose, recipeId, comments = [], afterSuccess }) {
    const me = useSelector((s) => s.auth.user);
    const [content, setContent] = useState("");

    const [addComment, { isLoading: adding }] = useAddCommentMutation();
    const [deleteComment, { isLoading: deleting }] = useDeleteMyCommentMutation();

    const ordered = useMemo(() => {
        const arr = Array.isArray(comments) ? [...comments] : [];
        try { arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); } catch {
            // ignore
        }
        return arr;
    }, [comments]);

    const onPost = async () => {
        if (!content.trim()) return;
        await addComment({ id: recipeId, content: content.trim() });
        setContent("");
        afterSuccess?.();
    };

    const onDelete = async (commentId) => {
        await deleteComment({ id: recipeId, commentId });
        afterSuccess?.();
    };

    return (
        <Modal open={open} onClose={onClose} title="Bình luận">
            <div className="space-y-4">
                <Textarea
                    placeholder="Viết bình luận..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                    <Button onClick={onPost} disabled={adding || !content.trim()}>
                        Gửi
                    </Button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-auto">
                    {ordered.map((c) => {
                        const id = c._id || c.id;
                        const ownerId = String(c.user?._id || c.user?.id || c.user);
                        const myId = String(me?._id || me?.id || "");
                        const canDelete = ownerId && myId && ownerId === myId;

                        return (
                            <div key={id} className="rounded-xl border bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                        {c.fullname || c.user?.fullname || "User"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                                    </div>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{c.content}</p>
                                {canDelete && (
                                    <div className="mt-2 flex justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete(id)}
                                            disabled={deleting}
                                        >
                                            Xoá
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!ordered.length && (
                        <p className="text-sm text-gray-500">Chưa có bình luận.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
}
