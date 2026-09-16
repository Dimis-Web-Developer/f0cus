import Login from "./Login";
import Register from "./Register";
import LogOut from "./LogOut";
import { useAuth } from "../context/AuthContext";

function TopBar() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="hidden md:flex h-12 w-full items-center justify-end bg-black border-t-4 border-blue-600 px-6">
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <LogOut />
        ) : (
          <>
            <Login />

            <span className="text-gray-400">
              /
            </span>

            <Register />
          </>
        )}
      </div>
    </div>
  );
}

export default TopBar;