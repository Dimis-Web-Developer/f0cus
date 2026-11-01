import Login from "./Login";
import LogOut from "./LogOut";
import Register from  "./Register"
import { useAuth } from "../context/AuthContext";



function TopBar() {
  const { isLoggedIn } = useAuth();

  return (
<div className="hidden md:flex fixed top-0 left-40 right-0 z-40 h-12 items-center justify-end bg-slate-900 border-t-4 border-blue-600 px-6 ">      
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <LogOut />
        ) : (
          <>
            <Login />
            <span className="text-gray-400">/</span>
            <Register />
          </>
        )}
      </div>
    </div>
  );
}

export default TopBar;


