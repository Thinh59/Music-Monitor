import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-mesh px-4">
      <div className="absolute inset-0 -z-10 bg-bg-primary" />
      <SignIn />
    </div>
  );
}
