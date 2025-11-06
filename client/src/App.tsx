import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom.js";
import Room from "./routes/Room.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path=" /room/:roomID " Component={Room} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
