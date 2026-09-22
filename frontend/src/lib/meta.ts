import { useEffect } from "react";

/** Sahifa meta-teglari (SPA uchun SEO): title + description. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.name = "description";
        document.head.appendChild(el);
      }
      el.content = description;
    }
  }, [title, description]);
}
