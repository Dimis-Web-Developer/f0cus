import { NavLink } from "react-router-dom";

import dashboard from "../assets/IconsFiles/Neutral/dash.svg";
import project from "../assets/IconsFiles/Neutral/proj.svg";
import challenge from "../assets/IconsFiles/Neutral/chall.svg";

import dashboardAccent from "../assets/IconsFiles/Accent/dash-accent.svg";
import projectAccent from "../assets/IconsFiles/Accent/proj-accent.svg";
import challengeAccent from "../assets/IconsFiles/Accent/chall-accent.svg";

import Login from "./Login";
import Register from "./Register";
import LogOut from "./LogOut";

import { useAuth } from "../context/AuthContext";

// import logo from "../assets/logo.png"

function MobileNav() {

    const { isLoggedIn } = useAuth();


const app : {name:string
}= {
    name :"FOCUS",
  
  }  
  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: dashboard, activeIcon: dashboardAccent },
    { label: "Projects", path: "/projects", icon: project, activeIcon: projectAccent },
    { label: "Challenges", path: "/challenges", icon: challenge, activeIcon: challengeAccent },
  ];

  return (
    <>
<div className="flex fixed top-0 left-0 right-0 z-50 w-full justify-between py-3 px-3 text-white text-xl bg-slate-900 border-b-4 border-blue-600 hover:text-gray-400 md:hidden">  <NavLink to="/">
    {app.name}
  </NavLink>

  <div className="ml-auto flex items-center gap-2">
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

      <div className="md:hidden fixed bottom-0 left-0 right-0">
        <nav className="bg-slate-900 border-t-4 border-blue-600 flex justify-around py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className="flex flex-col items-center"
            >
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={item.label}
                    className="w-8 h-8"
                  />
                 
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}

export default MobileNav;