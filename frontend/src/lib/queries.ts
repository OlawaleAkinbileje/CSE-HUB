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
  recentResources: any[];
  categories: { title: string; cat: string }[];
}

export function useStudentDashboard() {
  return useQuery<StudentDashboardData>({
    queryKey: ["dashboard", "student"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/dashboard/student");
        return res.data;
      } catch (err) {
        return {
          metrics: {
            totalResources: 0,
            downloads: 0,
            bookmarks: 0,
            recentSearches: 0,
          },
          recentResources: [],
          categories: [
            { title: "Past Questions", cat: "past-questions" },
            { title: "Projects", cat: "projects" },
            { title: "Lecture Notes", cat: "lecture-notes" },
            { title: "Code Samples", cat: "code-samples" },
          ],
        };
      }
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
  recentSubmissions: any[];
}

export function useStaffDashboard() {
  return useQuery<StaffDashboardData>({
    queryKey: ["dashboard", "staff"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/dashboard/staff");
        return res.data;
      } catch (err) {
        return {
          metrics: {
            totalResources: 0,
            pendingReview: 0,
            totalDownloads: 0,
            activeUsers: 0,
          },
          recentSubmissions: [],
        };
      }
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
  userDistribution: { label: string; percentage: string; color: string }[];
  resourceGrowth: any[];
}

export function useAdminDashboard() {
  return useQuery<AdminDashboardData>({
    queryKey: ["dashboard", "admin"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/dashboard/admin");
        return res.data;
      } catch (err) {
        return {
          metrics: {
            totalResources: 0,
            totalUsers: 0,
            pendingReview: 0,
            totalDownloads: 0,
          },
          userDistribution: [
            { label: "Students", percentage: "70%", color: "#7148FF" },
            { label: "Staff", percentage: "20%", color: "#F6B93D" },
            { label: "Admins", percentage: "10%", color: "#FF4869" },
          ],
          resourceGrowth: [],
        };
      }
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
      try {
        const res = await apiClient.get("/resources/past-questions");
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          // Group by year
          const yearMap = new Map<number, number>();
          data.forEach((item: any) => {
            const yr = item.created_at ? new Date(item.created_at).getFullYear() : 2026;
            yearMap.set(yr, (yearMap.get(yr) || 0) + 1);
          });
          return Array.from(yearMap.entries()).map(([year, count]) => ({
            year,
            count,
          }));
        }
        return [];
      } catch (err) {
        return [];
      }
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
      try {
        const res = await apiClient.get("/resources/projects");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
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
      try {
        const res = await apiClient.get("/resources/code-preview");
        return res.data;
      } catch (err) {
        return {
          id: "1",
          title: "No Code Preview Available",
          description: "No code snippets have been published yet.",
          code: "# No code records yet\n",
          language: "python",
          filename: "empty.py",
        };
      }
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
}

export function useMyResources(tab: string = "saved") {
  return useQuery<SavedResourceItem[]>({
    queryKey: ["resources", "my-resources", tab],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/resources/my-resources?tab=${tab}`);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
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
  status: "Pending" | "Approved" | "Rejected" | "Changes Requested";
  urgent?: boolean;
}

export function useStaffSubmissions(status?: string) {
  return useQuery<SubmissionItem[]>({
    queryKey: ["staff", "submissions", status],
    queryFn: async () => {
      try {
        const url = status ? `/resources/submissions?status=${status}` : "/resources/submissions";
        const res = await apiClient.get(url);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
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
  status: "Published" | "Draft" | "Pending" | "Archived";
  updatedDate: string;
  downloads: number;
}

export function useStaffManagedResources() {
  return useQuery<ManagedResourceItem[]>({
    queryKey: ["staff", "managed-resources"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/resources?limit=100");
        if (Array.isArray(res.data)) {
          return res.data.map((r: any) => ({
            id: String(r.id),
            title: r.title,
            fileType: "PDF",
            fileSize: "2.4 MB",
            course: r.course_code || "CSE",
            category: r.resource_type || "Document",
            status: r.status === "approved" ? "Published" : (r.status === "pending" ? "Pending" : "Draft"),
            updatedDate: r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
            downloads: 0,
          }));
        }
        return [];
      } catch (err) {
        return [];
      }
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
      try {
        const res = await apiClient.get("/admin/users");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
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
  parent: string;
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
}

export function useAdminCategories() {
  return useQuery<{ categories: CategoryItem[]; courses: CourseItem[] }>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/admin/categories");
        return res.data;
      } catch (err) {
        return { categories: [], courses: [] };
      }
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
      avgDailyVisits: number;
    };
    popularResources: PopularResourceItem[];
  }>({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/admin/analytics");
        return res.data;
      } catch (err) {
        return {
          metrics: {
            totalDownloads: 0,
            activeUsers: 0,
            uploadedResources: 0,
            avgDailyVisits: 0,
          },
          popularResources: [],
        };
      }
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
      try {
        const res = await apiClient.get("/notifications");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
  });
}

