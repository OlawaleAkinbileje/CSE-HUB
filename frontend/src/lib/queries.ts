"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Student Dashboard Data
export interface StudentDashboardData {
  metrics: {
    totalResources: number;
    downloads: number;
    bookmarks: number;
    recentSearches: number;
  };
  recentResources: Record<string, unknown>[];
  categories: { title: string; cat: string }[];
}

export function useStudentDashboard() {
  return useQuery<StudentDashboardData>({
    queryKey: ["dashboard", "student"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/student");
      return res.data;
    },
  });
}

// Staff Dashboard Data
export interface StaffDashboardData {
  metrics: {
    totalResources: number;
    pendingReview: number;
    totalDownloads: number;
    activeUsers: number;
  };
  recentSubmissions: Record<string, unknown>[];
}

export function useStaffDashboard() {
  return useQuery<StaffDashboardData>({
    queryKey: ["dashboard", "staff"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/staff");
      return res.data;
    },
  });
}

// Admin Dashboard Data
export interface AdminDashboardData {
  metrics: {
    totalResources: number;
    totalUsers: number;
    pendingReview: number;
    totalDownloads: number;
  };
  userDistribution: { label: string; count: number; percentage: string; color: string }[];
  resourceGrowth: { month: string; count: number }[];
}

export function useAdminDashboard() {
  return useQuery<AdminDashboardData>({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/admin");
      return res.data;
    },
  });
}

// Past Questions Query
export interface PastQuestionYear {
  year: number;
  count: number;
  isPopular?: boolean;
}

export function usePastQuestions() {
  return useQuery<PastQuestionYear[]>({
    queryKey: ["resources", "past-questions"],
    queryFn: async () => {
      const res = await apiClient.get("/resources/past-questions");
      const data = res.data as { created_at: string | null }[];
      const yearMap = new Map<number, number>();
      data.forEach((item) => {
        if (!item.created_at) return;
        const year = new Date(item.created_at).getFullYear();
        if (Number.isFinite(year)) yearMap.set(year, (yearMap.get(year) || 0) + 1);
      });
      return Array.from(yearMap.entries()).map(([year, count]) => ({ year, count }));
    },
  });
}

// Projects Query
export interface ProjectItem {
  id: string;
  title: string;
  tags: string[];
  year: number;
  department: string;
  downloads: number;
  imageUrl: string;
  file_url?: string;
}

export function useProjects() {
  return useQuery<ProjectItem[]>({
    queryKey: ["resources", "projects"],
    queryFn: async () => {
      const res = await apiClient.get("/resources/projects");
      return Array.isArray(res.data) ? res.data : [];
    },
  });
}

// Code Preview Query
export interface CodePreviewData {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  filename: string;
}

export function useCodePreview() {
  return useQuery<CodePreviewData>({
    queryKey: ["resources", "code-preview"],
    queryFn: async () => {
      const res = await apiClient.get("/resources/code-preview");
      return res.data;
    },
  });
}

// My Resources Query
export interface SavedResourceItem {
  id: string;
  title: string;
  category: string;
  format: string;
  size: string;
  course: string;
  author: string;
  savedDate: string;
  downloadStatus: string;
  iconColor: string;
  iconBg: string;
  file_url?: string;
  status?: string;
}

export function useMyResources(tab: string = "saved") {
  return useQuery<SavedResourceItem[]>({
    queryKey: ["resources", "my-resources", tab],
    queryFn: async () => {
      const res = await apiClient.get(`/resources/my-resources?tab=${tab}`);
      if (!Array.isArray(res.data)) {
        throw new Error("The resource list response was invalid.");
      }
      const categories: Record<string, string> = {
        lecture_note: "Lecture Notes",
        past_question: "Past Questions",
        project: "Projects",
        code_preview: "Code Samples",
        other: "Other",
      };
      return res.data.map((resource: SavedResourceItem) => ({
        ...resource,
        category: categories[resource.category] || resource.category,
      }));
    },
  });
}

