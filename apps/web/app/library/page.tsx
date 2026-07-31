import { redirect } from "next/navigation";

/**
 * The sidebar lists every tool on every screen and `/` is the full index, so a
 * separate library route has nothing left to show. Kept as a redirect because
 * the old page is linked from the store listing and the landing page.
 */
export default function LibraryPage() {
  redirect("/");
}
