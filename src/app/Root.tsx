import { Outlet, useLocation } from "react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";

export default function Root() {
  const location = useLocation();
  
  // Pages where footer/navbar might not be shown
  const noFooterPages = ["/login", "/tracking"];
  const shouldShowFooter = !noFooterPages.some(path => location.pathname.includes(path));
  const noNavbarPages = ["/login"];
  const shouldShowNavbar = !noNavbarPages.some(path => location.pathname.includes(path));

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors flex flex-col">
            {shouldShowNavbar && <Navbar />}
            <div className="flex-1">
              <Outlet />
            </div>
            {shouldShowFooter && <Footer />}
            <Toaster />
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}