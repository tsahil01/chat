"use client";

import { FiCheck } from "react-icons/fi";

interface SuccessMessageProps {
  show: boolean;
  message: string;
}

export function SuccessMessage({ show, message }: SuccessMessageProps) {
  if (!show) return null;

  return (
    <div className="bg-primary/10 border border-primary rounded-lg p-4 flex items-center gap-2">
      <FiCheck className="h-5 w-5 text-primary" />
      <span className="text-primary font-medium">{`${message}`}</span>
    </div>
  );
}
