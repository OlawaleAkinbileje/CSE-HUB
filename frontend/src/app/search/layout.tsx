import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Academic Resources",
  description:
    "Search CSE lecture notes, past questions, projects, and code samples by topic, course, category, or year.",
  alternates: { canonical: "/search" },
};

export default function SearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
