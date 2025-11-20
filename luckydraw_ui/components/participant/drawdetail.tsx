import React, { useState, useEffect } from "react";
import {
  getDrawDetail,
  checkUserEntry,
  createEntry,
  getDrawWinners,
  type LuckyDraw,
  type UserEntryStatus,
  type Winner,
} from "requests/draws";
import { useParams, useNavigate } from "react-router";
import { logger } from "utils/logger";
import { useAuth } from "context/auth-context";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Gift,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ticket,
  Sparkles,
} from "lucide-react";

const ParticipantDrawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draw, setDraw] = useState<LuckyDraw | null>(null);
  const [entryStatus, setEntryStatus] = useState<UserEntryStatus | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingEntry, setCheckingEntry] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const drawData = await getDrawDetail(parseInt(id || "0"));
        setDraw(drawData);

        // Check if user has entered
        if (user) {
          try {
            const entry = await checkUserEntry(drawData.id);
            setEntryStatus(entry);
          } catch (err) {
            // User hasn't entered yet, that's okay
            setEntryStatus(null);
          }
        }

        // Fetch winners if draw is completed
        if (drawData.status === "COMPLETED") {
          try {
            const winnersData = await getDrawWinners(drawData.id);
            setWinners(winnersData);
          } catch (err) {
            logger.error("Failed to fetch winners:", err);
          }
        }
      } catch (err) {
        logger.error("Failed to fetch draw:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch draw");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleCheckEntry = async () => {
    if (!draw || !user) return;

    try {
      setCheckingEntry(true);
      const entry = await checkUserEntry(draw.id);
      setEntryStatus(entry);
    } catch (err) {
      logger.error("Failed to check entry:", err);
      alert(err instanceof Error ? err.message : "Failed to check entry");
    } finally {
      setCheckingEntry(false);
    }
  };

  const handleJoinDraw = async () => {
    if (!draw || !user) return;

    if (!confirm("Are you sure you want to join this draw?")) {
      return;
    }

    try {
      setJoining(true);
      const result = await createEntry(draw.id);
      logger.info("Successfully joined draw:", result);
      alert(`Successfully joined! Your ticket number is: ${result.ticketNumber}`);
      // Refresh entry status
      try {
        const entry = await checkUserEntry(draw.id);
        setEntryStatus(entry);
      } catch (err) {
        logger.error("Failed to refresh entry status:", err);
      }
      // Refresh draw data to update entry count
      try {
        const drawData = await getDrawDetail(draw.id);
        setDraw(drawData);
      } catch (err) {
        logger.error("Failed to refresh draw data:", err);
      }
    } catch (err) {
      logger.error("Failed to join draw:", err);
      alert(err instanceof Error ? err.message : "Failed to join draw");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading draw details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Draw not found
        </div>
      </div>
    );
  }

  const isOpen = draw.status === "OPEN";
  const isCompleted = draw.status === "COMPLETED";
  const hasEntered = entryStatus !== null;
  const participantCount = draw.entries?.length || 0;
  const prizeCount = draw.prizes?.length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "COMPLETED":
        return <Trophy className="w-5 h-5 text-blue-600" />;
      case "CLOSED":
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/participant")}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Draws</span>
        </button>

        {/* Main Draw Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{draw.title}</h1>
              {draw.description && (
                <p className="text-gray-600 text-lg">{draw.description}</p>
              )}
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(draw.status)}`}>
              {getStatusIcon(draw.status)}
              <span className="font-semibold">{draw.status}</span>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-2xl font-bold text-gray-800">{participantCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Winners</p>
                  <p className="text-2xl font-bold text-gray-800">{winners.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prizes</p>
                  <p className="text-2xl font-bold text-gray-800">{prizeCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Winners</p>
                  <p className="text-2xl font-bold text-gray-800">{draw.maxWinners}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Draw Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Start Date & Time
              </label>
              <p className="font-medium text-gray-800 text-lg">
                {new Date(draw.startDateTime).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                End Date & Time
              </label>
              <p className="font-medium text-gray-800 text-lg">
                {new Date(draw.endDateTime).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-2">Draw Type</label>
              <p className="font-medium text-gray-800">
                {draw.drawType.replace("_", " ")}
              </p>
            </div>
            {draw.eligibilityCriteria && (
              <div>
                <label className="text-sm text-gray-500 mb-2">Eligibility Criteria</label>
                <p className="font-medium text-gray-800">{draw.eligibilityCriteria}</p>
              </div>
            )}
          </div>
        </div>

        {/* Entry Status Card */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-blue-600" />
              Your Entry Status
            </h2>
            {hasEntered ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Entry Status</p>
                        <p className={`text-lg font-bold ${
                          entryStatus?.entryStatus === "VALID"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}>
                          {entryStatus?.entryStatus}
                        </p>
                      </div>
                    </div>
                    {entryStatus?.ticketNumber && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Your Ticket Number</p>
                        <p className="text-2xl font-bold text-gray-800 font-mono">
                          {entryStatus.ticketNumber}
                        </p>
                      </div>
                    )}
                  </div>
                  <Sparkles className="w-12 h-12 text-green-400 opacity-50" />
                </div>
                <p className="text-sm text-gray-600">
                  You're successfully entered in this draw! Good luck!
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 rounded-xl p-6 mb-4 border border-gray-200">
                  <p className="text-gray-700 mb-2 font-medium">
                    You haven't entered this draw yet.
                  </p>
                  {isOpen ? (
                    <p className="text-sm text-gray-600">
                      Click the button below to join and get your ticket number.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      This draw is not currently open for entries.
                    </p>
                  )}
                </div>
                {isOpen && (
                  <button
                    onClick={handleJoinDraw}
                    disabled={joining}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {joining ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5" />
                        <span>Join Draw</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Prizes Section */}
        {draw.prizes && draw.prizes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              Prizes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draw.prizes
                .sort((a, b) => a.prizeRank - b.prizeRank)
                .map((prize) => (
                  <div
                    key={prize.id}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                        Rank {prize.prizeRank}
                      </div>
                      <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{prize.prizeName}</h3>
                    {prize.prizeDescription && (
                      <p className="text-sm text-gray-600 mb-2">{prize.prizeDescription}</p>
                    )}
                    <p className="text-xs text-gray-500">Quantity: {prize.quantity}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Winners Section */}
        {isCompleted && winners.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Winners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-lg mb-1">
                        {winner.entry?.user?.fullName || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Prize:</span> {winner.prize?.prizeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Rank {winner.prize?.prizeRank} • {new Date(winner.winTime).toLocaleString()}
                      </div>
                    </div>
                    <Trophy className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDrawDetail;

