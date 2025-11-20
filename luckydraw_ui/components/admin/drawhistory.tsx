import React, { useState, useEffect } from "react";
import { getDraws, getDrawWinners, getDrawParticipants, type LuckyDraw, type Winner } from "requests/draws";
import { Link } from "react-router";
import { logger } from "utils/logger";
import { Calendar, Users, Trophy, FileText, Download, Eye } from "lucide-react";

const DrawHistory: React.FC = () => {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDraw, setSelectedDraw] = useState<LuckyDraw | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month" | "year">("all");

  useEffect(() => {
    fetchCompletedDraws();
  }, [dateFilter]);

  const fetchCompletedDraws = async () => {
    try {
      setLoading(true);
      const data = await getDraws({ status: "COMPLETED" });
      
      // Filter by date if needed
      let filteredData = data;
      if (dateFilter !== "all") {
        const now = new Date();
        const filterDate = new Date();
        
        switch (dateFilter) {
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            filterDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filteredData = data.filter(draw => {
          const drawDate = new Date(draw.createdAt);
          return drawDate >= filterDate;
        });
      }
      
      // Sort by creation date, newest first
      filteredData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setDraws(filteredData);
    } catch (err) {
      logger.error("Failed to fetch completed draws:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch draws");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrawDetails = async (draw: LuckyDraw) => {
    try {
      setLoadingDetails(true);
      setSelectedDraw(draw);
      
      // Fetch winners and participants in parallel
      const [winnersData, participantsData] = await Promise.all([
        getDrawWinners(draw.id).catch(() => []),
        getDrawParticipants(draw.id).catch(() => []),
      ]);
      
      setWinners(winnersData);
      setParticipantCount(participantsData.length);
    } catch (err) {
      logger.error("Failed to fetch draw details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const exportToCSV = (draw: LuckyDraw) => {
    if (!draw) return;
    
    const headers = ["Draw ID", "Title", "Status", "Start Date", "End Date", "Max Winners", "Participants", "Winners"];
    const row = [
      draw.id,
      draw.title,
      draw.status,
      new Date(draw.startDateTime).toLocaleString(),
      new Date(draw.endDateTime).toLocaleString(),
      draw.maxWinners,
      participantCount,
      winners.length,
    ];
    
    const csv = [headers.join(","), row.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `draw-${draw.id}-report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading draw history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Draw History & Reports</h1>
        <p className="text-gray-600">View past draws and generate reports</p>
      </div>

      {/* Date Filter */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setDateFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            dateFilter === "all"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setDateFilter("week")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            dateFilter === "week"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          Last Week
        </button>
        <button
          onClick={() => setDateFilter("month")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            dateFilter === "month"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setDateFilter("year")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            dateFilter === "year"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          }`}
        >
          Last Year
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draws List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Completed Draws ({draws.length})</h2>
            </div>
            <div className="divide-y">
              {draws.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No completed draws found</p>
                </div>
              ) : (
                draws.map((draw) => (
                  <div
                    key={draw.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedDraw?.id === draw.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                    }`}
                    onClick={() => fetchDrawDetails(draw)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{draw.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(draw.createdAt).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            COMPLETED
                          </span>
                        </div>
                      </div>
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Draw Details & Report */}
        <div className="lg:col-span-1">
          {selectedDraw ? (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{selectedDraw.title}</h2>
                {selectedDraw.description && (
                  <p className="text-sm text-gray-600 mb-4">{selectedDraw.description}</p>
                )}
              </div>

              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading details...</p>
                </div>
              ) : (
                <>
                  {/* Statistics */}
                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Participants
                        </span>
                        <span className="font-semibold text-gray-800">{participantCount}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Winners
                        </span>
                        <span className="font-semibold text-gray-800">{winners.length}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Max Winners</span>
                        <span className="font-semibold text-gray-800">{selectedDraw.maxWinners}</span>
                      </div>
                    </div>
                  </div>

                  {/* Draw Info */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="text-gray-800">
                        {new Date(selectedDraw.startDateTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="text-gray-800">
                        {new Date(selectedDraw.endDateTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-800">
                        {selectedDraw.drawType.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Winners List */}
                  {winners.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">Winners</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {winners.map((winner) => (
                          <div
                            key={winner.id}
                            className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm"
                          >
                            <div className="font-medium text-gray-800">
                              {winner.entry?.user?.fullName || "Anonymous"}
                            </div>
                            <div className="text-xs text-gray-600">
                              Prize: {winner.prize?.prizeName} (Rank {winner.prize?.prizeRank})
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link
                      to={`/admin/draws/${selectedDraw.id}`}
                      className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Full Details
                    </Link>
                    <button
                      onClick={() => exportToCSV(selectedDraw)}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Report (CSV)
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Select a draw to view details and generate reports</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawHistory;

