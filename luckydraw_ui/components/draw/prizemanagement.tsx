import React, { useState, useEffect } from "react";
import {
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  type Prize,
  type CreatePrizePayload,
  type UpdatePrizePayload,
} from "requests/draws";
import { logger } from "utils/logger";

interface PrizeManagementProps {
  drawId: number;
  onUpdate?: () => void;
}

const PrizeManagement: React.FC<PrizeManagementProps> = ({
  drawId,
  onUpdate,
}) => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  useEffect(() => {
    fetchPrizes();
  }, [drawId]);

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      const data = await getPrizes(drawId);
      setPrizes(data.sort((a, b) => a.prizeRank - b.prizeRank));
    } catch (err) {
      logger.error("Failed to fetch prizes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prizes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload: CreatePrizePayload) => {
    try {
      await createPrize(drawId, payload);
      await fetchPrizes();
      setShowForm(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      logger.error("Failed to create prize:", err);
      alert(err instanceof Error ? err.message : "Failed to create prize");
    }
  };

  const handleUpdate = async (prizeId: number, payload: UpdatePrizePayload) => {
    try {
      await updatePrize(prizeId, payload);
      await fetchPrizes();
      setEditingPrize(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      logger.error("Failed to update prize:", err);
      alert(err instanceof Error ? err.message : "Failed to update prize");
    }
  };

  const handleDelete = async (prizeId: number) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;

    try {
      await deletePrize(prizeId);
      await fetchPrizes();
      if (onUpdate) onUpdate();
    } catch (err) {
      logger.error("Failed to delete prize:", err);
      alert(err instanceof Error ? err.message : "Failed to delete prize");
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading prizes...</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">
          Total Prizes: {prizes.length}
        </p>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPrize(null);
          }}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add Prize
        </button>
      </div>

      {showForm && !editingPrize && (
        <PrizeForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPrize && (
        <PrizeForm
          prize={editingPrize}
          onSubmit={(payload) => handleUpdate(editingPrize.id, payload)}
          onCancel={() => setEditingPrize(null)}
        />
      )}

      {prizes.length === 0 ? (
        <p className="text-sm text-gray-500">No prizes yet</p>
      ) : (
        <div className="space-y-2">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="border rounded p-2 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="font-medium">
                  Rank {prize.prizeRank}: {prize.prizeName}
                </div>
                {prize.prizeDescription && (
                  <div className="text-sm text-gray-600">
                    {prize.prizeDescription}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Quantity: {prize.quantity}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPrize(prize)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prize.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface PrizeFormProps {
  prize?: Prize;
  onSubmit: (payload: CreatePrizePayload | UpdatePrizePayload) => void;
  onCancel: () => void;
}

const PrizeForm: React.FC<PrizeFormProps> = ({ prize, onSubmit, onCancel }) => {
  const [prizeName, setPrizeName] = useState(prize?.prizeName || "");
  const [prizeDescription, setPrizeDescription] = useState(
    prize?.prizeDescription || ""
  );
  const [quantity, setQuantity] = useState(prize?.quantity || 1);
  const [prizeRank, setPrizeRank] = useState(prize?.prizeRank || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prize) {
      onSubmit({
        prizeName,
        prizeDescription: prizeDescription || undefined,
        quantity,
        prizeRank,
      });
    } else {
      onSubmit({
        prizeName,
        prizeDescription: prizeDescription || undefined,
        quantity,
        prizeRank,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 mb-2 space-y-2">
      <div>
        <label className="block text-xs font-medium mb-1">Prize Name *</label>
        <input
          type="text"
          value={prizeName}
          onChange={(e) => setPrizeName(e.target.value)}
          required
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <input
          type="text"
          value={prizeDescription}
          onChange={(e) => setPrizeDescription(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">Rank *</label>
          <input
            type="number"
            value={prizeRank}
            onChange={(e) => setPrizeRank(parseInt(e.target.value) || 1)}
            required
            min={1}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Quantity *</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
            min={1}
            className="w-full px-2 py-1 text-sm border rounded"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
        >
          {prize ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 text-sm rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PrizeManagement;

