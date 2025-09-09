import { Link } from "react-router-dom";
import Button from "./Button.jsx";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    return (
        <nav className="bg-white/80 backdrop-blur sticky top-0 z-40 border-b">
            <div className="container-page flex h-14 items-center gap-4">
                <Link to="/" className="font-semibold">🍳 RecipeBook</Link>
                <Link to="/recipes" className="text-sm text-gray-700 hover:text-gray-900">Recipes</Link>
                <Link to="/blogs" className="text-sm text-gray-700 hover:text-gray-900">Blog</Link>
                <div className="ml-auto flex items-center gap-3">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">Đăng nhập</Link>
                            <Link to="/register"><Button variant="primary" size="sm">Đăng ký</Button></Link>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => navigate("/recipes/create")}>+ Tạo công thức</Button>
                            <div className="flex items-center space-x-2">
                                <Link to="/profile" className="flex items-center">
                                    <img
                                        src={user.avatar}
                                        alt="avatar"
                                        className="h-8 w-8 rounded-full"
                                    />
                                    <span className="text-gray-700 ml-2">{user.fullname}</span>
                                </Link>
                            </div>
                            <Button variant="outline" size="sm" onClick={onLogout}>Đăng xuất</Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
