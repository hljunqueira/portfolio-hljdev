import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  ariaLabelledBy?: string;
};

export function Section({ id, title, subtitle, children, ariaLabelledBy }: SectionProps) {
  return (
    <section id={id} aria-labelledby={ariaLabelledBy} className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        {(title || subtitle) && (
          <header className="mb-6">
            {title && (
              <h2 id={ariaLabelledBy} className="text-2xl md:text-3xl font-bold">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}


