'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-background flex h-screen w-screen items-center justify-center">
      <Button
        onClick={() => router.push('/flows')}
      >Go To Flows</Button>
    </div>
  );
}
