import ParticipantDrawList from "components/participant/drawlist";
import { useAuth } from "context/auth-context";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logger } from "utils/logger";

const PARTICIPANTHomePage = () => {
  const { initializing, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      logger.info("Not authenticated, redirecting to login");
      navigate("/");
    }
  }, [initializing, isAuthenticated, navigate]);

  if (initializing) return <p>Loading...</p>;
  
  logger.info("HomePage", { initializing, isAuthenticated });
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="p-6">
      <ParticipantDrawList />
    </div>
  );
};

export default PARTICIPANTHomePage;