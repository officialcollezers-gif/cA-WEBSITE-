import { apiUrl } from "./api";
import { useEffect, useState } from "react";
import { servicesData } from "../data/servicesData";
import { blogsData } from "../data/blogsData";
import { Context } from "./context";
const starter = {
  settings: {
    name: "FinCore Advisors",
    email: "hello@example.com",
    phone: "+91 98765 43210",
    location: "Jaipur, Rajasthan, India",
    workingHours: "Mon - Sat: 10 AM - 6 PM",
    heroTitle: "Clarity for every",
    heroAccent: "financial decision.",
    heroDescription:
      "Thoughtful tax, accounting, compliance and business advisory services — helping individuals and businesses navigate financial decisions with confidence.",
  },
  categories: servicesData,
  blogs: blogsData,
  pages: [],
};
export function ContentProvider({ children }) {
  const [content, setContent] = useState(starter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch(apiUrl("/api/content"), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Content could not be loaded.");
        const next = await response.json();
        setContent(next);
        setError("");
      } catch (e) {
        if (e.name !== "AbortError")
          setError(
            "Live content is temporarily unavailable. Showing the starter content or last loaded version.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);
  return (
    <Context.Provider value={{ ...content, loading, error }}>
      {children}
    </Context.Provider>
  );
}
