import { Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import "./App.css";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./components/Authentication/Login";
import ChatProvider from "./Context/ChatProvider";

function App() {
  return (
    <div className="App">
      <ChatProvider>
        <ChakraProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Chat" element={<Chat />} />
            <Route path="/Login" element={<Login />} />
          </Routes>
        </ChakraProvider>
      </ChatProvider>
    </div>
  );
}

export default App;
