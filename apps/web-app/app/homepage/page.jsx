import { redirect } from "next/navigation";

export default async function HomePage() {
  // Redirect to properties page
  redirect("/properties");
}

