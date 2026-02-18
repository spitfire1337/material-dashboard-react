import { useState, useEffect } from "react";
import { useSocket } from "context/socket";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import { useLoginState } from "context/loginContext";
import { globalFuncs } from "../context/global";

const SocketDisconnectBanner = () => {
  const socket = useSocket();
  const { setSnackBar } = globalFuncs();
  const { setLoginState } = useLoginState();
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!socket) return;

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const handleReconnect = () => {
    setLoginState((s) => ({ ...s, loggedin: false }));
    setSnackBar({
      type: "error",
      title: "Session expired",
      message: "Please log in again.",
      show: true,
      icon: "error",
    });
  };

  if (!socket || connected) return null;

  return (
    <MDBox
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={9999}
      bgColor="error"
      py={1}
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ transition: "all 0.3s", boxShadow: 3 }}
    >
      <Icon color="white" sx={{ mr: 1 }}>
        wifi_off
      </Icon>
      <MDTypography variant="body2" color="white" fontWeight="bold">
        Disconnected from server
      </MDTypography>
      <MDButton
        variant="outlined"
        size="small"
        color="white"
        onClick={handleReconnect}
        sx={{ ml: 2 }}
      >
        Reconnect
      </MDButton>
    </MDBox>
  );
};

export default SocketDisconnectBanner;
