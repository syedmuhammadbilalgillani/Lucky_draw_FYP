import React, { useState, useEffect } from "react";
import { 
  getDrawParticipants, 
  createParticipantEntry,
  type ParticipantEntry 
} from "requests/draws";
import { getUsers, type User } from "requests/users";
import { logger } from "utils/logger";

interface DrawParticipantsProps {
  drawId: number;
}

const DrawParticipants: React.FC<DrawParticipantsProps> = ({ drawId }) => {
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [addingParticipant, setAddingParticipant] = useState(false);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const data = await getDrawParticipants(drawId);
        setParticipants(data);
      } catch (err) {
        logger.error("Failed to fetch participants:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch participants");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [drawId]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers({ role: "PARTICIPANT", status: "ACTIVE" });
      setUsers(data);
    } catch (err) {
      logger.error("Failed to fetch users:", err);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }

    try {
      setAddingParticipant(true);
      const newEntry = await createParticipantEntry(drawId, selectedUserId);
      logger.info("Participant added successfully:", newEntry);
      
      // Refresh participants list
      const data = await getDrawParticipants(drawId);
      setParticipants(data);
      
      // Reset form
      setShowAddForm(false);
      setSelectedUserId(null);
      alert("Participant added successfully!");
    } catch (err) {
      logger.error("Failed to add participant:", err);
      alert(err instanceof Error ? err.message : "Failed to add participant");
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
    if (users.length === 0) {
      fetchUsers();
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading participants...</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  // Get list of user IDs who are already participants
  const participantUserIds = new Set(participants.map(p => p.userId));
  // Filter out users who are already participants
  const availableUsers = users.filter(user => !participantUserIds.has(user.id));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">
          Total Participants: {participants.length}
        </p>
        <button
          onClick={handleShowAddForm}
          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add Participant
        </button>
      </div>

      {showAddForm && (
        <div className="border rounded p-3 mb-3 bg-gray-50">
          <h3 className="text-sm font-semibold mb-2">Add Participant</h3>
          <div className="space-y-2">
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="">Select a user...</option>
              {availableUsers.length === 0 ? (
                <option disabled>No available users</option>
              ) : (
                availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))
              )}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddParticipant}
                disabled={!selectedUserId || addingParticipant}
                className="flex-1 bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {addingParticipant ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedUserId(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {participants.length === 0 ? (
        <p className="text-sm text-gray-500">No participants yet</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Ticket #</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id} className="border-b">
                  <td className="p-2">
                    {participant.user?.fullName || "N/A"}
                  </td>
                  <td className="p-2">{participant.user?.email || "N/A"}</td>
                  <td className="p-2">
                    {participant.ticketNumber || "N/A"}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        participant.isValid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {participant.isValid ? "Valid" : "Invalid"}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(participant.entryTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DrawParticipants;
