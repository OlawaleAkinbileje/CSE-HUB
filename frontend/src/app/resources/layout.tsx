import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Resource",
  description:
    "View CSE Hub academic resource information, including its course, category, and learning details.",
};

export default function ResourcesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
