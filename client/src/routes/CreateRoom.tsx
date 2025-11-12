/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GlobeDemo } from "@/components/GlobeDemo";

function CreateRoom() {
  const navigate = useNavigate();

  function createId() {
    const id = uuid();
    localStorage.setItem("currentRoomID", id);
    navigate(`/room/${id}/chat`);
  }

  return (
    <>
      <Navbar />

      {/* 🧭 Full-screen container */}
      <div className="flex flex-col md:flex-row w-screen h-[calc(100vh-64px)] pt-[64px] bg-background text-foreground transition-colors duration-300 overflow-hidden">
        {/* Left side */}
        <div className="flex flex-col justify-center items-start w-full md:w-1/2 px-8 md:px-20 space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight text-primary">
              Cross-Drop
            </h1>
            <p className="text-lg leading-relaxed max-w-md text-muted-foreground">
              Transfer files and chat in real time — <br />
              Secure, fast, and private 🔒
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={createId}
              variant="outline"
              className="px-6 py-3 text-white hover:bg-primary/90 transition-colors"
            >
              Create Room
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            You’ll get a unique room link to share with friends.
          </p>
        </div>

        {/* Right side */}
        <div className="hidden md:flex w-1/2 justify-center items-center relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-25 bg-primary/40"></div>

          <div className="flex justify-center items-center w-full h-screen bg-background overflow-visible">
            <div className="relative w-full max-w-[800px] h-[800px] md:h-[90vh] flex justify-center items-center">
              <GlobeDemo />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateRoom;
