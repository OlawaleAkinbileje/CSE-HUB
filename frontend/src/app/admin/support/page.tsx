"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/footer";
import { apiClient } from "@/lib/api";

interface SupportTicket {
    id: string;
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
}

export default function AdminSupportQueuePage() {
    const [actionError, setActionError] = useState("");
    const queryClient = useQueryClient();
    const { data: tickets = [], isLoading, error } = useQuery<SupportTicket[]>({
        queryKey: ["admin", "support-tickets"],
        queryFn: async () => {
            const response = await apiClient.get("/admin/support-tickets");
            if (!Array.isArray(response.data)) {
                throw new Error("The support ticket list response was invalid.");
            }
            return response.data;
        },
    });

    const updateStatus = async (ticket: SupportTicket, status: SupportTicket["status"]) => {
        setActionError("");
        try {
            await apiClient.patch(`/admin/support-tickets/${ticket.id}?status=${status}`);
            await queryClient.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
        } catch (requestError) {
            setActionError(requestError instanceof Error ? requestError.message : "Could not update this ticket.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] flex flex-col font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex-1 flex flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 p-4 md:p-8 space-y-6 overflow-x-hidden flex flex-col justify-between">
                    <section className="space-y-5">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Support queue</h1>
                            <p className="mt-1 text-sm text-[#64708C]">Review and update submitted support requests.</p>
                        </div>
                        {actionError && <p role="alert" className="text-sm text-[#DF365B]">{actionError}</p>}
                        {error && <p role="alert" className="text-sm text-[#DF365B]">{error.message}</p>}
                        {isLoading ? <p className="text-sm text-[#64708C]">Loading support requests...</p> : tickets.length === 0 ? (
                            <div className="p-6 bg-white rounded-xl border border-[#E1E6F3] text-sm text-[#64708C]">No support requests have been submitted.</div>
                        ) : tickets.map((ticket) => (
                            <article key={ticket.id} className="p-5 bg-white rounded-xl border border-[#E1E6F3] space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-semibold">{ticket.subject}</h2>
                                        <p className="text-xs text-[#64708C]">{ticket.name} · {ticket.email} · {ticket.category}</p>
                                        <p className="text-xs text-[#64708C] mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
                                    </div>
                                    <select
                                        aria-label={`Status for ${ticket.subject}`}
                                        value={ticket.status}
                                        onChange={(event) => updateStatus(ticket, event.target.value as SupportTicket["status"])}
                                        className="h-10 px-3 border border-[#E1E6F3] rounded-lg text-xs"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                            </article>
                        ))}
                    </section>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
