import * as React from "react";
import { X, Check } from "lucide-react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  onRemove?: () => void;
}

export function Chip({ label, selected = false, onRemove, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={`
        inline-flex items-center gap-2 h-8 px-3 rounded-lg text-sm font-medium transition-all duration-200 border
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
        ${selected 
          ? "bg-secondary-container text-on-secondary-container border-transparent hover:bg-secondary-container/80" 
          : "bg-surface text-on-surface border-outline hover:bg-on-surface/5"
        }
        ${className}
      `}
      {...props}
    >
      {selected && <Check className="w-4 h-4" />}
      <span>{label}</span>
      {onRemove && (
        <span 
          className="p-0.5 rounded-full hover:bg-on-surface/10 cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}
