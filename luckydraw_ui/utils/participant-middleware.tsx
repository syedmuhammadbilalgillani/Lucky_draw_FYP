import { useAuth } from "context/auth-context";
import type React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logger } from "./logger";

const AuthMiddleware = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, initializing, user } = useAuth();
  logger.info("user", user);
  const navigate = useNavigate();

  logger.info("Admin layout");
  logger.info("isAuthenticated", isAuthenticated);
  logger.info("initializing", initializing);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/admin");
    } else if (user?.role === "PARTICIPANT") {
      navigate("/participant");
    } else {
      navigate("/");
    }
    // Wait for auth to finish initializing before checking
    if (!initializing && !isAuthenticated) {
      logger.info("Not authenticated, redirecting to login");
      navigate("/");
    }
  }, [isAuthenticated, initializing, navigate]);

  // Show nothing while initializing or if not authenticated
  if (initializing) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
};

export default AuthMiddleware;
