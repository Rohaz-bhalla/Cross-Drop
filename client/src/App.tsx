import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import ChatRoom from "./routes/ChatRoom";
import FileRoom from "./routes/FileRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path="/room/:roomID/chat" element={<ChatRoom />} />
        <Route path="/room/:roomID/files" element={<FileRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
