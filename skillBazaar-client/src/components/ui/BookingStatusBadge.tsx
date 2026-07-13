"use client";

interface BookingStatusBadgeProps {
  status: string;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "pending_payment":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusStyles()}`}>
      {getLabel()}
    </span>
  );
}
