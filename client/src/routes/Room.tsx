import React from "react";
import { useParams } from "react-router-dom";

function Room() {
  // useParams() reads params from the URL like /room/:roomID
  const { roomID } = useParams();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
      <h1 className="text-2xl font-semibold">Room ID</h1>
      <p className="mt-2 text-gray-400">{roomID}</p>
    </div>
  );
}

export default Room;
