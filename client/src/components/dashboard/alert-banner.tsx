import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertBannerProps {
  severity: "info" | "warning" | "error";
  title: string;
  message: string;
  onClose?: () => void;
}

export default function AlertBanner({ severity, title, message, onClose }: AlertBannerProps) {
  const severityIcon = {
    info: "info",
    warning: "warning",
    error: "error"
  };

  const severityColor = {
    info: "blue",
    warning: "yellow",
    error: "red"
  };

  return (
    <Alert className={`bg-${severityColor[severity]}-50 border-${severityColor[severity]}-200 text-${severityColor[severity]}-800`}>
      <span className={`material-icons text-${severityColor[severity]}-400`}>
        {severityIcon[severity]}
      </span>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onClose && (
        <button 
          onClick={onClose} 
          className={`absolute top-2 right-2 text-${severityColor[severity]}-400 hover:text-${severityColor[severity]}-600`}
        >
          <span className="material-icons">close</span>
        </button>
      )}
    </Alert>
  );
}
