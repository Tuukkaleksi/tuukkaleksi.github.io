"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";

const NeonDriftCanvas = dynamic(
  () => import("@/components/arcade/NeonDriftCanvas").then((m) => m.NeonDriftCanvas),
  { ssr: false, loading: () => null },
);

export function NeonDriftPlayClient() {
  const router = useRouter();
  const onClose = useCallback(() => {
    router.push("/#portfolio");
  }, [router]);

  return (
    <div className="relative h-full min-h-0 flex-1">
      <NeonDriftCanvas active onClose={onClose} />
    </div>
  );
}
