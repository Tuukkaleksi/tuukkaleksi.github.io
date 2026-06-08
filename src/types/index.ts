export type ProjectCategory = "projects" | "react";

export type ProjectCaseStudy = {
  title: string;
  role: string;
  problem: string;
  approach: string;
  outcome: string;
  learnings: string[];
};

export type ProjectMeta = {
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  coverImage: string;
  images: string[];
  meta: { label: string; value: string; href?: string }[];
  description: string;
  descriptionTitle?: string;
  caseStudy?: ProjectCaseStudy;
};

export type NoteMeta = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  publishedAt: string;
  tags: string[];
};

export type ImpactMetric = {
  value: string;
  label: string;
};

export type Skill = { name: string; level: number };

export type ResumeEntry = {
  title: string;
  period?: string;
  organization?: string;
  details?: string[];
  description?: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type SocialLink = {
  name: string;
  href: string;
  icon: "github" | "linkedin" | "twitter" | "instagram" | "facebook" | "soundcloud";
};
