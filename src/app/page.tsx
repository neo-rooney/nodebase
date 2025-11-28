"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const Page = () => {
  const { data: session } = authClient.useSession();

  return (
    <div>
      Home {JSON.stringify(session)}
      {session && (
        <Button onClick={() => authClient.signOut()}>Sign Out</Button>
      )}
    </div>
  );
};

export default Page;
