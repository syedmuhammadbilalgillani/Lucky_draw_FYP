import axios from 'axios';
import { API_BASE_URL } from 'constants/url';
import React, { useState, useEffect } from 'react';

const WinnersList = ({ drawId }: { drawId: number }) => {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch winners after draw completion
  const fetchWinners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/draws/${drawId}/winners`);
      setWinners(response.data);
    } catch (err) {
      console.error('Error fetching winners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [drawId]);

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-xl font-semibold mb-4">Winners</h3>

      {loading ? (
        <div className="text-center">Loading winners...</div>
      ) : (
        <ul>
          {winners.map((winner, index) => (
            <li key={index}>
              {winner.prize.prizeName} - {winner.entry.user.fullName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WinnersList;
