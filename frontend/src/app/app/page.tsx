import { redirect } from "next/navigation";

/**
 * Institution portal root — redirects to the dashboard.
 * Handles direct visits to /app (e.g. after login or from bookmarks).
 */
export default function AppIndexPage() {
  redirect("/app/dashboard");
}
