/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const socket = io("https://5ddr3hbb-8080.inc1.devtunnels.ms/");

function ChatRoom() {
  const { roomID } = useParams();
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem("crossdrop-username");
    return saved || `User-${Math.floor(Math.random() * 1000)}`;
  });
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(username);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Socket setup
  useEffect(() => {
    socket.emit("join-room", roomID);
    socket.on("receive-message", (data) => {
      setChat((prev) => [...prev, `${data.sender || "Anonymous"}: ${data.text}`]);
    });
    return () => {
      socket.off("receive-message");
    };
  }, [roomID]);

  // Send message
  function sendMessage() {
    if (!message.trim()) return;
    socket.emit("send-message", { roomID, text: message, sender: username });
    setChat((prev) => [...prev, `${username}: ${message}`]);
    setMessage("");
  }

  // Save username
  function saveUsername() {
    if (!newName.trim()) return;
    setUsername(newName);
    localStorage.setItem("crossdrop-username", newName);
    setEditing(false);
  }

  return (
    <>
      <Navbar />

      {/* 🧭 Centered Full-Screen Layout */}
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] w-full pt-[64px] px-4 bg-background text-foreground">
        <Card className="w-full max-w-3xl min-h-[80vh] border border-border rounded-xl shadow-lg flex flex-col bg-card transition-all duration-300 hover:shadow-primary/20">
          
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border p-4 bg-muted/30">
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                💬 Chat Room
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Room ID: <span className="font-medium">{roomID}</span>
              </CardDescription>
            </div>

            {/* Username Editor */}
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-32 text-sm"
                  />
                  <Button
                    onClick={saveUsername}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">👤 {username}</p>
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    size="sm"
                    className="hover:border-primary hover:text-primary"
                  >
                    Edit
                  </Button>
                </>
              )}
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {chat.length === 0 ? (
              <p className="italic text-center text-muted-foreground">
                No messages yet. Start the conversation 👇
              </p>
            ) : (
              chat.map((msg, i) => {
                const isUser = msg.startsWith(username);
                return (
                  <div
                    key={i}
                    className={`w-full flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <p
                      className={`px-4 py-2 rounded-lg max-w-[80%] break-words text-sm ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-border flex gap-2 bg-muted/20">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default ChatRoom;
