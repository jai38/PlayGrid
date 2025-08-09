import React from "react";

type ToastProps = {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
};

export default function Toast({
  message,
  type = "error",
  onClose,
}: ToastProps) {
  const bgColor =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-blue-600";

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-3 rounded-md px-4 py-2 text-white shadow-lg ${bgColor} animate-fadeIn`}
      role="alert">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 rounded hover:bg-white hover:bg-opacity-20 p-1 focus:outline-none"
        aria-label="Close notification">
        ✕
      </button>
    </div>
  );
}
