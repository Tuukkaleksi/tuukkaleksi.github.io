import { AtSign, Camera, Code2, Music2, Network, Users, type LucideIcon } from "lucide-react";
import type { SocialLink } from "@/types";

const iconMap: Record<SocialLink["icon"], LucideIcon> = {
  github: Code2,
  linkedin: Network,
  twitter: AtSign,
  instagram: Camera,
  facebook: Users,
  soundcloud: Music2,
};

type SocialLinksProps = {
  links: SocialLink[];
  className?: string;
  iconClassName?: string;
};

export function SocialLinks({ links, className = "", iconClassName = "" }: SocialLinksProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = iconMap[link.icon];
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            title={link.name}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-secondary transition hover:border-primary hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${iconClassName}`}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
