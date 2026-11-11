'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    Bookmark,
    Download,
    FileText,
    MessageSquare,
    Reply,
} from 'lucide-react';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import DataContainer from '@/components/ui/DataContainer';
import { apiClient } from '@/lib/api';
import { useCurrentUser } from '@/lib/useCurrentUser';

interface ResourceDetails {
    id: string;
    title: string;
    original_filename?: string | null;
    description: string;
    file_url: string;
    file_type: string;
    file_size: number;
    resource_type: string;
    course_code: string;
    course_title: string | null;
    category: string;
    programming_language: string | null;
    keywords: string[];
    status: string;
    created_at: string | null;
    uploader_name: string;
    downloads: number;
    is_saved: boolean;
}

interface ResourceComment {
    id: string;
    parent_id: string | null;
    content: string;
    author: string;
    created_at: string;
}

interface CodePreview {
    content: string;
    filename: string;
    language: string;
}

function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error.response;
        if (typeof response === 'object' && response !== null && 'data' in response) {
            const data = response.data;
            if (typeof data === 'object' && data !== null && 'detail' in data && typeof data.detail === 'string') {
                return data.detail;
            }
        }
    }
    return error instanceof Error ? error.message : 'The request failed.';
}

export default function ResourceDetailsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm text-[#64708C]">Loading resource...</div>}>
            <ResourceDetailsContent />
        </Suspense>
    );
}

