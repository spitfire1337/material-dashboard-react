import { useState, useEffect, useRef } from "react";
import { useSocket } from "context/socket";
import { useLocation } from "react-router-dom";
import {
  Fab,
  Icon,
  Card,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Skeleton,
  Modal,
  Tooltip,
  Badge,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import vars from "config";
import { globalFuncs } from "context/global";
import { useAppSettings } from "context/appSettings";

const ignoredSenders = ["messenger:101357259681466", "+17272234766", "whatsapp:+17272234766"];

const WhatsAppIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    style={style}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.381a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const MessengerIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    style={style}
  >
    <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.56 5.47 3.97 7.08-.1.95-.56 2.56-1.97 3.92 2.38.1 4.36-.85 5.5-1.72.82.23 1.69.35 2.5.35 5.52 0 10-4.03 10-9s-4.48-9-10-9zm1.79 11.5-2.5-2.67-4.89 2.67 5.39-5.72 2.5 2.67 4.89-2.67-5.39 5.72z" />
  </svg>
);

const MediaDisplay = ({ src, type, setViewImage, onLoaded }) => {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
    if (onLoaded) onLoaded();
  };

  const isVideo = type === "video" || (src && src.match(/\.(mp4|webm|ogg|mov)$/i));

  return (
    <>
      {loading && (
        <Skeleton
          variant="rectangular"
          width={200}
          height={150}
          sx={{ borderRadius: "8px", mb: 0.5 }}
        />
      )}
      {isVideo ? (
        <MDBox
          component="video"
          controls
          src={src}
          onLoadedData={handleLoad}
          sx={{
            maxWidth: "100%",
            maxHeight: "300px",
            borderRadius: "8px",
            mb: 0.5,
            display: loading ? "none" : "block",
          }}
        />
      ) : (
        <MDBox
          component="img"
          src={src}
          alt="MMS"
          onClick={() => setViewImage(src)}
          onLoad={handleLoad}
          sx={{
            maxWidth: "100%",
            maxHeight: "300px",
            borderRadius: "8px",
            mb: 0.5,
            cursor: "pointer",
            display: loading ? "none" : "block",
          }}
        />
      )}
    </>
  );
};

const MediaContent = ({ msg, setViewImage, scrollToBottom }) => {
  const mediaList = msg.media || msg.mediaUrls;
  if (mediaList && Array.isArray(mediaList) && mediaList.length > 0) {
    return (
      <>
        {mediaList.map((url, i) => (
          <MediaDisplay key={i} src={url} setViewImage={setViewImage} onLoaded={scrollToBottom} />
        ))}
      </>
    );
  }

  const twilioMedia = [];
  if (msg.MediaUrl0) {
    twilioMedia.push(msg.MediaUrl0);
    for (let i = 1; i < 10; i++) {
      if (msg[`MediaUrl${i}`]) {
        twilioMedia.push(msg[`MediaUrl${i}`]);
      } else {
        break;
      }
    }
  }

  if (twilioMedia.length > 0) {
    return (
      <>
        {twilioMedia.map((url, i) => (
          <MediaDisplay
            key={i}
            src={url}
            type={msg.MessageType}
            setViewImage={setViewImage}
            onLoaded={scrollToBottom}
          />
        ))}
      </>
    );
  }
  return null;
};

