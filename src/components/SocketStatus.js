import { useState, useEffect } from "react";
import { useSocket } from "context/socket";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Tooltip, useTheme, useMediaQuery } from "@mui/material";
import { useMaterialUIController } from "context";
import zIndex from "@mui/material/styles/zIndex";
import { globalFuncs } from "context/global";

const SocketStatus = () => {
  const socket = useSocket();
  const { asteriskStatus } = globalFuncs();
  const [connected, setConnected] = useState(false);
  const [localConnected, setLocalConnected] = useState(false);
  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    if (!socket) {
      setConnected(false);
      setLocalConnected(false);
      return;
    }

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setLocalConnected(false);
    };
    const onLocalSocketStatus = (status) => {
      setLocalConnected(status);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("localSocketStatus", onLocalSocketStatus);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("localSocketStatus", onLocalSocketStatus);
    };
  }, [socket]);

  if (!socket) return null;

  if (miniSidenav) return null;

  return (
    <MDBox
      position="fixed"
      bottom="2rem"
      left={miniSidenav ? "2.5rem" : "2rem"}
      zIndex={2000}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap="4px"
      sx={{
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <MDBox display="flex" alignItems="center">
        <Tooltip
          title={connected ? "CRM Server Connected" : "CRM Server Disconnected"}
          placement="top"
          sx={{ zIndex: 1000 }}
        >
          <MDBox
            bgColor={connected ? "success" : "error"}
            width="12px"
            height="12px"
            borderRadius="50%"
            sx={{ cursor: "help", border: "1px solid white" }}
          />
        </Tooltip>
        {!miniSidenav && (
          <MDTypography
            variant="caption"
            color={darkMode ? "white" : "dark"}
            fontWeight="medium"
            ml={1}
            sx={{ userSelect: "none", zIndex: -1 }}
          >
            {connected ? "CRM Server Online" : "CRM Server Offline"}
          </MDTypography>
        )}
      </MDBox>
      <MDBox display="flex" alignItems="center">
        <Tooltip
          title={localConnected ? "Local Server Connected" : "Local Server Disconnected"}
          placement="top"
          sx={{ zIndex: 1000 }}
        >
          <MDBox
            bgColor={localConnected ? "success" : "error"}
            width="12px"
            height="12px"
            borderRadius="50%"
            sx={{ cursor: "help", border: "1px solid white" }}
          />
        </Tooltip>
        {!miniSidenav && (
          <MDTypography
            variant="caption"
            color={darkMode ? "white" : "dark"}
            fontWeight="medium"
            ml={1}
            sx={{ userSelect: "none", zIndex: -1 }}
          >
            {localConnected ? "Local Server Online" : "Local Server Offline"}
          </MDTypography>
        )}
      </MDBox>
      <MDBox display="flex" alignItems="center">
        <Tooltip
          title={asteriskStatus ? "PBX Server Connected" : "PBX Server Disconnected"}
          placement="top"
          sx={{ zIndex: 1000 }}
        >
          <MDBox
            bgColor={asteriskStatus ? "success" : "error"}
            width="12px"
            height="12px"
            borderRadius="50%"
            sx={{ cursor: "help", border: "1px solid white" }}
          />
        </Tooltip>
        {!miniSidenav && (
          <MDTypography
            variant="caption"
            color={darkMode ? "white" : "dark"}
            fontWeight="medium"
            ml={1}
            sx={{ userSelect: "none", zIndex: -1 }}
          >
            {asteriskStatus ? "PBX Server Online" : "PBX Server Offline"}
          </MDTypography>
        )}
      </MDBox>
    </MDBox>
  );
};

export default SocketStatus;
