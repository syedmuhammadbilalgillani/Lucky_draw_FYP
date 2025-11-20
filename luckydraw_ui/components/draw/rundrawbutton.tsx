import React, { useState } from "react";
import { runDraw } from "requests/draws";
import { logger } from "utils/logger";

interface RunDrawButtonProps {
  drawId: number;
  onSuccess?: () => void;
}

const RunDrawButton: React.FC<RunDrawButtonProps> = ({
  drawId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunDraw = async () => {
    if (
      !confirm(
        "Are you sure you want to run the draw? This will select winners and cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const winners = await runDraw(drawId);
      logger.info("Draw run successfully, winners:", winners.length);
      alert(`Draw completed! ${winners.length} winner(s) selected.`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      logger.error("Failed to run draw:", err);
      setError(err instanceof Error ? err.message : "Failed to run draw");
      alert(err instanceof Error ? err.message : "Failed to run draw");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      <button
        onClick={handleRunDraw}
        disabled={loading}
        className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
      >
        {loading ? "Running Draw..." : "Run Draw"}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        This will randomly select winners from all valid entries.
      </p>
    </div>
  );
};

export default RunDrawButton;
