export type ProjectCategory = "projects" | "react";

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
