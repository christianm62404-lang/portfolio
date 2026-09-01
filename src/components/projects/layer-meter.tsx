import { layers } from "@/content/layers";
import type { LayerId } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * A five-segment indicator showing which layers of the stack a project
 * touches. It appears on every project, so the reader builds a sense of the
 * whole system from repeated exposure rather than from an explanation.
 */
export function LayerMeter({
  active,
  className,
}: {
  active: LayerId[];
  className?: string;
}) {
  const label = layers
    .filter((layer) => active.includes(layer.id))
    .map((layer) => layer.name)
    .join(", ");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex gap-1" role="img" aria-label={`Layers touched: ${label}`}>
        {layers.map((layer) => {
          const isActive = active.includes(layer.id);
          return (
            <span
              key={layer.id}
              className={cn(
                "h-1 w-5 transition-colors duration-300",
                isActive ? "bg-signal" : "bg-line-bright",
              )}
            />
          );
        })}
      </span>
      <span className="font-mono text-[0.625rem] tracking-wide text-ink-faint">{label}</span>
    </div>
  );
}
