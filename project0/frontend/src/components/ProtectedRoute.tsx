import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectRouteProps = {
  children: React.ReactNode;
};

function ProtectedRoute({
  children,
}: ProtectRouteProps) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;