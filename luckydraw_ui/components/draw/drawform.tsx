import React, { useState, useEffect } from "react";
import {
  createDraw,
  updateDraw,
  type CreateDrawPayload,
  type UpdateDrawPayload,
  type DrawType,
  type LuckyDraw,
} from "requests/draws";
import { useNavigate } from "react-router";
import { logger } from "utils/logger";

interface DrawFormProps {
  drawId?: number;
  existingDrawData?: LuckyDraw;
  onSuccess?: () => void;
}

const DrawForm: React.FC<DrawFormProps> = ({
  drawId,
  existingDrawData,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(existingDrawData?.title || "");
  const [description, setDescription] = useState(
    existingDrawData?.description || ""
  );
  const [drawType, setDrawType] = useState<DrawType>(
    existingDrawData?.drawType || "SINGLE_WINNER"
  );
  const [startDateTime, setStartDateTime] = useState(
    existingDrawData
      ? new Date(existingDrawData.startDateTime)
          .toISOString()
          .slice(0, 16)
      : ""
  );
  const [endDateTime, setEndDateTime] = useState(
    existingDrawData
      ? new Date(existingDrawData.endDateTime).toISOString().slice(0, 16)
      : ""
  );
  const [maxWinners, setMaxWinners] = useState(
    existingDrawData?.maxWinners || 1
  );
  const [eligibilityCriteria, setEligibilityCriteria] = useState(
    existingDrawData?.eligibilityCriteria || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (drawId) {
        const updatePayload: UpdateDrawPayload = {
          title,
          description: description || undefined,
          maxWinners,
          eligibilityCriteria: eligibilityCriteria || undefined,
        };
        await updateDraw(drawId, updatePayload);
        logger.info("Draw updated successfully");
      } else {
        const createPayload: CreateDrawPayload = {
          title,
          description: description || undefined,
          drawType,
          startDateTime: new Date(startDateTime).toISOString(),
          endDateTime: new Date(endDateTime).toISOString(),
          maxWinners,
          eligibilityCriteria: eligibilityCriteria || undefined,
        };
        const newDraw = await createDraw(createPayload);
        logger.info("Draw created successfully:", newDraw.id);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(`/admin/draws/${newDraw.id}`);
        }
      }
    } catch (err) {
      logger.error("Failed to save draw:", err);
      setError(err instanceof Error ? err.message : "Failed to save draw");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter draw title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="Enter draw description"
        />
      </div>

      {!drawId && (
        <div>
          <label className="block text-sm font-medium mb-1">Draw Type *</label>
          <select
            value={drawType}
            onChange={(e) => setDrawType(e.target.value as DrawType)}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="SINGLE_WINNER">Single Winner</option>
            <option value="MULTI_WINNER">Multi Winner</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Maximum Winners *
        </label>
        <input
          type="number"
          value={maxWinners}
          onChange={(e) => setMaxWinners(parseInt(e.target.value) || 1)}
          required
          min={1}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Eligibility Criteria
        </label>
        <input
          type="text"
          value={eligibilityCriteria}
          onChange={(e) => setEligibilityCriteria(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter eligibility criteria (optional)"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Saving..." : drawId ? "Update Draw" : "Create Draw"}
      </button>
    </form>
  );
};

export default DrawForm;
