// src/pages/BlogsPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import TagChip from "../components/ui/TagChip";
import Skeleton from "../components/ui/Skeleton";
import Pagination from "../components/ui/Pagination";

import {
    setSearch, setSort, setPage, setPageSize, clearFilters
} from "../store/slices/blogSlice";

import { useGetBlogsQuery } from "../store/api/blogApi";

export default function BlogsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Lấy state từ Redux store
    const blogState = useSelector((state) => state.blog || {});
    const {
        search = "",
        sortBy = "publishedAt",
        sortDir = "desc",
        page = 1,
        pageSize = 6
    } = blogState;

    // Tạo query args cho API
    const queryArgs = {
        q: search || undefined,
        page,
        pageSize,
        // Chuyển đổi từ Redux state sang format backend API expect
        sort: (() => {
            if (sortBy === "publishedAt" && sortDir === "desc") return "newest";
            if (sortBy === "publishedAt" && sortDir === "asc") return "oldest";
            if (sortBy === "title" && sortDir === "asc") return "title_az";
            if (sortBy === "title" && sortDir === "desc") return "title_za";
            return "newest";
        })()
    };

    const { data, isLoading, isError, error, refetch } = useGetBlogsQuery(queryArgs);

    const items = data?.items || [];
    const total = data?.total || 0;
    const currentPage = data?.page || page;
    const limit = data?.limit || pageSize;

    // Handle search input change
    const handleSearchChange = (e) => {
        dispatch(setSearch(e.target.value));
    };

    // Handle sort change  
    const handleSortChange = (e) => {
        const [by, dir] = e.target.value.split(":");
        dispatch(setSort({ by, dir }));
    };

    // Handle page size change
    const handlePageSizeChange = (e) => {
        dispatch(setPageSize(Number(e.target.value)));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        dispatch(setPage(newPage));
    };

    // Handle clear filters
    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    return (
        <div className="container-page space-y-6">
            <div className="flex items-center justify-between">
                <h1>Blogs</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                        ↻ Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid gap-3 md:grid-cols-3">
                <Input
                    placeholder="Tìm blog..."
                    value={search}
                    onChange={handleSearchChange}
                />
                <Select
                    value={`${sortBy}:${sortDir}`}
                    onChange={handleSortChange}
                >
                    <option value="publishedAt:desc">Mới nhất</option>
                    <option value="publishedAt:asc">Cũ nhất</option>
                    <option value="title:asc">Tiêu đề A→Z</option>
                    <option value="title:desc">Tiêu đề Z→A</option>
                </Select>

                <Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                >
                    {[6, 9, 12, 18].map((n) => (
                        <option key={n} value={n}>{n}/trang</option>
                    ))}
                </Select>
            </div>


            {/* Results Info */}
            {!isLoading && !isError && (
                <div className="text-sm text-gray-600">
                    Tìm thấy {total} kết quả
                    {search && ` cho từ khóa "${search}"`}
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: pageSize }).map((_, i) => (
                        <div key={i} className="card overflow-hidden">
                            <Skeleton className="aspect-[16/9]" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">
                        {error?.data?.message || "Không tải được dữ liệu"}
                    </p>
                    <Button onClick={() => refetch()}>Thử lại</Button>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Không tìm thấy blog nào</p>
                    {(search || tags.length > 0) && (
                        <Button variant="outline" onClick={handleClearFilters}>
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((blog) => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                onView={(id) => navigate(`/blogs/${id}`)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {total > limit && (
                        <Pagination
                            page={currentPage}
                            total={total}
                            limit={limit}
                            onChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}