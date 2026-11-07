import React from "react";
import {
  Bookmark,
  Clock,
  Send,
  Hourglass,
  Award,
  XCircle
} from "lucide-react";
import { Badge } from "../ui/Badge.jsx";

export function StatusBadge({ status, size = "md" }) {
  const configs = {
    Saved: {
      variant: "slate",
      icon: Bookmark,
      label: "Saved / Watching"
    },
    Applying: {
      variant: "blue",
      icon: Clock,
      label: "In Preparation"
    },
    Submitted: {
      variant: "amber",
      icon: Send,
      label: "Submitted"
    },
    "Under Review": {
      variant: "violet",
      icon: Hourglass,
      label: "Under Review"
    },
    Awarded: {
      variant: "emerald",
      icon: Award,
      label: "Awarded / Won"
    },
    Rejected: {
      variant: "rose",
      icon: XCircle,
      label: "Unsuccessful"
    }
  };

  const config = configs[status] || configs.Applying;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size} dot>
      <span className="flex items-center gap-1 font-semibold">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    </Badge>
  );
}

export const APPLICATION_STATUSES = [
  "Saved",
  "Applying",
  "Submitted",
  "Under Review",
  "Awarded",
  "Rejected"
];
