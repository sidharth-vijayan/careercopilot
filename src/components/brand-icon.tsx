import { FileSearch } from "lucide-react";

export function BrandIcon({ size = "default" }: { size?: "default" | "sm" | "lg" }) {
  const dimensions = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8.5 w-8.5";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5.5 w-5.5" : "h-4.5 w-4.5";

  return (
    <div
      className={`${dimensions} rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md shadow-primary/25 shrink-0`}
    >
      <FileSearch className={`${iconSize} text-white`} strokeWidth={2.5} />
    </div>
  );
}
