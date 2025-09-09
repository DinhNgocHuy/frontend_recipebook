// src/utils/userDisplay.js
export function displayName(u) {
    if (!u) return "Người dùng";
    return u.fullname?.trim() || u.username || "Người dùng";
}
export const defaultAvatar = "https://res.cloudinary.com/couldimagerecipebe/image/upload/v1753875465/avatar_default.png";