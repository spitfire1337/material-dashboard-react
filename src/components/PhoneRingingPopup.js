import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "context/socket";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import Icon from "@mui/material/Icon";
import {
  Card,
  IconButton,
  keyframes,
  Modal,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";

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

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "15px",
  maxHeight: "80vh",
  overflowY: "auto",
};

const Status = ({ repairStatus }) => {
  if (repairStatus == 0) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Created"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #FFFF00, #989845)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 1) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Not started"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #ffae00, #B38D4C)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 2) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="In Progress"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #00BEFF, #4C99B3)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 3) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Paused"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 4) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Repair Complete"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #3C9041, #00FF0F)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 5) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Invoice Created"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #8E833E, #FFDE03)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 11) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Paused - Awaiting parts"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 6) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Complete"
          sx={{
            "& .MuiBadge-badge": {
              color: "#000",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #329858, #00FF60)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 997) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Cancelled - Return to Customer"
          sx={{
            "& .MuiBadge-badge": {
              color: "#fff",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #984742, #FB0F00)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 998) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Cancelled"
          sx={{
            "& .MuiBadge-badge": {
              color: "#fff",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #984742, #FB0F00)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  if (repairStatus == 999) {
    return (
      <MDBox ml={-1}>
        <MDBadge
          badgeContent="Unrepairable"
          sx={{
            "& .MuiBadge-badge": {
              color: "#fff",
              backgroundColor: "green",
              background: "linear-gradient(195deg, #9E3755, #F70048)",
            },
          }}
          size="sm"
          bg=""
          container
        />
      </MDBox>
    );
  }
  return null;
};

const PhoneRingingPopup = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [ringing, setRinging] = useState(false);
  const [callData, setCallData] = useState(null);
  const [showRepairsModal, setShowRepairsModal] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onPhoneRinging = (data) => {
      let state = data.state;
      if (state === "RINGING" || state === "ON_CALL") {
        setRinging(true);
        setCallData(data);
      }
      if (state === "HANGUP" || state === "STOPPED_RINGING") {
        setRinging(false);
        setCallData(null);
      }
    };

    const onCallEnded = () => {
      setRinging(false);
      setCallData(null);
    };

    socket.on("phoneRinging", onPhoneRinging);
    socket.on("callEnded", onCallEnded);
    socket.on("phoneHangup", onCallEnded);

    return () => {
      socket.off("phoneRinging", onPhoneRinging);
      socket.off("callEnded", onCallEnded);
      socket.off("phoneHangup", onCallEnded);
    };
  }, [socket]);

  if (!ringing || !callData) return null;

  return (
    <>
      <Card
        sx={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          zIndex: 9999,
          minWidth: "300px",
          padding: "1rem",
          backgroundColor: "#1A73E8",
          color: "white",
          boxShadow: 6,
          overflow: "visible",
          cursor: callData?.repairs?.length > 0 ? "pointer" : "default",
        }}
        onClick={() => {
          if (callData?.repairs?.length > 0) {
            setShowRepairsModal(true);
          }
        }}
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
                phone_in_talk
              </Icon>
            </MDBox>
            <MDBox>
              <MDTypography variant="h6" color="white" fontWeight="medium">
                {callData.state === "ON_CALL" ? "Call in Progress" : "Incoming Call"}
              </MDTypography>
              <MDTypography variant="body2" color="white">
                {callData.event?.name || "Unknown Caller"}
              </MDTypography>

              {callData.event?.number && (
                <MDTypography
                  variant="caption"
                  sx={{ p: 0.1, mt: 0, mb: 0 }}
                  color="white"
                  opacity={0.8}
                >
                  {callData.event.number}
                </MDTypography>
              )}
              <MDTypography variant="body2" color="white">
                {callData.customer
                  ? `${callData.customer.given_name} ${callData.customer.family_name}`
                  : ""}
              </MDTypography>
              <MDTypography variant="caption" sx={{ mt: 0.1 }} color="white" opacity={0.8}>
                Active repairs: {callData.repairs?.length || 0}
              </MDTypography>
            </MDBox>
          </MDBox>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setRinging(false);
            }}
            sx={{ color: "white", alignSelf: "flex-start", mt: -0.5, mr: -0.5 }}
          >
            <Icon>close</Icon>
          </IconButton>
        </MDBox>
      </Card>
      <Modal open={showRepairsModal} onClose={() => setShowRepairsModal(false)}>
        <MDBox sx={modalStyle}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">Active Repairs</MDTypography>
            <IconButton onClick={() => setShowRepairsModal(false)}>
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
          <List>
            {callData?.repairs?.map((repair) => (
              <div key={repair._id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setShowRepairsModal(false);
                      setRinging(false);
                      navigate(`/repairdetails/${repair._id}`);
                    }}
                  >
                    <ListItemText
                      primary={`${repair.pev?.Brand?.name || "Unknown"} ${
                        repair.pev?.Model || "Device"
                      }`}
                      secondary={<Status repairStatus={repair.status} />}
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </MDBox>
      </Modal>
    </>
  );
};

export default PhoneRingingPopup;
