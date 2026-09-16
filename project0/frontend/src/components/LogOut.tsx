import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LogOut() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm md:text-lg cursor-pointer text-white hover:text-gray-400 transition-colors"
    >
      Logout
    </button>
  );
}

export default LogOut;