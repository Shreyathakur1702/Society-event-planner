import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Events from "./pages/Events";
import AppNavbar from "./components/Navbar";
import EventForm from "./pages/EventForm";

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
        <Route path="/create-event" element={<PageWrapper><EventForm /></PageWrapper>} />
        <Route path="/edit-event/:id" element={<PageWrapper><EventForm /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <AppNavbar />
      <main>
        <AnimatedRoutes />
        <ToastContainer position="top-right" autoClose={2000} />
      </main>
    </>
  );
}

export default App;
