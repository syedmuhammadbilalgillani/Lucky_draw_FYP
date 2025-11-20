import React, { useState, useEffect } from "react";
import {
  getDrawDetail,
  deleteDraw,
  getDrawWinners,
  type LuckyDraw,
  type Winner,
} from "requests/draws";
import { useParams, useNavigate } from "react-router";
import DrawForm from "./drawform";
import RunDrawButton from "./rundrawbutton";
import DrawParticipants from "./drawparticipants";
import StatusSelector from "./statusselector";
import PrizeManagement from "./prizemanagement";
import { logger } from "utils/logger";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Gift,
  Edit,
  Trash2,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const DrawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [draw, setDraw] = useState<LuckyDraw | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchDraw = async () => {
      try {
        setLoading(true);
        const data = await getDrawDetail(parseInt(id || "0"));
        setDraw(data);
        
        // Fetch winners if draw is completed
        if (data.status === "COMPLETED") {
          try {
            const winnersData = await getDrawWinners(data.id);
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

    fetchDraw();
  }, [id, refreshKey]);

  const handleDelete = async () => {
    if (!draw) return;

    try {
      await deleteDraw(draw.id);
      logger.info("Draw deleted successfully");
      navigate("/admin/draws");
    } catch (err) {
      logger.error("Failed to delete draw:", err);
      alert(err instanceof Error ? err.message : "Failed to delete draw");
      setShowDeleteConfirm(false);
    }
  };

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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
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

  const participantCount = draw.entries?.length || 0;
  const prizeCount = draw.prizes?.length || 0;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/draws")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Draws</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{draw.title}</h1>
                {draw.description && (
                  <p className="text-gray-600 text-lg">{draw.description}</p>
                )}
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(draw.status)}`}>
                {getStatusIcon(draw.status)}
                <StatusSelector
                  drawId={draw.id}
                  currentStatus={draw.status}
                  onStatusChange={handleRefresh}
                />
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
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
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
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

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
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

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Draw Info & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Draw Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Draw Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      Start Date & Time
                    </label>
                    <p className="font-medium text-gray-800">
                      {new Date(draw.startDateTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      End Date & Time
                    </label>
                    <p className="font-medium text-gray-800">
                      {new Date(draw.endDateTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1">Draw Type</label>
                    <p className="font-medium text-gray-800">
                      {draw.drawType.replace("_", " ")}
                    </p>
                  </div>
                  {draw.eligibilityCriteria && (
                    <div>
                      <label className="text-sm text-gray-500 mb-1">Eligibility Criteria</label>
                      <p className="font-medium text-gray-800">{draw.eligibilityCriteria}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Draw */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Edit className="w-6 h-6 text-blue-600" />
                Edit Draw
              </h2>
              <DrawForm
                drawId={draw.id}
                existingDrawData={draw}
                onSuccess={handleRefresh}
              />
            </div>

            {/* Run Draw */}
            {draw.status === "OPEN" && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  Run Draw
                </h2>
                <RunDrawButton drawId={draw.id} onSuccess={handleRefresh} />
              </div>
            )}

            {/* Winners Display */}
            {draw.status === "COMPLETED" && winners.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Winners
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {winners.map((winner) => (
                    <div
                      key={winner.id}
                      className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 mb-1">
                            {winner.entry?.user?.fullName || "Anonymous"}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Prize:</span> {winner.prize?.prizeName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Rank {winner.prize?.prizeRank}
                          </div>
                        </div>
                        <Trophy className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delete Draw */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
              <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Danger Zone
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Draw
              </button>
            </div>
          </div>

          {/* Right Column - Prizes & Participants */}
          <div className="space-y-6">
            {/* Prizes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-600" />
                Prizes
              </h2>
              <PrizeManagement drawId={draw.id} onUpdate={handleRefresh} />
            </div>

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Participants
              </h2>
              <DrawParticipants drawId={draw.id} />
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Draw</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{draw.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawDetail;
