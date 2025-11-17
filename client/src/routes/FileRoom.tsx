/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Check, Clipboard } from "lucide-react";

const socket = io("https://cross-drop.onrender.com/");

function CopyRoomLink({ roomID }: { roomID: string | undefined }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!roomID) return;

    // ✅ Build full HTTPS link dynamically
    const link = `${window.location.origin.replace(
      /^http:/,
      "https:"
    )}/room/${roomID}/chat`;

    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Room link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      title="Copy Room Link"
      className="text-white"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Clipboard className="h-4 w-4" />
      )}
    </Button>
  );
}

function FileRoom() {
  const { roomID } = useParams<{ roomID: string }>();
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [socketID, setSocketID] = useState<string | null>(null);

  // 🧠 Save joined room to localStorage for navbar sync
  useEffect(() => {
    if (roomID) localStorage.setItem("currentRoomID", roomID as string);
  }, [roomID]);

  // ⚡ Socket setup
  useEffect(() => {
    if (!roomID) return;

    socket.emit("join-room", roomID);
    socket.on("connect", () => setSocketID(socket.id || null));

    socket.on("receive-file", (meta, buffer) => {
      const blob = new Blob([buffer], { type: meta.fileType });
      const url = URL.createObjectURL(blob);
      setFiles((prev) => [...prev, { ...meta, url }]);

      // Notify user
      toast.success(`📥 New file received: ${meta.fileName}`);
    });

    return () => {
      socket.off("receive-file");
    };
  }, [roomID]);

  // Send file handler
  async function sendFile() {
    const selectedFile = fileInputRef.current?.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File too large! Sharing limit is 50MB.");
      return;
    }

    const arrayBuffer = await selectedFile.arrayBuffer();
    const meta = {
      roomID,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      senderID: socket.id,
    };

    // Emit via socket
    socket.emit("send-file", meta, arrayBuffer);

    const blob = new Blob([arrayBuffer], { type: selectedFile.type });
    const url = URL.createObjectURL(blob);

    // Add to local list
    setFiles((prev) => [...prev, { ...meta, url }]);

    // Show toast

    toast.promise<{ name: string }>(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ name: selectedFile.name }), 2000);
        }),
      {
        loading: "Sending file...",
        success: (res) => `✅ ${res.name} has been sent successfully!`,
        error: "❌ Failed to send file.",
      }
    );

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <Navbar />

      {/* 🧭 Centered full-screen layout */}
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] w-full pt-[64px] px-4 bg-background text-foreground transition-colors">
        <Card className="w-full max-w-5xl min-h-[80vh] flex flex-col bg-card border border-border rounded-2xl shadow-lg transition-all hover:shadow-primary/20">
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border bg-muted/30 p-6">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2 text-foreground">
                File Sharing zone
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                Share this room via this Link:{" "}
                <span className="text-gray-500">{roomID}</span>
                <CopyRoomLink roomID={roomID} />
              </CardDescription>
            </div>
          </CardHeader>

          {/* Main Content */}
          <CardContent className="flex-1 overflow-y-auto py-8 px-6 sm:px-10 space-y-10 bg-muted/20 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {/* Upload Section */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                className="text-sm text-muted-foreground border border-border p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted transition-all"
              />
              <Button
                onClick={sendFile}
                variant="destructive"
                className="px-2.5"
              >
                Share File
              </Button>
            </div>

            {/* Shared Files Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {files.length === 0 ? (
                <div className="col-span-full flex justify-center items-center h-40">
                  <p className="text-muted-foreground italic text-center">
                    No files shared yet. Upload your first file!
                  </p>
                </div>
              ) : (
                files.map((file: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-center items-center bg-muted/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-border"
                  >
                    {/* File Preview */}
                    {file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={file.url}
                        alt={file.fileName}
                        className="rounded-lg w-56 h-56 object-cover border border-border"
                      />
                    ) : file.fileName.match(/\.pdf$/i) ? (
                      <iframe
                        src={file.url}
                        title={file.fileName}
                        className="w-56 h-56 rounded-lg border border-border"
                      ></iframe>
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-sm break-all hover:text-blue-400"
                      >
                        {file.fileName}
                      </a>
                    )}

                    {file.senderID !== socketID && (
                      <a href={file.url} download={file.fileName}>
                        <Button
                          variant="outline"
                          className=" bg-accent-foreground mt-1.5"
                        >
                          Download
                        </Button>
                      </a>
                    )}

                    {/* Labels */}
                    <p className="text-xs text-muted-foreground mt-2">
                      {file.senderID === socketID
                        ? "📤 You shared this file"
                        : "📥 Received file"}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {file.fileName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default FileRoom;
