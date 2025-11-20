import axios from "axios";
import { API_BASE_URL } from "constants/url";
import React, { useState, useEffect } from "react";
import { Link } from "react-router";

type LuckyDraw = {
  id: number;
  title: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
};

const LuckyDrawList = () => {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({
    status: "",
    upcoming: false,
    completed: false,
  });

  // Fetch draws with filters
  const fetchDraws = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/draws`, {
        params: filters,
      });
      setDraws(response.data);
    } catch (err) {
      console.error("Error fetching draws:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, [filters]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Lucky Draws</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <button
          onClick={() => setFilters({ ...filters, upcoming: true })}
          className="p-2 border rounded bg-blue-500 text-white"
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilters({ ...filters, completed: true })}
          className="p-2 border rounded bg-green-500 text-white"
        >
          Completed
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">Loading draws...</div>
      ) : (
        <div>
          {draws.map((draw) => (
            <div
              key={draw.id}
              className="mb-4 p-4 border border-gray-300 rounded"
            >
              <h3 className="text-lg font-semibold">{draw.title}</h3>
              <p>Status: {draw.status}</p>
              <p>
                Time: {new Date(draw.startDateTime).toLocaleString()} -{" "}
                {new Date(draw.endDateTime).toLocaleString()}
              </p>
              <Link
                to={`/draws/${draw.id}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LuckyDrawList;
