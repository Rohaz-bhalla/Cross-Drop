/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "@/components/Navbar";
import { 
  Clipboard, Check, Send, Settings2, 
  MessageSquare, ArrowDown 
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";


// Initialize socket outside to prevent re-connections on render
// Use Environment Variable, or default to localhost for development
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
const socket = io(SERVER_URL)

interface Message {
  id: string;
  text: string;
  sender: string;
  isUser: boolean;
  timestamp: number;
}

// Helper to generate consistent colors from names
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", 
    "bg-green-500", "bg-emerald-500", "bg-teal-500", 
    "bg-cyan-500", "bg-blue-500", "bg-indigo-500", 
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
    "bg-pink-500", "bg-rose-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

function CopyRoomLink({ roomID }: { roomID: string | undefined }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!roomID) return;
    const link = `${window.location.origin.replace(/^http:/, "https:")}/room/${roomID}/chat`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      title="Copy Link"
      className="h-6 w-6 ml-2 hover:bg-primary/10"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />}
    </Button>
  );
}

function ChatRoom() {
  const { roomID } = useParams();
  
  // State
  const [username, setUsername] = useState(() => localStorage.getItem("crossdrop-username") || `User-${Math.floor(Math.random() * 1000)}`);
  const [tempName, setTempName] = useState(username);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll handling
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Scroll detection
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Setup Socket & Room
  useEffect(() => {
    if (roomID) localStorage.setItem("currentRoomID", roomID);

    socket.emit("join-room", roomID);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    const onReceiveMessage = (data: { text: string; sender: string }) => {
      setChat((prev) => [
        ...prev,
        {
          id: uuidv4(),
          text: data.text,
          sender: data.sender || "Anonymous",
          isUser: false,
          timestamp: Date.now(),
        },
      ]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-message", onReceiveMessage);

    // Initial check
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-message", onReceiveMessage);
    };
  }, [roomID]);

  // Actions
  function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: uuidv4(),
      text: message,
      sender: username,
      isUser: true,
      timestamp: Date.now(),
    };

    socket.emit("send-message", { roomID, text: message, sender: username });
    setChat((prev) => [...prev, newMessage]);
    setMessage("");
  }

  function saveUsername() {
    if (!tempName.trim()) return;
    setUsername(tempName);
    localStorage.setItem("crossdrop-username", tempName);
    toast.success("Identity updated!");
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] w-full pt-[64px] px-4 bg-background">
        <Card className="w-full max-w-3xl h-[85vh] border shadow-xl flex flex-col bg-card overflow-hidden">
          
          {/* Header */}
          <CardHeader className="border-b bg-muted/40 px-4 py-3 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {isConnected ? "Live Chat" : "Disconnected"}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    Room: <span className="font-mono text-primary ml-1">{roomID?.slice(0, 8)}</span>
                    <CopyRoomLink roomID={roomID} />
                  </CardDescription>
                </div>
              </div>

              {/* User Settings */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-9 gap-2 px-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(username)}`}>
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate hidden sm:inline-block">{username}</span>
                    <Settings2 className="h-3.5 w-3.5 ml-1 text-white" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Your Identity</h4>
                      <p className="text-xs text-muted-foreground">Change how you appear to others.</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Display Name"
                        className="h-9"
                        onKeyDown={(e) => e.key === "Enter" && saveUsername()}
                      />
                      <Button size="sm" onClick={saveUsername} className="h-9">Save</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>

          {/* Chat Area */}
          <CardContent 
            ref={chatContainerRef}
            onScroll={handleScroll}
            // UPDATED: Removed hardcoded slate colors. used semantic bg-background/bg-muted
            className="flex-1 p-4 overflow-y-auto space-y-6 relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent bg-background/50"
          >
            {chat.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-40 space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chat.map((msg, index) => {
                  // Message Grouping Logic
                  const isSequence = index > 0 && chat[index - 1].sender === msg.sender;
                  const showAvatar = !msg.isUser && !isSequence;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.isUser ? "justify-end" : "justify-start"} ${isSequence ? "mt-1" : "mt-4"}`}
                    >
                      <div className={`flex max-w-[80%] md:max-w-[70%] ${msg.isUser ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                        
                        {/* Avatar (Left side for others) */}
                        {!msg.isUser && (
                          <div className="w-8 shrink-0">
                            {showAvatar && (
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm ${getAvatarColor(msg.sender)}`}
                                title={msg.sender}
                              >
                                {msg.sender.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}>
                          {/* Sender Name (Only for first in sequence) */}
                          {(!msg.isUser && !isSequence) && (
                            <span className="text-[10px] text-muted-foreground ml-1 mb-1">
                              {msg.sender}
                            </span>
                          )}

                          {/* Bubble */}
                          <div
                            // UPDATED: Use bg-secondary for receiver to handle dark mode automatically
                            className={`px-4 py-2.5 shadow-sm text-sm wrap-break-word ${
                              msg.isUser
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                : "bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <div ref={chatEndRef} />
          </CardContent>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => scrollToBottom()}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-primary/90 hover:bg-primary text-primary-foreground rounded-full p-2 shadow-lg z-10 transition-colors"
              >
                <ArrowDown className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <CardFooter className="p-3 bg-card border-t">
            <form onSubmit={sendMessage} className="flex w-full items-end gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                // UPDATED: Use bg-background or bg-muted to be visible in dark mode
                className="flex-1 bg-background border-input focus-visible:ring-1 focus-visible:ring-ring min-h-[44px]"
                autoFocus
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!message.trim() || !isConnected}
                className={`h-11 w-11 rounded-xl shrink-0 transition-all ${!message.trim() ? 'opacity-50' : 'hover:scale-105'}`}
              >
                <Send className="h-5 w-5 text-black dark:text-white" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default ChatRoom;