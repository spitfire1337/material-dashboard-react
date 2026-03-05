import { useState, useEffect, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  Card,
  Grid,
  TextField,
  Icon,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemButton,
  Modal,
  Skeleton,
  CircularProgress,
  Drawer,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";
import dayjs from "dayjs";
import { useAppSettings } from "context/appSettings";
import vars from "config";
import MDButton from "components/MDButton";

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

const Messages = () => {
  const socket = useSocket();
  const { appSettings } = useAppSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewImage, setViewImage] = useState(null);
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNewConv, setOpenNewConv] = useState(false);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");

  const ignoredSenders = ["messenger:101357259681466", "+17272234766", "whatsapp:+17272234766"];

  const smsEnabled = appSettings["sms-enabled"] === true || appSettings["sms-enabled"] === "true";
  const whatsappEnabled =
    appSettings["whatsapp-enabled"] === true || appSettings["whatsapp-enabled"] === "true";
  const messengerEnabled =
    appSettings["messenger-enabled"] === true || appSettings["messenger-enabled"] === "true";

  const scrollToBottom = (delay = 1000) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, delay);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const fetchConversations = () => {
    if (socket) {
      socket.emit("getConversations", {}, (res) => {
        if (res.res === 200) {
          setConversations(res.data);
        }
      });
    }
  };

  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const targetId = location.state.conversationId;
      const conversation = conversations.find((c) => c._id === targetId);
      if (conversation) {
        if (!selectedConversation || selectedConversation._id !== targetId) {
          handleConversationClick(conversation);
        }
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [conversations, location.state]);

  const fetchMessages = (phoneNumber) => {
    if (socket) {
      socket.emit("getMessages", { phoneNumber }, (res) => {
        if (res.res === 200) {
          if (res.data && res.data.length > 0) {
            setMessages(res.data[0].messages);
          } else {
            setMessages([]);
          }
        }
      });
    }
  };

  useEffect(() => {
    if (socket) {
      fetchConversations();

      const onSmsReceived = (message) => {
        if (ignoredSenders.includes(message.From)) return;
        fetchConversations();
        if (
          selectedConversation &&
          (selectedConversation._id === message.From || selectedConversation._id === message.To)
        ) {
          fetchMessages(selectedConversation._id);
          if (selectedConversation._id === message.From) {
            socket.emit("markSmsRead", { phoneNumber: selectedConversation._id });
          }
        }
      };

      socket.on("smsReceived", onSmsReceived);

      return () => {
        socket.off("smsReceived", onSmsReceived);
      };
    }
  }, [socket, selectedConversation]);

  const handleConversationClick = (conversation) => {
    if (conversation.unread) {
      if (socket) {
        socket.emit("markSmsRead", { phoneNumber: conversation._id });
      }
      setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, unread: false } : c))
      );
      conversation = { ...conversation, unread: false };
    }
    setSelectedConversation(conversation);
    setMessages([]);
    if (isMobile) setMobileOpen(false);
    setShowLoad(true);
    if (socket) {
      socket.emit("getMessages", { phoneNumber: conversation._id }, (res) => {
        setShowLoad(false);
        if (res.res === 200) {
          if (res.data && res.data.length > 0) {
            setMessages(res.data[0].messages);
          } else {
            setMessages([]);
          }
        }
      });
    }
  };

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

  const handleSendMessage = () => {
    const isWa = selectedConversation && selectedConversation._id.startsWith("whatsapp:");
    const isMessenger = selectedConversation && selectedConversation._id.startsWith("messenger:");
    const enabled = isWa ? whatsappEnabled : isMessenger ? messengerEnabled : smsEnabled;

    if (!enabled) {
      setSnackBar({
        type: "error",
        message: `${
          isWa ? "WhatsApp" : isMessenger ? "Messenger" : "SMS"
        } sending is disabled in settings`,
        show: true,
        icon: "block",
      });
      return;
    }
    if ((!newMessage.trim() && media.length === 0) || !selectedConversation) return;

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
      to: selectedConversation._id,
      body: newMessage,
      mediaUrls: media.length > 0 ? media.map((m) => m.url) : null,
    };

    if (socket) {
      setShowLoad(true);
      socket.emit("sendSms", messageData, (res) => {
        setShowLoad(false);
        if (res.res === 200) {
          setNewMessage("");
          setMedia([]);
          fetchMessages(selectedConversation._id);
          fetchConversations();
        } else {
          setSnackBar({
            type: "error",
            message: "Failed to send message",
            show: true,
            icon: "warning",
          });
        }
      });
    }
  };

  useEffect(() => {
    if (openNewConv && socket) {
      setSearchTerm("");
      setSelectedCustomer(null);
      socket.emit("getCustomers", { search: "" }, (res) => {
        if (res.res === 200) {
          setCustomerOptions(res.data);
        }
      });
    }
  }, [openNewConv, socket]);

  const handleStartConversation = (type) => {
    if (!selectedCustomer || !selectedCustomer.phone_number) return;

    let cleanPhone = selectedCustomer.phone_number.replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "1" + cleanPhone;
    cleanPhone = "+" + cleanPhone;

    const conversationId = type === "whatsapp" ? `whatsapp:${cleanPhone}` : cleanPhone;

    const existing = conversations.find((c) => c._id === conversationId);

    if (existing) {
      handleConversationClick(existing);
    } else {
      setSelectedConversation({
        _id: conversationId,
        customerData: selectedCustomer,
        messages: [],
      });
      setMessages([]);
      if (isMobile) setMobileOpen(false);
    }
    setOpenNewConv(false);
    setSelectedCustomer(null);
    setCustomerOptions([]);
    setSearchTerm("");
  };

  const filteredCustomers = customerOptions.filter((customer) => {
    const search = searchTerm.toLowerCase();
    if (!search) return false;
    return (
      (customer.given_name && customer.given_name.toLowerCase().includes(search)) ||
      (customer.family_name && customer.family_name.toLowerCase().includes(search)) ||
      (customer.phone_number && customer.phone_number.includes(search))
    );
  });

  const isWhatsApp = selectedConversation && selectedConversation._id.startsWith("whatsapp:");
  const isMessenger = selectedConversation && selectedConversation._id.startsWith("messenger:");
  const lastIncoming = isWhatsApp
    ? messages
        .filter((m) => m.From === selectedConversation._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    : null;
  const showRequestButton =
    isWhatsApp && (!lastIncoming || dayjs().diff(dayjs(lastIncoming.createdAt), "hours") >= 24);
  const messagingEnabled = isWhatsApp
    ? whatsappEnabled
    : isMessenger
    ? messengerEnabled
    : smsEnabled;

  const filteredConversations = conversations.filter((conv) => {
    const search = conversationSearch.toLowerCase();
    const name = conv.customerData
      ? `${conv.customerData.given_name} ${conv.customerData.family_name}`.toLowerCase()
      : "";
    const phone = conv._id.startsWith("messenger:") ? "facebook message" : conv._id.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  const renderConversationList = () => (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox p={2} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h6">Conversations</MDTypography>
        <IconButton onClick={() => setOpenNewConv(true)} color="info">
          <Icon>add_comment</Icon>
        </IconButton>
      </MDBox>
      <MDBox px={2} pb={1}>
        <TextField
          fullWidth
          placeholder="Search conversations..."
          value={conversationSearch}
          onChange={(e) => setConversationSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <Icon fontSize="small" sx={{ mr: 1, color: "text.secondary" }}>
                search
              </Icon>
            ),
          }}
        />
      </MDBox>
      <Divider />
      <List sx={{ overflowY: "auto", flex: 1 }}>
        {filteredConversations.map((conv, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              selected={selectedConversation?._id === conv._id}
              onClick={() => handleConversationClick(conv)}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: conv._id.startsWith("whatsapp:")
                      ? "#25D366"
                      : conv._id.startsWith("messenger:")
                      ? "#0084FF"
                      : undefined,
                  }}
                >
                  {conv._id.startsWith("whatsapp:") ? (
                    <WhatsAppIcon style={{ width: "24px", height: "24px", fill: "white" }} />
                  ) : conv._id.startsWith("messenger:") ? (
                    <MessengerIcon style={{ width: "24px", height: "24px", fill: "white" }} />
                  ) : (
                    <Icon>sms</Icon>
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <MDTypography
                    variant="button"
                    fontWeight={conv.unread ? "bold" : "medium"}
                    color={conv.unread ? "dark" : "text"}
                  >
                    {conv.customerData
                      ? `${conv.customerData.given_name} ${conv.customerData.family_name}`
                      : conv._id.startsWith("messenger:")
                      ? "Facebook Message"
                      : conv._id}
                  </MDTypography>
                }
                secondary={
                  <>
                    <MDTypography
                      variant="caption"
                      color={conv.unread ? "dark" : "text"}
                      fontWeight={conv.unread ? "bold" : "regular"}
                      display="block"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {conv.lastBody}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color={conv.unread ? "dark" : "text"}
                      fontWeight={conv.unread ? "bold" : "regular"}
                    >
                      {dayjs(conv.lastMessage).format("MM/DD/YYYY HH:mm")}
                    </MDTypography>
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} height="85vh">
        <Grid container spacing={3} height="100%">
          <Grid item xs={12} md={4} height="100%" sx={{ display: { xs: "none", md: "block" } }}>
            {renderConversationList()}
          </Grid>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: 300 },
            }}
          >
            {renderConversationList()}
          </Drawer>{" "}
          <Grid item xs={12} md={8} height="100%">
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {selectedConversation ? (
                <>
                  <MDBox p={2} display="flex" alignItems="center">
                    {isMobile && (
                      <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                        <Icon>menu</Icon>
                      </IconButton>
                    )}
                    <MDTypography variant="h6">
                      {selectedConversation.customerData
                        ? `${selectedConversation.customerData.given_name} ${selectedConversation.customerData.family_name}`
                        : selectedConversation._id.startsWith("messenger:")
                        ? "Facebook Message"
                        : selectedConversation._id}
                    </MDTypography>
                  </MDBox>
                  <Divider />
                  <MDBox
                    p={2}
                    sx={{
                      overflowY: "auto",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {messages.map((msg, index) => {
                      const isOutgoing = msg.From !== selectedConversation._id;
                      const isUndelivered =
                        isOutgoing &&
                        (msg.MessageStatus === "undelivered" ||
                          msg.MessageStatus === "undelivered" ||
                          msg.MessageStatus === "failed");

                      return (
                        <MDBox
                          key={index}
                          sx={{
                            alignSelf: isOutgoing ? "flex-end" : "flex-start",
                            backgroundColor: isUndelivered
                              ? "#F44336"
                              : isOutgoing
                              ? "#1A73E8"
                              : "#f0f0f0",
                            color: isOutgoing ? "white" : "black",
                            borderRadius: "10px",
                            p: 1.5,
                            mb: 1,
                            maxWidth: "70%",
                          }}
                        >
                          <MediaContent
                            msg={msg}
                            setViewImage={setViewImage}
                            scrollToBottom={() => scrollToBottom(100)}
                          />
                          {msg.Body && (
                            <MDTypography variant="body2" color={isOutgoing ? "white" : "text"}>
                              {msg.Body}
                            </MDTypography>
                          )}
                          <MDTypography
                            variant="caption"
                            color={isOutgoing ? "white" : "text"}
                            sx={{
                              opacity: 0.7,
                              display: "block",
                              textAlign: "right",
                              mt: 0.5,
                            }}
                          >
                            {dayjs(msg.createdAt).format("MM/DD HH:mm")}
                            {isUndelivered && ` - Message failed to send: ${msg.ErrorMessage}`}
                          </MDTypography>
                        </MDBox>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </MDBox>
                  <Divider />
                  <MDBox p={2}>
                    {media.length > 0 && (
                      <MDBox display="flex" flexWrap="wrap" gap={1} mb={1}>
                        {media.map((item) => {
                          const isImage = item.file.type.startsWith("image/");
                          const isVideo = item.file.type.startsWith("video/");
                          return (
                            <MDBox key={item.id} position="relative">
                              {isImage ? (
                                <MDBox
                                  component="img"
                                  src={item.base64}
                                  alt="Attachment"
                                  sx={{
                                    height: "100px",
                                    width: "100px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    display: "block",
                                  }}
                                />
                              ) : isVideo ? (
                                <MDBox
                                  component="video"
                                  src={item.base64}
                                  sx={{
                                    height: "100px",
                                    width: "100px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    display: "block",
                                  }}
                                  muted
                                />
                              ) : (
                                <MDBox
                                  sx={{
                                    height: "100px",
                                    width: "100px",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#f0f0f0",
                                    border: "1px solid #e0e0e0",
                                  }}
                                >
                                  <Icon fontSize="large" color="disabled">
                                    insert_drive_file
                                  </Icon>
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
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <CircularProgress
                                    variant="determinate"
                                    value={item.progress}
                                    size={40}
                                    sx={{ color: "white" }}
                                  />
                                </MDBox>
                              )}
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setMedia((prev) => prev.filter((m) => m.id !== item.id))
                                }
                                sx={{
                                  position: "absolute",
                                  top: -10,
                                  right: -10,
                                  bgcolor: "white",
                                  "&:hover": { bgcolor: "#f0f0f0" },
                                }}
                              >
                                <Icon fontSize="small">close</Icon>
                              </IconButton>
                            </MDBox>
                          );
                        })}
                      </MDBox>
                    )}
                    {showRequestButton ? (
                      <MDBox display="flex" justifyContent="center" width="100%">
                        <MDButton
                          variant="contained"
                          color="info"
                          onClick={() => {
                            if (socket) {
                              socket.emit(
                                "requestWhatsapp",
                                { to: selectedConversation._id },
                                (res) => {
                                  if (res.res === 200) {
                                    setSnackBar({
                                      type: "success",
                                      message: "Request sent",
                                      show: true,
                                      icon: "check",
                                    });
                                    fetchMessages(selectedConversation._id);
                                  } else {
                                    setSnackBar({
                                      type: "error",
                                      message: "Failed to send request",
                                      show: true,
                                      icon: "warning",
                                    });
                                  }
                                }
                              );
                            }
                          }}
                          disabled={!whatsappEnabled}
                        >
                          Request ability to message
                        </MDButton>
                      </MDBox>
                    ) : (
                      <MDBox display="flex" alignItems="center">
                        <IconButton
                          color="info"
                          onClick={() => fileInputRef.current.click()}
                          sx={{ mr: 1 }}
                          disabled={!messagingEnabled}
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
                          placeholder={
                            messagingEnabled
                              ? "Type a message..."
                              : isWhatsApp
                              ? "WhatsApp is disabled"
                              : isMessenger
                              ? "Messenger is disabled"
                              : "SMS is disabled"
                          }
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          disabled={!messagingEnabled}
                        />
                        <IconButton
                          color="info"
                          onClick={handleSendMessage}
                          sx={{ ml: 1 }}
                          disabled={!messagingEnabled}
                        >
                          <Icon>send</Icon>
                        </IconButton>
                      </MDBox>
                    )}
                  </MDBox>
                </>
              ) : (
                <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                  {isMobile && (
                    <IconButton
                      onClick={() => setMobileOpen(true)}
                      sx={{ position: "absolute", top: 16, left: 16 }}
                    >
                      <Icon>menu</Icon>
                    </IconButton>
                  )}
                  <MDTypography variant="h6" color="text">
                    Select a conversation to view messages
                  </MDTypography>
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
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
      <Dialog open={openNewConv} onClose={() => setOpenNewConv(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <MDBox mt={1}>
            <TextField
              label="Search Customer"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <List sx={{ maxHeight: "300px", overflowY: "auto", mt: 2 }}>
              {filteredCustomers.map((customer) => (
                <ListItem key={customer._id} disablePadding>
                  <ListItemButton
                    selected={selectedCustomer?._id === customer._id}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <ListItemText
                      primary={`${customer.given_name} ${customer.family_name}`}
                      secondary={customer.phone_number}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {filteredCustomers.length === 0 && searchTerm && (
                <MDBox p={2} textAlign="center">
                  <MDTypography variant="button" color="text">
                    No customers found
                  </MDTypography>
                </MDBox>
              )}
            </List>
          </MDBox>
          {selectedCustomer && (
            <MDBox mt={2} display="flex" justifyContent="center" gap={2}>
              <MDButton
                variant="contained"
                color="info"
                onClick={() => handleStartConversation("sms")}
                disabled={!smsEnabled}
              >
                SMS
              </MDButton>
              <MDButton
                variant="contained"
                color="success"
                onClick={() => handleStartConversation("whatsapp")}
                startIcon={
                  <WhatsAppIcon style={{ width: "20px", height: "20px", fill: "white" }} />
                }
                disabled={!whatsappEnabled}
              >
                WhatsApp
              </MDButton>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpenNewConv(false)} color="secondary">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default Messages;
