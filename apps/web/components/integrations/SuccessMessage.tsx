"use client";

import { FiCheck } from "react-icons/fi";

interface SuccessMessageProps {
  show: boolean;
  message: string;
}

export function SuccessMessage({ show, message }: SuccessMessageProps) {
  if (!show) return null;

  return (
    <div className="bg-primary/10 border-primary flex items-center gap-2 rounded-lg border p-4">
      <FiCheck className="text-primary h-5 w-5" />
      <span className="text-primary font-medium">{`${message}`}</span>
    </div>
  );
}
