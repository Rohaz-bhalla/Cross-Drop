import { useEffect, useState } from "react";
import { MessageSquare, Files, Github, LogOut } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

function Navbar() {
  const [roomID, setRoomID] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedID = localStorage.getItem("currentRoomID");
    if (storedID) setRoomID(storedID);
  }, []);

  const handleLeave = () => {
    localStorage.removeItem("currentRoomID");
    setRoomID(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-bold hover:text-primary transition-colors">
          Cross<span className="text-primary">Drop</span>
        </Link>

        <div className="flex items-center gap-4">
          {roomID && (
            <div className="flex bg-muted rounded-lg p-1">
              <Link to={`/room/${roomID}/chat`} className="p-2 hover:bg-background rounded-md transition-all">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link to={`/room/${roomID}/files`} className="p-2 hover:bg-background rounded-md transition-all">
                <Files className="h-5 w-5" />
              </Link>
            </div>
          )}

          <a href="https://github.com/Rohaz-bhalla/Cross-Drop" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            <Github className="h-5 w-5" />
          </a>
          
          <ModeToggle />

          {roomID && (
            <Button variant="ghost" size="icon" onClick={handleLeave} className="text-destructive hover:bg-destructive/10">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;