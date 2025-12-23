import { Loader } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <Loader className="size-10 animate-spin text-cyan-500" />
    </div>
  );
}
