"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

/**
 * A dialog built from the same Card the rest of the app uses, so it does not
 * arrive with its own borders, radii and shadows.
 */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
        <Card className="shadow-subtle">
          <CardHeader className="flex items-center justify-between gap-4">
            <CardTitle>{title}</CardTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-ink-faint transition-colors hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          {children}
        </Card>
      </div>
    </div>
  );
}
