import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CSE Hub",
  description:
    "Learn how CSE Hub helps the Computer Science and Engineering community find, share, and manage academic resources.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
