import { Suspense } from "react";
import CanvasApp from "@/components/canvas/CanvasApp";

export default function CanvasPage() {
  return (
    <Suspense fallback={null}>
      <CanvasApp />
    </Suspense>
  );
}
