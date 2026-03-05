import { useState, useEffect, useRef } from "react";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";
import { Card, Icon, IconButton, TextField, Fab, CircularProgress, Divider } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const AiChat = () => {
  const socket = useSocket();
  const {
    aiChatOpen: isOpen,
    setAiChatOpen: setIsOpen,
    aiChatMessage,
    setAiChatMessage,
  } = globalFuncs();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    if (socket) {
      socket.emit("difyChat", { message: userMessage.text });
    } else {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "Socket not connected.",
          sender: "ai",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }
  };

  useEffect(() => {
    if (isOpen && aiChatMessage) {
      const userMessage = { text: aiChatMessage, sender: "user", timestamp: new Date() };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setAiChatMessage(""); // Clear message to prevent re-sending

      if (socket) {
        socket.emit("difyChat", { message: userMessage.text });
      } else {
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            text: "Socket not connected.",
            sender: "ai",
            timestamp: new Date(),
            isError: true,
          },
        ]);
      }
    }
  }, [isOpen, aiChatMessage, socket, setAiChatMessage]);

  useEffect(() => {
    if (socket) {
      const handleAiResponse = (res) => {
        setLoading(false);
        if (res.res !== 200) {
          setMessages((prev) => [
            ...prev,
            {
              text: res.message || "Error: Could not get response.",
              sender: "ai",
              timestamp: new Date(),
              isError: true,
            },
          ]);
          return;
        }
        const text = res.data.answer || res.message || "";
        const messageId = res.data.message_id;

        setMessages((prev) => {
          if (messageId) {
            const existingIndex = prev.findIndex(
              (m) => m.sender === "ai" && m.message_id === messageId
            );
            if (existingIndex !== -1) {
              const newMessages = [...prev];
              newMessages[existingIndex] = {
                ...newMessages[existingIndex],
                text: newMessages[existingIndex].text + text,
              };
              return newMessages;
            }
          }
          return [
            ...prev,
            {
              text: text,
              sender: "ai",
              timestamp: new Date(),
              message_id: messageId,
            },
          ];
        });
      };

      const handleDifyHistory = (data) => {
        if (data && data.messages) {
          const historyMessages = [];
          const sortedMessages = data.messages.sort((a, b) => a.created_at - b.created_at);

          sortedMessages.forEach((msg) => {
            if (msg.query) {
              historyMessages.push({
                text: msg.query,
                sender: "user",
                timestamp: new Date(msg.created_at * 1000),
              });
            }
            if (msg.answer) {
              historyMessages.push({
                text: msg.answer,
                sender: "ai",
                timestamp: new Date(msg.created_at * 1000),
                message_id: msg.id,
              });
            }
          });
          setMessages(historyMessages);
        }
      };

      socket.on("aiResponse", handleAiResponse);
      socket.on("difyHistory", handleDifyHistory);

      return () => {
        socket.off("aiResponse", handleAiResponse);
        socket.off("difyHistory", handleDifyHistory);
      };
    }
  }, [socket]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <MDBox position="fixed" bottom="2rem" right="2rem" zIndex={9999}>
        <Fab color="info" aria-label="chat" onClick={() => setIsOpen(!isOpen)}>
          <Icon fontSize="large">{isOpen ? "close" : "auto_awesome"}</Icon>
        </Fab>
      </MDBox>

      {isOpen && (
        <Card
          sx={{
            position: "fixed",
            bottom: "6rem",
            right: "2rem",
            width: isExpanded ? "600px" : "350px",
            height: isExpanded ? "800px" : "500px",
            maxHeight: "80vh",
            maxWidth: "90vw",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            boxShadow: 3,
            transition: "width 0.3s, height 0.3s",
          }}
        >
          <MDBox
            p={2}
            bgColor="info"
            variant="gradient"
            borderRadius="lg"
            coloredShadow="info"
            mx={2}
            mt={-3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <MDTypography variant="h6" color="white">
              AI Assistant
            </MDTypography>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{ color: "white" }}
            >
              <Icon>{isExpanded ? "close_fullscreen" : "open_in_full"}</Icon>
            </IconButton>
          </MDBox>

          <MDBox p={2} flex={1} sx={{ overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <MDBox
                key={index}
                display="flex"
                justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
                mb={1}
              >
                <MDBox
                  bgColor={msg.sender === "user" ? "info" : "grey-200"}
                  color={msg.sender === "user" ? "white" : "text"}
                  p={1.5}
                  borderRadius="lg"
                  maxWidth="80%"
                  sx={{
                    borderTopRightRadius: msg.sender === "user" ? 0 : "lg",
                    borderTopLeftRadius: msg.sender === "ai" ? 0 : "lg",
                  }}
                >
                  <MDTypography variant="body2" color="inherit" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.text}
                  </MDTypography>
                </MDBox>
              </MDBox>
            ))}
            {loading && (
              <MDBox display="flex" justifyContent="flex-start" mb={1}>
                <MDBox bgColor="grey-200" p={1.5} borderRadius="lg">
                  <CircularProgress size={20} color="info" />
                </MDBox>
              </MDBox>
            )}
            <div ref={messagesEndRef} />
          </MDBox>

          <Divider sx={{ my: 0 }} />

          <MDBox p={2} display="flex" alignItems="center">
            <TextField
              fullWidth
              placeholder="Ask something..."
              variant="outlined"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <IconButton
              color="info"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ ml: 1 }}
            >
              <Icon>send</Icon>
            </IconButton>
          </MDBox>
        </Card>
      )}
    </>
  );
};

export default AiChat;
