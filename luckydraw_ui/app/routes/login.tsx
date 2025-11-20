import { LoginForm } from "components/login";
import { RegisterForm } from "components/register";
import { useAuth } from "context/auth-context";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const { isAuthenticated, initializing, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initializing && isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "PARTICIPANT") {
        navigate("/participant");
      }
    }
  }, [isAuthenticated, initializing, user, navigate]);

  if (initializing) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-2xl font-semibold mb-6">Welcome to Our Platform</div>
      {isRegister ? (
        <RegisterForm setIsRegister={setIsRegister} />
      ) : (
        <LoginForm setIsRegister={setIsRegister} />
      )}
    </div>
  );
}

export default LoginPage;