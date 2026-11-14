
import { NavLink } from "react-router-dom";

import dashboard from "../assets/IconsFiles/Neutral/dash.svg";
import project from "../assets/IconsFiles/Neutral/proj.svg";
import challenge from "../assets/IconsFiles/Neutral/chall.svg";

import dashboardAccent from "../assets/IconsFiles/Accent/dash-accent.svg";
import projectAccent from "../assets/IconsFiles/Accent/proj-accent.svg";
import challengeAccent from "../assets/IconsFiles/Accent/chall-accent.svg";

import { useAuth } from "../context/AuthContext";

function DeskTNav() {
  const { isLoggedIn } = useAuth();

  const app: { name: string } = {
    name: "FOCUS",
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: dashboard,
      activeIcon: dashboardAccent,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: project,
      activeIcon: projectAccent,
    },
    {
      label: "Challenges",
      path: "/challenges",
      icon: challenge,
      activeIcon: challengeAccent,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 z-50 hidden h-screen w-40 shrink-0 flex-col border-y-4 border-l-4 border-blue-600 bg-slate-900 md:flex">

      <nav className="flex h-full w-36 flex-col gap-3 px-2 pt-32 text-gray-400">

        {/* Show navigation links only when logged in */}
        {isLoggedIn &&
          menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 transition ${
                  isActive
                    ? "border-l-2 border-l-white text-white"
                    : "hover:bg-white hover:text-black"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={
                      isActive
                        ? item.activeIcon
                        : item.icon
                    }
                    alt=""
                    className="h-8 w-8"
                  />

                  <span className="py-4">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

        {/* FOCUS logo remains visible */}
        <NavLink
          to="/"
          className="mt-auto pb-28 text-center text-xl text-white hover:text-gray-400"
        >
          {app.name}
        </NavLink>

      </nav>
    </aside>
  );
}

export default DeskTNav;
