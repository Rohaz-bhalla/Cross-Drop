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

const socket = io("https://5ddr3hbb-8080.inc1.devtunnels.ms/");

function FileRoom() {
  const { roomID } = useParams<{ roomID: string }>();
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ⚡ Socket setup
  useEffect(() => {
    if (!roomID) return;
    socket.emit("join-room", roomID);

    socket.on("receive-file", (meta, buffer) => {
      const blob = new Blob([buffer], { type: meta.fileType });
      const url = URL.createObjectURL(blob);
      setFiles((prev) => [...prev, { name: meta.fileName, url }]);
    });

    return () => {
      socket.off("receive-file");
    };
  }, [roomID]);

  // 📤 Send file
  async function sendFile() {
    const selectedFile = fileInputRef.current?.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("❌ File too large! Please send files under 50MB.");
      return;
    }

    // Convert to binary and emit
    const arrayBuffer = await selectedFile.arrayBuffer();
    const meta = { roomID, fileName: selectedFile.name, fileType: selectedFile.type };
    socket.emit("send-file", meta, arrayBuffer);

    // Show locally
    const blob = new Blob([arrayBuffer], { type: selectedFile.type });
    const url = URL.createObjectURL(blob);
    setFiles((prev) => [...prev, { name: selectedFile.name, url }]);

    // Reset
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <Navbar />

      {/* 🧭 Centered full-screen layout */}
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] w-full pt-[64px] px-4 bg-background text-foreground">
        <Card className="w-full max-w-5xl min-h-[80vh] flex flex-col bg-card border border-border rounded-2xl shadow-lg transition-all hover:shadow-primary/20">
          
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border bg-muted/30 p-6">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2 text-foreground">
                📁 File Room
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-1">
                Share and download files — Room ID:{" "}
                <span className="text-primary font-medium">{roomID}</span>
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
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
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
                files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-center items-center bg-muted/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-border"
                  >
                    {/* File Preview */}
                    {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="rounded-lg w-56 h-56 object-cover border border-border"
                      />
                    ) : file.name.match(/\.pdf$/i) ? (
                      <iframe
                        src={file.url}
                        title={file.name}
                        className="w-56 h-56 rounded-lg border border-border"
                      ></iframe>
                    ) : (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-sm break-all hover:text-primary/80"
                      >
                        {file.name}
                      </a>
                    )}

                    {/* Download Button */}
                    <a href={file.url} download={file.name}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-border text-foreground hover:text-primary transition-colors"
                      >
                        Download
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground mt-1 break-all">
                      {file.name}
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
