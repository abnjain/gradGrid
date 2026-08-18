import { redirect } from "next/navigation";

/**
 * Institution portal root — redirects to organization selection.
 */
export default function AppIndexPage() {
  redirect("/app/select-organization");
}
