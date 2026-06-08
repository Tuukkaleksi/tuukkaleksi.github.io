import { getTranslations } from "next-intl/server";
import type { ProjectCaseStudy as CaseStudyData } from "@/types";

type ProjectCaseStudyProps = {
  caseStudy: CaseStudyData;
};

export async function ProjectCaseStudy({ caseStudy }: ProjectCaseStudyProps) {
  const t = await getTranslations("projectPage.caseStudy");

  const sections = [
    { key: "role" as const, content: caseStudy.role },
    { key: "problem" as const, content: caseStudy.problem },
    { key: "approach" as const, content: caseStudy.approach },
    { key: "outcome" as const, content: caseStudy.outcome },
  ];

  return (
    <div className="mt-10 space-y-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{caseStudy.title}</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.key} className="section-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t(section.key)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {caseStudy.learnings.length > 0 ? (
        <div className="section-card p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
            {t("learnings")}
          </h3>
          <ul className="mt-4 space-y-2">
            {caseStudy.learnings.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-secondary sm:text-base"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
