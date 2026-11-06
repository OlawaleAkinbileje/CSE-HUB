"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Plus,
    Folder,
    Search,
    Archive,
    ChevronRight,
} from "lucide-react";
import { useAdminCategories, CategoryItem, CourseItem } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminCategoriesPage() {
    const [searchCategory, setSearchCategory] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<string>("");

    const { data: catData, isLoading } = useAdminCategories();
    const categories = catData?.categories || [];
    const courses = catData?.courses || [];

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    const selectedCat = categories.find((c) => c.id === selectedCatId) || categories[0] || {
        id: "cat-1",
        name: "General Resources",
        resourceCount: 0,
        courseCount: 0,
        subcategoryCount: 0,
        status: "Active" as const,
        parent: "None — Top-level category",
        description: "Default academic resource category.",
    };

    const [formData, setFormData] = useState({
        name: selectedCat.name,
        parent: selectedCat.parent,
        description: selectedCat.description,
    });

    const handleSelectCategory = (cat: CategoryItem) => {
        setSelectedCatId(cat.id);
        setFormData({
            name: cat.name,
            parent: cat.parent,
            description: cat.description,
        });
    };

    const handleSave = () => {
        alert(`Saved changes for category: ${formData.name}`);
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            {/* Top Navigation */}
            <Navbar userRole="admin" />

            {/* Main Shell */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Left Sidebar */}
                <Sidebar userRole="admin" />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <div className="space-y-6">
                        {/* Header Title Section & Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    Categories & Courses
                                </h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    Structure how learning materials, lecture notes, and past questions are organised.
                                </p>
                            </div>

                            <button
                                onClick={() => alert("Creating new category...")}
                                className="h-11 px-5 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Category</span>
                            </button>
                        </div>

                        {/* Split Hierarchy Workspace */}
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                            {/* Left Column: Category Hierarchy Tree */}
                            <div className="w-full lg:w-[320px] shrink-0 bg-white p-5 rounded-xl border border-[#E1E6F3] space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-[#0B123D]">Category Tree</h3>
                                    <span className="text-xs text-[#64708C]">{categories.length} total</span>
                                </div>

                                <div className="relative">
                                    <Search className="w-4 h-4 text-[#64708C] absolute left-3 top-3.5 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="w-full h-10 pl-9 pr-3 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] placeholder-[#64708C] focus:outline-none focus:border-[#245CFF]"
                                    />
                                </div>

                                <div className="text-[11px] text-[#64708C]">Category name · Resource count</div>

                                {/* List Items wrapped in DataContainer */}
                                <DataContainer
                                    isLoading={isLoading}
                                    data={filteredCategories}
                                    emptyIcon={Folder}
                                    emptyTitle="No Categories"
                                    emptyDescription="No categories found matching criteria."
                                    skeletonCount={4}
                                    skeletonType="rows"
                                >
                                    {(items) => (
                                        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                                            {items.map((cat) => {
                                                const isSelected = selectedCat.id === cat.id;
                                                const isSubcategory = cat.parent !== "None — Top-level category";

                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => handleSelectCategory(cat)}
                                                        className={`w-full h-11 px-3 rounded-lg flex items-center justify-between text-xs transition-colors ${isSubcategory ? "pl-7" : ""
                                                            } ${isSelected
                                                                ? "bg-[#E9EDFF] text-[#245CFF] font-semibold"
                                                                : "bg-white text-[#0B123D] hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <Folder
                                                                className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#245CFF]" : "text-[#64708C]"
                                                                    }`}
                                                            />
                                                            <span className="truncate">{cat.name}</span>
                                                        </div>
                                                        <span className="text-[11px] text-[#64708C] font-normal shrink-0">
                                                            {cat.resourceCount}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </DataContainer>
                            </div>

                            {/* Detail Editor Panel */}
                            <div className="flex-1 w-full space-y-6">
                                {categories.length > 0 ? (
                                    <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] space-y-5">
                                        <div className="flex items-center justify-between gap-3 flex-wrap">
                                            <h2 className="text-xl font-bold text-[#0B123D]">{selectedCat.name}</h2>

                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-[11px] font-semibold rounded-full">
                                                    {selectedCat.status}
                                                </span>
                                                <button className="h-9 px-3.5 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
                                                    <Archive className="w-3.5 h-3.5" />
                                                    <span>Archive</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Summary Pills */}
                                        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
                                            <span className="px-3 py-1 bg-[#E9EDFF] text-[#245CFF] rounded-full">
                                                {selectedCat.resourceCount} resources
                                            </span>
                                            <span className="px-3 py-1 bg-[#E9EDFF] text-[#245CFF] rounded-full">
                                                {selectedCat.courseCount} linked courses
                                            </span>
                                            <span className="px-3 py-1 bg-[#F2EDFF] text-[#7148FF] rounded-full">
                                                {selectedCat.subcategoryCount} subcategories
                                            </span>
                                        </div>

                                        {/* Edit Form */}
                                        <div className="space-y-4 pt-1">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[#0B123D]">
                                                    Category name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[#0B123D]">
                                                    Parent category
                                                </label>
                                                <select
                                                    value={formData.parent}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, parent: e.target.value })
                                                    }
                                                    className="w-full h-11 px-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                                >
                                                    <option value="None — Top-level category">None — Top-level category</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.name}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-[#0B123D]">
                                                    Description
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.description}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, description: e.target.value })
                                                    }
                                                    className="w-full p-3.5 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] focus:outline-none focus:border-[#245CFF]"
                                                />
                                            </div>

                                            <div className="pt-2 flex items-center justify-end gap-3">
                                                <button
                                                    onClick={handleSave}
                                                    className="h-10 px-5 bg-[#245CFF] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Save Category
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Folder}
                                        title="No Categories Configured"
                                        description="There are currently no course categories created. Click 'Create Category' above to add one."
                                    />
                                )}
                            </div>
                        </div>

                        {/* Courses Table Section */}
                        <div className="bg-white p-6 rounded-xl border border-[#E1E6F3] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-bold text-[#0B123D]">
                                        Courses in {selectedCat.name}
                                    </h3>
                                    <p className="text-xs text-[#64708C] mt-0.5">
                                        Course codes link resources to academic years and categories.
                                    </p>
                                </div>

                                <button
                                    onClick={() => alert("Add course...")}
                                    className="h-9 px-4 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition-colors self-start sm:self-auto"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Course</span>
                                </button>
                            </div>

                            {/* Table or Empty State */}
                            <DataContainer
                                isLoading={isLoading}
                                data={courses}
                                emptyIcon={Folder}
                                emptyTitle="No Courses Linked Yet"
                                emptyDescription={`There are no courses assigned to "${selectedCat.name}". Use the "Add Course" button to register one.`}
                                skeletonCount={3}
                                skeletonType="rows"
                            >
                                {(items) => (
                                    <div className="overflow-x-auto rounded-lg border border-[#E1E6F3]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-[#F6F8FF] border-b border-[#E1E6F3] text-xs font-semibold text-[#64708C]">
                                                    <th className="p-3.5">Course code</th>
                                                    <th className="p-3.5">Course title</th>
                                                    <th className="p-3.5">Level</th>
                                                    <th className="p-3.5">Resources</th>
                                                    <th className="p-3.5">Status</th>
                                                    <th className="p-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E1E6F3] text-xs">
                                                {items.map((crs) => (
                                                    <tr key={crs.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-3.5 font-semibold text-[#0B123D]">{crs.code}</td>
                                                        <td className="p-3.5">
                                                            <div className="text-[#0B123D] font-medium">{crs.title}</div>
                                                            <div className="text-[11px] text-[#64708C]">{crs.session}</div>
                                                        </td>
                                                        <td className="p-3.5 text-[#0B123D]">{crs.level}</td>
                                                        <td className="p-3.5 text-[#0B123D]">{crs.resources}</td>
                                                        <td className="p-3.5">
                                                            <span className="px-2.5 py-1 bg-[#E6FAF4] text-[#009F75] text-[11px] font-semibold rounded-full">
                                                                {crs.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5 text-right space-x-3">
                                                            <button className="text-[#245CFF] font-semibold hover:underline">
                                                                Edit
                                                            </button>
                                                            <button className="text-[#64708C] hover:underline">Archive</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </DataContainer>
                        </div>
                    </div>

                    {/* Standard Shared Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
