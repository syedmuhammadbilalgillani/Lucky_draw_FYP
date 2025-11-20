import React, { useState } from "react";
import {
  changeDrawStatus,
  type DrawStatus,
} from "requests/draws";
import { logger } from "utils/logger";

interface StatusSelectorProps {
  drawId: number;
  currentStatus: DrawStatus;
  onStatusChange?: () => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  drawId,
  currentStatus,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<DrawStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: DrawStatus) => {
    if (newStatus === currentStatus) return;

    try {
      setLoading(true);
      await changeDrawStatus(drawId, newStatus);
      logger.info("Draw status updated successfully");
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      logger.error("Failed to update status:", err);
      alert(err instanceof Error ? err.message : "Failed to update status");
      setStatus(currentStatus); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => {
        const newStatus = e.target.value as DrawStatus;
        setStatus(newStatus);
        handleStatusChange(newStatus);
      }}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm ${
        status === "OPEN"
          ? "bg-green-100 text-green-800"
          : status === "COMPLETED"
          ? "bg-blue-100 text-blue-800"
          : status === "CLOSED"
          ? "bg-gray-100 text-gray-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      <option value="DRAFT">Draft</option>
      <option value="OPEN">Open</option>
      <option value="CLOSED">Closed</option>
      <option value="COMPLETED">Completed</option>
    </select>
  );
};

export default StatusSelector;