// Staff Submissions Query
export interface SubmissionItem {
  id: string;
  title: string;
  submitterName: string;
  submitterRole: string;
  submitterEmail: string;
  submitterId: string;
  course: string;
  courseTitle: string;
  academicYear: string;
  category: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  visibility: string;
  tags: string[];
  submittedDate: string;
  status: "Pending" | "Approved" | "Rejected" | "Changes Requested" | "Archived";
  urgent?: boolean;
}

export function useStaffSubmissions(status?: string) {
  return useQuery<SubmissionItem[]>({
    queryKey: ["staff", "submissions", status],
    queryFn: async () => {
      const url = status ? `/resources/submissions?status=${status}` : "/resources/submissions";
      const res = await apiClient.get(url);
      if (!Array.isArray(res.data)) {
        throw new Error("The submission list response was invalid.");
      }
      return res.data;
    },
  });
}

// Staff Managed Resources Query
export interface ManagedResourceItem {
  id: string;
  title: string;
  fileType: string;
  fileSize: string;
  course: string;
  category: string;
  status: "Published" | "Draft" | "Pending" | "Changes Requested" | "Rejected" | "Archived";
  updatedDate: string;
  downloads: number;
}

interface ResourceListApiItem {
  id: string;
  title: string;
  file_type?: string;
  file_size?: number;
  course_code?: string;
  resource_type?: string;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  downloads?: number;
}

export function useStaffManagedResources() {
  return useQuery<ManagedResourceItem[]>({
    queryKey: ["staff", "managed-resources"],
    queryFn: async () => {
      const res = await apiClient.get("/resources?limit=100");
      if (Array.isArray(res.data?.data)) {
          return (res.data.data as ResourceListApiItem[]).map((r) => ({
            id: String(r.id),
            title: r.title,
            fileType: r.file_type || "File",
            fileSize: `${(Number(r.file_size || 0) / (1024 * 1024)).toFixed(1)} MB`,
            course: r.course_code || "CSE",
            category: r.resource_type || "Document",
            status: r.status === "approved" ? "Published" : (r.status === "pending" ? "Pending" : (r.status === "changes_requested" ? "Changes Requested" : (r.status === "rejected" ? "Rejected" : "Archived"))),
            updatedDate: r.updated_at ? new Date(r.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
            downloads: Number(r.downloads || 0),
          }));
      }
      throw new Error("The resource list response was invalid.");
    },
  });
}

// Admin Users Query
export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff" | "Student";
  status: "Active" | "Suspended" | "Invited";
  lastActive: string;
  staffOrMatricId?: string;
  joinedDate: string;
  resourcesUploaded?: number;
}

export function useAdminUsers() {
  return useQuery<AdminUserItem[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/users");
      if (!Array.isArray(res.data)) {
        throw new Error("The user list response was invalid.");
      }
      return res.data;
    },
  });
}

// Admin Categories Query
export interface CategoryItem {
  id: string;
  name: string;
  resourceCount: number;
  courseCount: number;
  subcategoryCount: number;
  status: "Active" | "Archived";
  categoryId?: string | null;
  parent: string;
  parentId?: string | null;
  description: string;
}

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  session: string;
  level: string;
  resources: number;
  status: "Active" | "Archived";
  categoryId?: string | null;
}

export function useAdminCategories() {
  return useQuery<{ categories: CategoryItem[]; courses: CourseItem[] }>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/categories");
      if (!Array.isArray(res.data?.categories) || !Array.isArray(res.data?.courses)) {
        throw new Error("The categories response was invalid.");
      }
      return res.data;
    },
  });
}

// Admin Analytics Query
export interface PopularResourceItem {
  id: string;
  title: string;
  course: string;
  downloads: number;
  change: string;
}

export function useAdminAnalytics() {
  return useQuery<{
    metrics: {
      totalDownloads: number;
      activeUsers: number;
      uploadedResources: number;
      avgDailyDownloads: number;
    };
    popularResources: PopularResourceItem[];
  }>({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/analytics");
      return res.data;
    },
  });
}

// Notifications Query
export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "Reviews" | "Resources" | "System";
  timestamp: string;
  isRead: boolean;
  actionText?: string;
  actionHref?: string;
}

export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await apiClient.get("/notifications");
      if (!Array.isArray(res.data)) {
        throw new Error("The notification list response was invalid.");
      }
      return res.data;
    },
  });
}
