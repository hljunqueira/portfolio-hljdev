import { Github, Instagram, Linkedin } from "lucide-react";
import { siWhatsapp } from "simple-icons/icons";

const SOCIALS = [
  { href: "https://github.com/hljunqueira", label: "GitHub", Icon: Github },
  { href: "https://www.linkedin.com/in/hljunqueira/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://www.instagram.com/hlj.dev", label: "Instagram", Icon: Instagram },
  { href: "https://wa.me/5548991013293", label: "WhatsApp", brand: siWhatsapp },
] as const;

export function SocialBar() {
  return (
    <aside aria-label="Redes sociais" className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
      {SOCIALS.map(({ href, label, Icon, brand }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="group p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
        >
          {Icon ? (
            <Icon className="h-5 w-5" aria-hidden="true" />
          ) : brand ? (
            <svg
              viewBox="0 0 24 24"
              role="img"
              aria-label={brand.title}
              className="h-5 w-5"
            >
              <path d={brand.path} fill="currentColor" />
            </svg>
          ) : null}
        </a>
      ))}
    </aside>
  );
}
