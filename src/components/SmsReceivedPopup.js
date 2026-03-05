import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "context/socket";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import { Card, IconButton, keyframes } from "@mui/material";
import smsSound from "assets/sounds/newmessage.wav";

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

const ignoredSenders = ["messenger:101357259681466", "+17272234766", "whatsapp:+17272234766"];

const SmsReceivedPopup = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [messageData, setMessageData] = useState(null);
  const notificationSound = useRef(null);

  useEffect(() => {
    // Pre-load the audio file.
    const audio = new Audio(smsSound);
    notificationSound.current = audio;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onSmsReceived = (data) => {
      if (data.From && ignoredSenders.includes(data.From)) return;
      setMessageData(data);
      setShow(true);

      if (notificationSound.current) {
        const playPromise = notificationSound.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.error("Error playing sound:", e);
          });
        }
      }
    };

    socket.on("smsReceived", onSmsReceived);

    return () => {
      socket.off("smsReceived", onSmsReceived);
    };
  }, [socket]);

  // Auto-hide logic with cleanup
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || !messageData) return null;

  const handleOpenMessage = () => {
    setShow(false);
    navigate("/messages", { state: { conversationId: messageData.From } });
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShow(false);
  };

  const senderName = messageData.customer
    ? `${messageData.customer.given_name} ${messageData.customer.family_name}`
    : messageData.ProfileName || messageData.From;

  return (
    <Card
      sx={{
        position: "fixed",
        top: "2rem",
        right: "2rem",
        zIndex: 9999,
        minWidth: "300px",
        maxWidth: "400px",
        padding: "1rem",
        backgroundColor: "#4CAF50",
        color: "white",
        boxShadow: 6,
        cursor: "pointer",
      }}
      onClick={handleOpenMessage}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <MDBox display="flex" alignItems="center">
          <MDBox
            sx={{
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              width: 40,
              height: 40,
              bgcolor: "rgba(255,255,255,0.2)",
              animation: `${pulse} 2s infinite`,
            }}
          >
            <Icon fontSize="medium" sx={{ color: "white" }}>
              message
            </Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="h6" color="white" fontWeight="medium">
              New Message
            </MDTypography>
            <MDTypography variant="body2" color="white" fontWeight="bold">
              {senderName}
            </MDTypography>
            <MDTypography
              variant="caption"
              color="white"
              sx={{
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                opacity: 0.9,
              }}
            >
              {messageData.Body}
            </MDTypography>
          </MDBox>
        </MDBox>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "white", alignSelf: "flex-start", mt: -0.5, mr: -0.5 }}
        >
          <Icon>close</Icon>
        </IconButton>
      </MDBox>
    </Card>
  );
};

export default SmsReceivedPopup;
