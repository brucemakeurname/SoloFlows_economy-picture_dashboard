import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: number;
  onSave: (newValue: number) => void;
  formatDisplay?: (v: number) => string;
}

export default function EditableCell({
  value,
  onSave,
  formatDisplay,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleSave = useCallback(async () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed)) {
      setInputValue(String(value));
      setEditing(false);
      return;
    }

    if (parsed === value) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      onSave(parsed);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [inputValue, value, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        setInputValue(String(value));
        setEditing(false);
      }
    },
    [handleSave, value]
  );

  if (editing) {
    return (
      <div className="relative inline-flex items-center">
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className={cn(
            "h-8 w-28 rounded-md border border-ring bg-transparent px-2 text-sm font-medium text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "disabled:opacity-50",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          )}
        />
        {saving && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          </div>
        )}
      </div>
    );
  }

  const displayValue = formatDisplay ? formatDisplay(value) : value.toLocaleString();

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "inline-flex h-8 items-center rounded-md px-2 text-sm font-medium text-foreground",
        "cursor-pointer transition-all duration-200",
        "hover:bg-secondary hover:text-foreground",
        justSaved &&
          "animate-pulse bg-success/10 text-success ring-1 ring-success/30"
      )}
    >
      {displayValue}
    </button>
  );
}
