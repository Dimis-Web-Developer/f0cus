import { BrowserRouter, Routes, Route } from "react-router-dom";

import DeskTNav from "./components/DeskTNav";
import MobileNav from "./components/MobileNav";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import DashBoard from "./pages/DashBoard";
import Projects from "./pages/Projects";
import Challenges from "./pages/Challenges";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh">
        {/* Fixed desktop sidebar */}
        <DeskTNav />

        {/* Fixed mobile navigation */}
        <MobileNav />

        {/* Fixed desktop top bar */}
        <TopBar />

        {/* Main page content */}
      <main className="min-h-dvh min-w-0 px-3 pt-16 pb-20 sm:px-4 md:ml-40 md:px-6 md:pt-12 md:pb-14">

          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashBoard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />

            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Challenges />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>

        {/* Fixed desktop footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;