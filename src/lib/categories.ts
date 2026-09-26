import { createElement } from "react";
import {
  CircleAlert,
  CloudRain,
  Construction,
  Droplets,
  Ellipsis,
  Lightbulb,
  TrafficCone,
  Trash2,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Maps the backend's category `icon` key to an icon component. */
const icons: Record<string, LucideIcon> = {
  pothole: CircleAlert,
  road: Construction,
  electricity: Zap,
  streetlight: Lightbulb,
  drainage: Waves,
  waterlogging: CloudRain,
  water: Droplets,
  garbage: Trash2,
  traffic: TrafficCone,
  other: Ellipsis,
};

/** Renders the icon for a category's `icon` key (falls back to an alert icon). */
export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  return createElement(icons[icon] ?? CircleAlert, { className });
}