function ResourceDetailsContent() {
    const { id } = useParams<{ id: string }>();
    const currentUser = useCurrentUser();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);

    const {
        data: resource,
        isLoading,
        error: resourceError,
    } = useQuery({
        queryKey: ['resource', id],
        queryFn: async () => {
            const response = await apiClient.get<ResourceDetails>(`/resources/${id}`);
            return response.data;
        },
        enabled: Boolean(id),
    });

    const commentsQuery = useQuery({
        queryKey: ['resource', id, 'comments'],
        queryFn: async () => {
            const response = await apiClient.get<ResourceComment[]>(`/resources/${id}/comments`);
            return response.data;
        },
        enabled: Boolean(id && resource),
    });

    const codePreviewQuery = useQuery({
        queryKey: ['resource', id, 'preview'],
        queryFn: async () => {
            const response = await apiClient.get<CodePreview>(`/resources/${id}/preview`);
            return response.data;
        },
        enabled: Boolean(resource && ['code', 'text'].includes(resource.file_type)),
    });

    const bookmarkMutation = useMutation({
        mutationFn: async (isSaved: boolean) => {
            const method = isSaved ? 'delete' : 'put';
            await apiClient.request({
                method,
                url: `/resources/${id}/bookmark`,
            });
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['resource', id] }),
                queryClient.invalidateQueries({ queryKey: ['resources', 'my-resources'] }),
            ]);
        },
    });

    const downloadMutation = useMutation({
        mutationFn: async () => {
            if (!resource) return;
            if (resource.file_url.startsWith('http')) {
                window.open(resource.file_url, '_blank', 'noopener,noreferrer');
                return;
            }
            const response = await apiClient.get(`/resources/${id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = resource.title;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            await queryClient.invalidateQueries({ queryKey: ['resource', id] });
        },
    });

    const commentMutation = useMutation({
        mutationFn: async () => {
            const content = commentText.trim();
            if (!content) throw new Error('Write a comment before posting.');
            await apiClient.post(`/resources/${id}/comments`, {
                content,
                parent_id: replyTo,
            });
        },
        onSuccess: async () => {
            setCommentText('');
            setReplyTo(null);
            await queryClient.invalidateQueries({ queryKey: ['resource', id, 'comments'] });
        },
    });

    const handlePostComment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        commentMutation.mutate();
    };

    const filePreviewUrl = `${apiClient.defaults.baseURL}/resources/${id}/file-preview`;
    const isPdf =
        resource?.file_type === 'document' &&
        resource.original_filename?.toLowerCase().endsWith('.pdf') === true;
    const comments = commentsQuery.data || [];

    return (
        <div className="min-h-screen w-full bg-[#F6F8FF] font-sans text-[#0B123D]">
            <Navbar />
            <div className="flex min-h-[calc(100vh-76px)]">
                {currentUser.isAuthenticated && <Sidebar userRole={currentUser.role} />}
                <main className="flex-1 min-w-0 p-4 sm:p-8">
                    <div className="mx-auto max-w-5xl space-y-6">
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#245CFF] hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to search
                        </Link>

                        {isLoading && <p className="rounded-xl bg-white p-6 text-sm text-[#64708C]">Loading resource…</p>}
                        {resourceError && (
                            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                {getErrorMessage(resourceError)}
                            </p>
                        )}

                        {resource && (
                            <>
                                <section className="rounded-2xl border border-[#E1E6F3] bg-white p-5 sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#E9EDFF] text-[#245CFF]">
                                                <FileText className="h-7 w-7" />
                                            </div>
                                            <div className="space-y-2">
                                                <h1 className="text-2xl font-bold">{resource.title}</h1>
                                                <p className="text-sm text-[#64708C]">
                                                    {resource.category} · {resource.file_type.toUpperCase()} ·{' '}
                                                    {(resource.file_size / (1024 * 1024)).toFixed(1)} MB ·{' '}
                                                    {resource.downloads} downloads
                                                </p>
                                                <p className="text-sm leading-6 text-[#475569]">
                                                    {resource.description || 'No description was provided.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                onClick={() => bookmarkMutation.mutate(resource.is_saved)}
                                                disabled={bookmarkMutation.isPending}
                                                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E1E6F3] px-3 text-sm font-semibold hover:bg-[#F6F8FF] disabled:opacity-50"
                                            >
                                                <Bookmark className="h-4 w-4" />
                                                {resource.is_saved ? 'Saved' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => downloadMutation.mutate()}
                                                disabled={downloadMutation.isPending}
                                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#245CFF] px-4 text-sm font-semibold text-white hover:bg-[#1d4bd8] disabled:opacity-50"
                                            >
                                                <Download className="h-4 w-4" />
                                                {downloadMutation.isPending ? 'Preparing…' : 'Download'}
                                            </button>
                                        </div>
                                    </div>

                                    {bookmarkMutation.error && (
                                        <p role="alert" className="mt-4 text-sm text-red-600">
                                            {getErrorMessage(bookmarkMutation.error)}
                                        </p>
                                    )}
                                    {downloadMutation.error && (
                                        <p role="alert" className="mt-4 text-sm text-red-600">
                                            {getErrorMessage(downloadMutation.error)}
                                        </p>
                                    )}

                                    <dl className="mt-6 grid gap-4 border-t border-[#E1E6F3] pt-5 text-sm sm:grid-cols-2">
                                        <div><dt className="text-[#64708C]">Course</dt><dd className="font-medium">{resource.course_code || 'Not specified'} {resource.course_title || ''}</dd></div>
                                        <div><dt className="text-[#64708C]">Uploaded by</dt><dd className="font-medium">{resource.uploader_name}</dd></div>
                                        <div><dt className="text-[#64708C]">Uploaded</dt><dd className="font-medium">{resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'Unknown'}</dd></div>
                                        <div><dt className="text-[#64708C]">Keywords</dt><dd className="font-medium">{resource.keywords.join(', ') || 'None'}</dd></div>
                                    </dl>
                                </section>

                                <section className="space-y-4 rounded-2xl border border-[#E1E6F3] bg-white p-5 sm:p-8">
                                    <h2 className="text-lg font-bold">Preview</h2>
                                    {resource.file_type === 'code' || resource.file_type === 'text' ? (
                                        codePreviewQuery.isLoading ? (
                                            <p className="text-sm text-[#64708C]">Loading text preview…</p>
                                        ) : codePreviewQuery.error ? (
                                            <p role="alert" className="text-sm text-red-600">{getErrorMessage(codePreviewQuery.error)}</p>
                                        ) : (
                                            <pre className="max-h-[600px] overflow-auto rounded-xl bg-[#101827] p-4 text-sm text-slate-100">
                                                <code>{codePreviewQuery.data?.content}</code>
                                            </pre>
                                        )
                                    ) : isPdf ? (
                                        <iframe
                                            title={`Preview of ${resource.title}`}
                                            src={filePreviewUrl}
                                            className="h-[65vh] min-h-96 w-full rounded-lg border border-[#E1E6F3]"
                                        />
                                    ) : (
                                        <p className="text-sm text-[#64708C]">
                                            This file type can be opened after downloading.
                                        </p>
                                    )}
                                </section>

                                <section className="space-y-5 rounded-2xl border border-[#E1E6F3] bg-white p-5 sm:p-8">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-[#245CFF]" />
                                        <h2 className="text-lg font-bold">Discussion ({comments.length})</h2>
                                    </div>

                                    <form onSubmit={handlePostComment} className="space-y-3">
                                        {replyTo && (
                                            <div className="flex items-center justify-between text-xs text-[#64708C]">
                                                <span>Replying to a comment</span>
                                                <button type="button" onClick={() => setReplyTo(null)} className="text-[#245CFF]">Cancel reply</button>
                                            </div>
                                        )}
                                        <textarea
                                            value={commentText}
                                            onChange={(event) => setCommentText(event.target.value)}
                                            maxLength={4000}
                                            rows={3}
                                            placeholder="Ask a question or share helpful feedback…"
                                            className="w-full rounded-lg border border-[#E1E6F3] p-3 text-sm focus:border-[#245CFF] focus:outline-none"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-[#64708C]">{commentText.length}/4000</span>
                                            <button
                                                type="submit"
                                                disabled={!commentText.trim() || commentMutation.isPending}
                                                className="rounded-lg bg-[#245CFF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                {commentMutation.isPending ? 'Posting…' : 'Post comment'}
                                            </button>
                                        </div>
                                    </form>

                                    {commentMutation.error && (
                                        <p role="alert" className="text-sm text-red-600">{getErrorMessage(commentMutation.error)}</p>
                                    )}
                                    {commentsQuery.error && (
                                        <p role="alert" className="text-sm text-red-600">{getErrorMessage(commentsQuery.error)}</p>
                                    )}
                                    <DataContainer
                                        isLoading={commentsQuery.isLoading}
                                        data={comments}
                                        emptyIcon={MessageSquare}
                                        emptyTitle="No comments yet"
                                        emptyDescription="Start the discussion with a question or helpful note."
                                        skeletonType="rows"
                                    >
                                        {(items) => (
                                            <div className="space-y-4">
                                                {items.map((comment) => (
                                                    <article
                                                        key={comment.id}
                                                        className={`rounded-xl border border-[#E1E6F3] p-4 ${comment.parent_id ? 'ml-5 sm:ml-10' : ''}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold">{comment.author}</p>
                                                                <time className="text-xs text-[#64708C]">
                                                                    {new Date(comment.created_at).toLocaleString()}
                                                                </time>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setReplyTo(comment.id)}
                                                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#245CFF]"
                                                            >
                                                                <Reply className="h-3.5 w-3.5" /> Reply
                                                            </button>
                                                        </div>
                                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </DataContainer>
                                </section>
                            </>
                        )}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
}