const SingleChat = ({ senderId, senderName, onClose, index, unreadCount, onOpen }) => {
  const socket = useSocket();
  const { appSettings } = useAppSettings();
  const { setSnackBar } = globalFuncs();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState([]);
  const [viewImage, setViewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isWhatsApp = senderId.startsWith("whatsapp:");
  const isMessenger = senderId.startsWith("messenger:");
  const messengerEnabled =
    appSettings["messenger-enabled"] === true || appSettings["messenger-enabled"] === "true";
  const displayName =
    isMessenger && senderName.startsWith("messenger:") ? "Facebook Message" : senderName;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && socket) {
      setLoading(true);
      socket.emit("getMessages", { phoneNumber: senderId }, (res) => {
        setLoading(false);
        if (res.res === 200 && res.data.length > 0) {
          setMessages(res.data[0].messages);
        }
      });
    }
  }, [isOpen, socket, senderId]);

  useEffect(() => {
    if (socket) {
      const onSmsReceived = (message) => {
        if (ignoredSenders.includes(message.From)) return;
        if (message.From === senderId || message.To === senderId) {
          setMessages((prev) => [...prev, message]);
        }
      };
      socket.on("smsReceived", onSmsReceived);
      return () => {
        socket.off("smsReceived", onSmsReceived);
      };
    }
  }, [socket, senderId]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (media.length + files.length > 10) {
      setSnackBar({
        type: "error",
        message: "Maximum 10 files allowed",
        show: true,
        icon: "warning",
      });
      return;
    }

    files.forEach((file) => {
      const tempId = Date.now() + Math.random();
      const newMedia = {
        id: tempId,
        file: file,
        base64: null,
        url: null,
        uploading: true,
        progress: 0,
        size: file.size,
      };

      setMedia((prev) => [...prev, newMedia]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, base64: reader.result } : m))
        );
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("mms", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${vars.serverUrl}/twilio/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setMedia((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, progress: percentComplete } : m))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setMedia((prev) => {
            const currentTotalSize = prev.reduce((acc, m) => {
              if (m.id === tempId) return acc;
              return acc + m.size;
            }, 0);

            if (currentTotalSize + res.size > 5 * 1024 * 1024) {
              setTimeout(() => {
                setSnackBar({
                  type: "error",
                  message: "Total file size exceeds 5MB limit",
                  show: true,
                  icon: "warning",
                });
              }, 0);
              return prev.filter((m) => m.id !== tempId);
            }

            return prev.map((m) =>
              m.id === tempId ? { ...m, url: res.data, size: res.size, uploading: false } : m
            );
          });
        } else {
          setSnackBar({
            type: "error",
            message: "Failed to upload media",
            show: true,
            icon: "warning",
          });
          setMedia((prev) => prev.filter((m) => m.id !== tempId));
        }
      };

      xhr.onerror = () => {
        setSnackBar({
          type: "error",
          message: "Error uploading media",
          show: true,
          icon: "warning",
        });
        setMedia((prev) => prev.filter((m) => m.id !== tempId));
      };

      xhr.send(formData);
    });
    event.target.value = null;
  };

  const handleSend = () => {
    if (!input.trim() && media.length === 0) return;

    if (isMessenger && !messengerEnabled) {
      setSnackBar({
        type: "error",
        message: "Messenger sending is disabled in settings",
        show: true,
        icon: "block",
      });
      return;
    }

    if (media.some((m) => !m.url)) {
      setSnackBar({
        type: "warning",
        message: "Media is still uploading",
        show: true,
        icon: "warning",
      });
      return;
    }

    const messageData = {
      to: senderId,
      body: input,
      mediaUrls: media.length > 0 ? media.map((m) => m.url) : null,
    };

    if (socket) {
      socket.emit("sendSms", messageData, (res) => {
        if (res.res === 200) {
          setInput("");
          setMedia([]);
          setMessages((prev) => [
            ...prev,
            { Body: input, From: "ME", createdAt: new Date(), mediaUrls: messageData.mediaUrls },
          ]);
        }
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <MDBox position="fixed" bottom="2rem" right={`${7 + index * 5}rem`} zIndex={999}>
      <MDBox position="relative">
        <Tooltip title={displayName} placement="top">
          <Fab
            color={isMessenger ? "info" : "success"}
            aria-label="chat"
            onClick={() => {
              if (!isOpen && socket) {
                if (onOpen) onOpen(senderId);
                else socket.emit("markSmsRead", { phoneNumber: senderId });
              }
              setIsOpen(!isOpen);
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              {isWhatsApp ? (
                <WhatsAppIcon style={{ width: "35px", height: "35px", fill: "white" }} />
              ) : isMessenger ? (
                <MessengerIcon style={{ width: "35px", height: "35px", fill: "white" }} />
              ) : (
                <Icon fontSize="large">message</Icon>
              )}
            </Badge>
          </Fab>
        </Tooltip>
        <IconButton
          size="small"
          color="error"
          onClick={() => onClose(senderId)}
          sx={{
            position: "absolute",
            top: -10,
            right: -10,
            backgroundColor: "white",
            "&:hover": { backgroundColor: "#f0f0f0" },
            zIndex: 1001,
            width: 24,
            height: 24,
            boxShadow: 2,
          }}
        >
          <Icon fontSize="small">close</Icon>
        </IconButton>
      </MDBox>

      {isOpen && (
        <Card
          sx={{
            position: "absolute",
            bottom: "4rem",
            right: 0,
            width: "300px",
            height: "500px",
            display: "flex",
            flexDirection: "column",
            boxShadow: 3,
            zIndex: 1000,
          }}
        >
          <MDBox
            p={2}
            bgColor="success"
            variant="gradient"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
          >
            <MDTypography variant="h6" color="white">
              {displayName}
            </MDTypography>
          </MDBox>
          <MDBox p={2} flex={1} sx={{ overflowY: "auto" }}>
            {loading && (
              <MDBox display="flex" justifyContent="center">
                <CircularProgress size={20} color="success" />
              </MDBox>
            )}
            {messages.map((msg, i) => (
              <MDBox key={i} textAlign={msg.From === senderId ? "left" : "right"} mb={1}>
                <MDBox
                  display="inline-block"
                  bgColor={msg.From === senderId ? "grey-200" : "success"}
                  color={msg.From === senderId ? "text" : "white"}
                  p={1}
                  borderRadius="lg"
                  sx={{ maxWidth: "80%", wordWrap: "break-word" }}
                >
                  <MediaContent
                    msg={msg}
                    setViewImage={setViewImage}
                    scrollToBottom={scrollToBottom}
                  />
                  {msg.Body && (
                    <MDTypography variant="body2" color="inherit" fontSize="small">
                      {msg.Body}
                    </MDTypography>
                  )}
                </MDBox>
              </MDBox>
            ))}
            <div ref={messagesEndRef} />
          </MDBox>
          <Divider sx={{ my: 0 }} />
          <MDBox p={2}>
            {media.length > 0 && (
              <MDBox display="flex" flexWrap="wrap" gap={1} mb={1}>
                {media.map((item) => (
                  <MDBox key={item.id} position="relative">
                    {item.file.type.startsWith("image/") ? (
                      <MDBox
                        component="img"
                        src={item.base64}
                        alt="Attachment"
                        sx={{
                          height: "50px",
                          width: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <MDBox
                        sx={{
                          height: "50px",
                          width: "50px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        <Icon>insert_drive_file</Icon>
                      </MDBox>
                    )}
                    {item.uploading && (
                      <MDBox
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          bgcolor: "rgba(0, 0, 0, 0.5)",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CircularProgress size={20} color="white" />
                      </MDBox>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => setMedia((prev) => prev.filter((m) => m.id !== item.id))}
                      sx={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        bgcolor: "white",
                        width: 16,
                        height: 16,
                        "&:hover": { bgcolor: "#f0f0f0" },
                      }}
                    >
                      <Icon fontSize="small" style={{ fontSize: 12 }}>
                        close
                      </Icon>
                    </IconButton>
                  </MDBox>
                ))}
              </MDBox>
            )}
            <MDBox display="flex" alignItems="center">
              <IconButton
                color="success"
                onClick={() => fileInputRef.current.click()}
                sx={{ mr: 1 }}
              >
                <Icon>attach_file</Icon>
              </IconButton>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*,video/*"
                multiple
              />
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <IconButton color="success" onClick={handleSend}>
                <Icon>send</Icon>
              </IconButton>
            </MDBox>
          </MDBox>
        </Card>
      )}
      <Modal
        open={Boolean(viewImage)}
        onClose={() => setViewImage(null)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <MDBox
          component="img"
          src={viewImage}
          sx={{ maxWidth: "90vw", maxHeight: "90vh", outline: "none" }}
        />
      </Modal>
    </MDBox>
  );
};

const UnreadMessagesFab = () => {
  const socket = useSocket();
  const location = useLocation();
  const [activeSenders, setActiveSenders] = useState(() => {
    const saved = localStorage.getItem("activeChatSenders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("activeChatSenders", JSON.stringify(activeSenders));
  }, [activeSenders]);

  useEffect(() => {
    if (socket) {
      const onSmsReceived = (message) => {
        if (ignoredSenders.includes(message.From)) return;
        if (message.SmsStatus === "received") {
          setActiveSenders((prev) => {
            if (prev.some((s) => s.id === message.From)) return prev;
            const name = message.customer
              ? `${message.customer.given_name} ${message.customer.family_name}`
              : message.ProfileName || message.From;
            return [...prev, { id: message.From, name, unreadCount: 1 }];
          });
        } else if (message.SmsStatus === "received") {
          // Increment count if already exists
          setActiveSenders((prev) =>
            prev.map((s) =>
              s.id === message.From ? { ...s, unreadCount: (s.unreadCount || 0) + 1 } : s
            )
          );
        }
      };
      const onUnreadConversations = (data) => {
        if (data && Array.isArray(data.conversations)) {
          setActiveSenders((prev) => {
            const unreadMap = new Map(data.conversations.map((c) => [c._id, c]));
            const newSenders = prev.map((s) => {
              const conv = unreadMap.get(s.id);
              if (conv) {
                unreadMap.delete(s.id);
                return { ...s, unreadCount: conv.unreadCount };
              }
              return { ...s, unreadCount: 0 };
            });

            unreadMap.forEach((conv) => {
              const name = conv.customerData
                ? `${conv.customerData.given_name} ${conv.customerData.family_name}`
                : conv._id;
              newSenders.push({ id: conv._id, name, unreadCount: conv.unreadCount });
            });
            return newSenders;
          });
        }
      };
      socket.on("smsReceived", onSmsReceived);
      socket.on("unreadConversations", onUnreadConversations);
      return () => {
        socket.off("smsReceived", onSmsReceived);
        socket.off("unreadConversations", onUnreadConversations);
      };
    }
  }, [socket]);

  const handleClose = (senderId) => {
    setActiveSenders((prev) => prev.filter((s) => s.id !== senderId));
  };

  const handleOpen = (senderId) => {
    setActiveSenders((prev) => prev.map((s) => (s.id === senderId ? { ...s, unreadCount: 0 } : s)));
    if (socket) {
      socket.emit("markSmsRead", { phoneNumber: senderId });
    }
  };

  if (location.pathname === "/messages") return null;

  return (
    <>
      {activeSenders.map((sender, index) => (
        <SingleChat
          key={sender.id}
          senderId={sender.id}
          senderName={sender.name}
          unreadCount={sender.unreadCount}
          index={index}
          onClose={handleClose}
          onOpen={handleOpen}
        />
      ))}
    </>
  );
};

export default UnreadMessagesFab;
