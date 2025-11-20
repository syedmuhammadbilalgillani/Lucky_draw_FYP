import React, { useState, useEffect } from "react";
import { getDraws, type LuckyDraw } from "requests/draws";
import { Link } from "react-router";
import { logger } from "utils/logger";

const ParticipantDrawList: React.FC = () => {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "open" | "upcoming" | "completed">("all");

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        let data: LuckyDraw[];
        
        if (filter === "open") {
          data = await getDraws({ status: "OPEN" });
        } else if (filter === "upcoming") {
          data = await getDraws({ upcoming: true });
        } else if (filter === "completed") {
          data = await getDraws({ completed: true });
        } else {
          data = await getDraws();
        }
        
        setDraws(data);
      } catch (err) {
        logger.error("Failed to fetch draws:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch draws");
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, [filter]);

  if (loading) return <div className="p-4">Loading draws...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Draws</h1>
        <p className="text-gray-600">Browse and join exciting lucky draws</p>
      </div>

      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            filter === "all"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("open")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            filter === "open"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            filter === "upcoming"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            filter === "completed"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          Completed
        </button>
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">No draws found</p>
          <p className="text-gray-400 text-sm mt-2">Check back later for new draws</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {draws.map((draw) => (
            <div
              key={draw.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-800 flex-1">{draw.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
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
                </div>
                {draw.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {draw.description}
                  </p>
                )}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium w-24">Start:</span>
                    <span>{new Date(draw.startDateTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium w-24">End:</span>
                    <span>{new Date(draw.endDateTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium w-24">Winners:</span>
                    <span>{draw.maxWinners}</span>
                  </div>
                </div>
                <Link
                  to={`/participant/draws/${draw.id}`}
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantDrawList;

