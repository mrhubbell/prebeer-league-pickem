"use client";

interface SavePicksButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function SavePicksButton({
  disabled,
  onClick,
}: SavePicksButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl py-4 text-lg font-bold transition ${
        disabled
          ? "cursor-not-allowed bg-slate-700 text-slate-400"
          : "bg-amber-400 text-slate-900 hover:bg-amber-300"
      }`}
    >
      {disabled ? "Complete All Picks" : "💾 Save Picks"}
    </button>
  );
}