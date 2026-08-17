import { redirect } from "next/navigation";

/**
 * Student list now lives at /app/students.
 * Keep this route redirecting for backwards compatibility with old links.
 */
export default function StudentsListRedirect() {
  redirect("/app/students");
}
