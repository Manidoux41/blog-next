import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SignInClient from "./SignInClient";

export default async function SignIn() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  return <SignInClient />;
}