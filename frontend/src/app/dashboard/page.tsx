import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProjectGenerator from "@/components/ProjectGenerator";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <main className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.firstName || "User"}!
      </h1>
      <ProjectGenerator />
    </main>
  );
}
