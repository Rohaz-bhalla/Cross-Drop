import React, { useEffect, useState } from "react";
import { BsFillChatTextFill } from "react-icons/bs";
import { GoFileSubmodule } from "react-icons/go";
import { FaGithub } from "react-icons/fa";
import { ModeToggle } from "./ModeToggle";
import { Link } from "react-router-dom";

function Navbar() {
  const [roomID, setRoomID] = useState<string | null>(null);

  // 🔁 Load saved roomID (set by ChatRoom/FileRoom)
  useEffect(() => {
    const storedID = localStorage.getItem("currentRoomID");
    if (storedID) setRoomID(storedID);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 text-foreground">
        
        {/* Brand / Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight hover:text-primary transition-colors"
        >
          Cross<span className="text-primary">Drop</span>
        </Link>

        {/* Navigation Icons */}
        <ul className="flex items-center gap-6 text-xl">
          <li>
            <Link
              to={roomID ? `/room/${roomID}/chat` : "/"}
              className="hover:text-primary transition-colors"
              title="Chat Room"
            >
              <BsFillChatTextFill />
            </Link>
          </li>

          <li>
            <Link
              to={roomID ? `/room/${roomID}/files` : "/"}
              className="hover:text-primary transition-colors"
              title="File Room"
            >
              <GoFileSubmodule />
            </Link>
          </li>

          <li>
            <a
              href="https://github.com/Rohaz-bhalla/Cross-Drop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="GitHub Repository"
            >
              <FaGithub />
            </a>
          </li>

          {/* Dark/Light Mode Toggle */}
          <li>
            <ModeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
