import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-primary"
            >
              <path d="M12 10.5c-1.2 1.2-1.2 3.1 0 4.2.8.8 2.1.8 2.8 0l1.4-1.4c.8-.8.8-2.1 0-2.8-1.2-1.2-3.1-1.2-4.2 0Z" />
              <path d="M10.5 12c-1.2-1.2-1.2-3.1 0-4.2.8-.8 2.1-.8 2.8 0l1.4 1.4c.8.8.8 2.1 0 2.8-1.2 1.2-3.1 1.2-4.2 0Z" />
              <path d="M12 2a10 10 0 1 0 10 10" />
            </svg>
            <span className="text-xl font-display font-bold">Phoenix</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;