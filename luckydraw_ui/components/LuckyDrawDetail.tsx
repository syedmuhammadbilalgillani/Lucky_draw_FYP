import axios from 'axios';
import { API_BASE_URL } from 'constants/url';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

type LuckyDrawDetail = {
  title: string;
  description: string;
  status: string;
  prizes: { prizeName: string; prizeRank: number }[];
};

const LuckyDrawDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [draw, setDraw] = useState<LuckyDrawDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [joined, setJoined] = useState<boolean>(false);

  // Fetch draw details
  const fetchDrawDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/draws/${id}`);
      setDraw(response.data);
    } catch (err) {
      console.error('Error fetching draw details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawDetail();
  }, [id]);

  const joinDraw = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/draws/${id}/entries`);
      setJoined(true);
      alert('You have successfully joined the draw!');
    } catch (err) {
      console.error('Error joining draw:', err);
      alert('You are not eligible to join this draw.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Lucky Draw Details</h2>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">Loading draw details...</div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold">{draw?.title}</h3>
          <p>{draw?.description}</p>
          <p>Status: {draw?.status}</p>

          <h4 className="mt-4 text-lg font-semibold">Prizes</h4>
          <ul>
            {draw?.prizes.map((prize, index) => (
              <li key={index}>
                {prize.prizeRank}. {prize.prizeName}
              </li>
            ))}
          </ul>

          {/* Join Button */}
          {draw?.status === 'OPEN' && !joined && (
            <button
              onClick={joinDraw}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
            >
              Join Draw
            </button>
          )}

          {joined && (
            <p className="mt-4 text-green-500">You have joined the draw!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LuckyDrawDetail;
