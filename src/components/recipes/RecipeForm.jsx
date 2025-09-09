import React, { useState } from "react";
import { useRef } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Button from "../ui/Button";
import LexicalEditor from "../editor/LexicalEditor";

/**
 * Reusable RecipeForm
 * Props:
 *  - initial: { title, summary, content, ingredients, steps, time, difficulty, servings, tags, category, thumbnailUrl }
 *  - submitting: boolean
 *  - onSubmit: (payload) => void  // payload includes thumbnailFile if chosen
 */
export default function RecipeForm({ initial = {}, submitting = false, onSubmit }) {
  const [title, setTitle] = useState(initial.title || "");
  const [summary, setSummary] = useState(initial.summary || "");
  const [content, setContent] = useState(initial.content || "");
  const [ingredients, setIngredients] = useState(initial.ingredients?.length ? initial.ingredients : [{ name: "", quantity: "", unit: "" }]);
  const [steps, setSteps] = useState(initial.steps?.length ? initial.steps : [""]);
  const [time, setTime] = useState(initial.time || 0);
  const [difficulty, setDifficulty] = useState(initial.difficulty || "");
  const [servings, setServings] = useState(initial.servings || 0);
  const [tags, setTags] = useState((initial.tags && Array.isArray(initial.tags)) ? initial.tags.join(", ") : (initial.tags || ""));
  const [thumbPreview, setThumbPreview] = useState(initial.thumbnailUrl || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const initialContentRef = useRef(initial.content || "");

  const updateIngredient = (idx, key, value) => {
    const next = [...ingredients];
    next[idx] = { ...next[idx], [key]: value };
    setIngredients(next);
  };
  const addIngredient = () => setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  const removeIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx));

  const updateStep = (idx, value) => {
    const next = [...steps];
    next[idx] = value;
    setSteps(next);
  };
  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (idx) => setSteps(steps.filter((_, i) => i !== idx));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setThumbnailFile(f || null);
    if (f) {
      const url = URL.createObjectURL(f);
      setThumbPreview(url);
    } else {
      setThumbPreview(initial.thumbnailUrl || "");
    }
  };

  const handleSubmit = (e) => {
    const diffMap = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
    const difficultyVN = diffMap[difficulty] || difficulty || "Dễ";

    // Backend muốn time là object
    const timeObj = (typeof time === "object" && time !== null)
      ? time
      : { prep: 0, cook: Number(time) || 0, total: Number(time) || 0 };

    e.preventDefault();
    const payload = {
      title: title.trim(),
      summary,
      content,
      ingredients: ingredients.filter(x => x.name?.trim()),
      steps: steps.filter(x => x && x.trim()),
      time: timeObj,
      difficulty: difficultyVN,
      servings: Number(servings) || 0,
      tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    if (thumbnailFile) payload.thumbnailFile = thumbnailFile;
    if (typeof onSubmit === "function") onSubmit(payload);
    console.log(payload);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-medium">Tiêu đề</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên món ăn..." required />
        </div>
        <div className="space-y-2">
          <label className="font-medium">Tags (phân tách bằng dấu phẩy)</label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="ví dụ: Việt Nam, gia đình, truyền thống" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Tóm tắt</label>
        <Textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Mô tả ngắn..." />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Nội dung / hướng dẫn chi tiết</label>
        <LexicalEditor initialHTML={initialContentRef.current} onChange={setContent} />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Ảnh thumbnail</label>
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" className="border border-gray-300 rounded p-2" onChange={handleFile} />
          {thumbPreview ? <img src={thumbPreview} alt="preview" className="h-20 w-32 object-cover rounded" /> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Nguyên liệu</label>
        <div className="space-y-3">
          {ingredients.map((it, idx) => (
            <div key={idx} className="grid md:grid-cols-3 gap-2 items-center">
              <Input placeholder="Tên" value={it.name} onChange={e => updateIngredient(idx, "name", e.target.value)} />
              <Input placeholder="Số lượng" type="number" value={it.quantity} onChange={e => updateIngredient(idx, "quantity", e.target.value)} />
              <div className="flex gap-2">
                <Input className="flex-1" placeholder="Đơn vị" value={it.unit} onChange={e => updateIngredient(idx, "unit", e.target.value)} />
                <Button type="button" variant="outline" onClick={() => removeIngredient(idx)}>Xóa</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addIngredient}>+ Thêm nguyên liệu</Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Các bước</label>
        <div className="space-y-3">
          {steps.map((s, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <Textarea className="flex-1" rows={2} placeholder={`Bước ${idx + 1}`} value={s} onChange={e => updateStep(idx, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeStep(idx)}>Xóa</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addStep}>+ Thêm bước</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="font-medium">Thời gian (phút)</label>
          <Input type="number" min="0" value={time} onChange={e => setTime(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <label className="font-medium">Độ khó</label>
          <Select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="">— Chọn —</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="font-medium">Khẩu phần</label>
          <Input type="number" min="0" value={servings} onChange={e => setServings(e.target.value)} />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu công thức"}</Button>
      </div>
    </form>
  );
}