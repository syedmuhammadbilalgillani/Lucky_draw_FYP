import React, { useState, useEffect } from "react";
import { getDraws, type LuckyDraw } from "requests/draws";
import { Link } from "react-router";
import DrawForm from "./drawform";
import { logger } from "utils/logger";

interface DrawListProps {
  showCreateForm?: boolean;
  filterStatus?: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED";
  showUpcoming?: boolean;
  showCompleted?: boolean;
}

const DrawList: React.FC<DrawListProps> = ({
  showCreateForm = false,
  filterStatus,
  showUpcoming,
  showCompleted,
}) => {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        const data = await getDraws({
          status: filterStatus,
          upcoming: showUpcoming,
          completed: showCompleted,
        });
        setDraws(data);
      } catch (err) {
        logger.error("Failed to fetch draws:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch draws");
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, [filterStatus, showUpcoming, showCompleted]);

  if (loading) return <div className="p-4">Loading draws...</div>;
  // if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lucky Draws</h1>
        {showCreateForm && (
          <Link
            to="/admin/draws/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Draw
          </Link>
        )}
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No draws found
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {draws.map((draw) => (
            <div
              key={draw.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{draw.title}</h2>
              {draw.description && (
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {draw.description}
                </p>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    draw.status === "OPEN"
                      ? "bg-green-100 text-green-800"
                      : draw.status === "COMPLETED"
                      ? "bg-blue-100 text-blue-800"
                      : draw.status === "CLOSED"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {draw.status}
                </span>
                <span className="text-sm text-gray-500">
                  {draw.drawType.replace("_", " ")}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                <p>Start: {new Date(draw.startDateTime).toLocaleString()}</p>
                <p>End: {new Date(draw.endDateTime).toLocaleString()}</p>
                <p>Max Winners: {draw.maxWinners}</p>
              </div>
              <Link
                to={`/admin/draws/${draw.id}`}
                className="text-blue-500 hover:underline"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrawList;
