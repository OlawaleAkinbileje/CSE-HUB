"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import {
    Search,
    UserPlus,
    ChevronDown,
    Check,
    Info,
    UserX,
    RotateCcw,
    Users
} from "lucide-react";
import { useAdminUsers, AdminUserItem } from "@/lib/queries";
import DataContainer from "@/components/ui/DataContainer";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminUserManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All roles");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [assignedRole, setAssignedRole] = useState<AdminUserItem["role"]>("Student");
    const [suspensionReason, setSuspensionReason] = useState("");

    const { data: rawUsers, isLoading } = useAdminUsers();
    const users = rawUsers || [];

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.staffOrMatricId && user.staffOrMatricId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole =
            roleFilter === "All roles" || user.role.toLowerCase() === roleFilter.toLowerCase();
        const matchesStatus =
            statusFilter === "All statuses" || user.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesRole && matchesStatus;
    });

    const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

    const activeCount = users.filter((u) => u.status === "Active").length;
    const staffCount = users.filter((u) => u.role === "Staff").length;
    const suspendedCount = users.filter((u) => u.status === "Suspended").length;

    const handleSelectUser = (user: AdminUserItem) => {
        setSelectedUserId(user.id);
        setAssignedRole(user.role);
        setSuspensionReason("");
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setRoleFilter("All roles");
        setStatusFilter("All statuses");
    };

    const handleSaveRole = () => {
        if (!selectedUser) return;
        alert(`Assigned role "${assignedRole}" to user ${selectedUser.name}`);
    };

    const handleToggleSuspension = () => {
        if (!selectedUser) return;
        alert(`Updated suspension status for ${selectedUser.name}`);
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
                        {/* Header Title Section & Primary Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-[#0B123D]">
                                    User Management
                                </h1>
                                <p className="text-sm text-[#64708C] mt-1">
                                    Manage students, academic staff and administrator privileges across the platform.
                                </p>
                            </div>

                            <button
                                onClick={() => alert("Invite link copied to clipboard!")}
                                className="h-11 px-5 bg-gradient-to-r from-[#7148FF] to-[#245CFF] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm self-start sm:self-auto"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Invite New User</span>
                            </button>
                        </div>

                        {/* Top Key Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E9EDFF] rounded-xl flex items-center justify-center text-[#245CFF]">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : users.length}</div>
                                    <div className="text-xs text-[#64708C]">Total users</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E6FAF4] rounded-xl flex items-center justify-center text-[#009F75]">
                                    <Check className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : activeCount}</div>
                                    <div className="text-xs text-[#64708C]">Active users</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#F6F0FF] rounded-xl flex items-center justify-center text-[#7148FF]">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : staffCount}</div>
                                    <div className="text-xs text-[#64708C]">Staff members</div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-[#E1E6F3] shadow-[0px_5px_18px_rgba(39,63,121,0.06)] flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FFF0F4] rounded-xl flex items-center justify-center text-[#DF365B]">
                                    <UserX className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#0B123D]">{isLoading ? '...' : suspendedCount}</div>
                                    <div className="text-xs text-[#64708C]">Suspended accounts</div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters Toolbar */}
                        <div className="bg-white p-4 rounded-xl border border-[#E1E6F3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-[#64708C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, matric or staff ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] placeholder-[#64708C] focus:outline-none focus:border-[#245CFF]"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-[130px]">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="w-full h-10 pl-3 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                    >
                                        <option value="All roles">All roles</option>
                                        <option value="Student">Student</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <div className="relative min-w-[130px]">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full h-10 pl-3 pr-8 bg-white border border-[#E1E6F3] rounded-lg text-xs text-[#0B123D] appearance-none focus:outline-none focus:border-[#245CFF] cursor-pointer"
                                    >
                                        <option value="All statuses">All statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[#64708C] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <button
                                    onClick={handleResetFilters}
                                    className="h-10 px-3 bg-white border border-[#E1E6F3] text-[#245CFF] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Split Table Layout & Inspection Drawer */}
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                            {/* Left Column: User Table Container */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="bg-white rounded-xl border border-[#E1E6F3] overflow-hidden">
                                    <DataContainer
                                        isLoading={isLoading}
                                        data={filteredUsers}
                                        emptyIcon={Users}
                                        emptyTitle={searchTerm ? "No Matching Users" : "No Users Registered"}
                                        emptyDescription={
                                            searchTerm
                                                ? `No user records matched "${searchTerm}".`
                                                : "There are currently no registered student or staff accounts."
                                        }
                                        skeletonCount={5}
                                        skeletonType="rows"
                                    >
                                        {(items) => (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="bg-[#F6F8FF] border-b border-[#E1E6F3] text-[#64708C] font-semibold">
                                                            <th className="p-4 w-10"></th>
                                                            <th className="p-4">User</th>
                                                            <th className="p-4">Role</th>
                                                            <th className="p-4">Status</th>
                                                            <th className="p-4">Last active</th>
                                                            <th className="p-4 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#E1E6F3]">
                                                        {items.map((user) => {
                                                            const isSelected = selectedUser?.id === user.id;
                                                            return (
                                                                <tr
                                                                    key={user.id}
                                                                    onClick={() => handleSelectUser(user)}
                                                                    className={`cursor-pointer transition-colors ${isSelected
                                                                        ? "bg-[#F0F3FF]"
                                                                        : "bg-white hover:bg-slate-50"
                                                                        }`}
                                                                >
                                                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => handleSelectUser(user)}
                                                                            className="w-4 h-4 rounded border-gray-300 text-[#245CFF] focus:ring-[#245CFF]"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <div className="font-semibold text-[#0B123D]">
                                                                            {user.name}
                                                                        </div>
                                                                        <div className="text-[11px] text-[#64708C]">
                                                                            {user.email}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 text-[#0B123D]">{user.role}</td>
                                                                    <td className="p-4">
                                                                        <span
                                                                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full inline-block ${user.status === "Active"
                                                                                ? "bg-[#E6FAF4] text-[#009F75]"
                                                                                : "bg-[#FFF0F4] text-[#DF365B]"
                                                                                }`}
                                                                        >
                                                                            {user.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-4 text-[#64708C]">
                                                                        {user.lastActive}
                                                                    </td>
                                                                    <td className="p-4 text-right">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleSelectUser(user);
                                                                            }}
                                                                            className="font-semibold text-[#245CFF] hover:underline"
                                                                        >
                                                                            {isSelected ? "Selected" : "View"}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </DataContainer>
                                </div>
                            </div>

                            {/* Right Column: Selected User Inspection & Role Controls */}
                            <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                                {selectedUser ? (
                                    <div className="bg-white p-5 rounded-xl border border-[#E1E6F3] space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-[#E9EDFF] rounded-full flex items-center justify-center font-bold text-[#245CFF] text-sm shrink-0">
                                                {selectedUser.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-[#0B123D] truncate">
                                                    {selectedUser.name}
                                                </h3>
                                                <p className="text-xs text-[#64708C] truncate">
                                                    {selectedUser.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <span
                                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full inline-block ${selectedUser.status === "Active"
                                                    ? "bg-[#E6FAF4] text-[#009F75]"
                                                    : "bg-[#FFF0F4] text-[#DF365B]"
                                                    }`}
                                            >
                                                {selectedUser.status} account
                                            </span>
                                        </div>

                                        <div className="divide-y divide-[#E1E6F3] text-xs">
                                            <div className="py-2.5 flex justify-between">
                                                <span className="text-[#64708C]">Role</span>
                                                <span className="font-medium text-[#0B123D]">{selectedUser.role}</span>
                                            </div>
                                            <div className="py-2.5 flex justify-between">
                                                <span className="text-[#64708C]">ID</span>
                                                <span className="font-medium text-[#0B123D]">{selectedUser.staffOrMatricId || "N/A"}</span>
                                            </div>
                                            <div className="py-2.5 flex justify-between">
                                                <span className="text-[#64708C]">Joined</span>
                                                <span className="font-medium text-[#0B123D]">{selectedUser.joinedDate}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 space-y-3">
                                            <label className="block text-xs font-semibold text-[#0B123D]">Change Role</label>
                                            <select
                                                value={assignedRole}
                                                onChange={(e) => {
                                                    const role = e.target.value;
                                                    if (role === "Student" || role === "Staff" || role === "Admin") {
                                                        setAssignedRole(role);
                                                    }
                                                }}
                                                className="w-full h-10 px-3 border border-[#E1E6F3] rounded-lg text-xs"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={handleSaveRole}
                                                className="w-full h-10 bg-[#245CFF] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Update Role
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Users}
                                        title="No User Selected"
                                        description="Select an account from the table to view their profile, permissions, and status."
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Standard Footer */}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
