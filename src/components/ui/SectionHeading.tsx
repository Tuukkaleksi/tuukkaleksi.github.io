type SectionHeadingProps = {
  title: string;
  description?: string;
};

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="mb-12 text-center">
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary" />
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}
