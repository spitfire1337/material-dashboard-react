import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "context/socket";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import {
  Card,
  IconButton,
  keyframes,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import alertSound from "assets/sounds/gen_notification.wav";

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

const InProgressRepairPopup = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const notificationSound = useRef(null);

  useEffect(() => {
    notificationSound.current = new Audio(alertSound);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onInProgressRepairs = (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setRepairs(data);
        setShow(true);
        if (notificationSound.current) {
          notificationSound.current.play().catch((e) => {
            console.error("Error playing sound:", e);
          });
        }
      }
    };

    socket.on("inprogressRepairs", onInProgressRepairs);

    return () => {
      socket.off("inprogressRepairs", onInProgressRepairs);
    };
  }, [socket]);

  if (!show || repairs.length === 0) return null;

  const handleNavigate = (repairId) => {
    setShow(false);
    if (repairId) {
      navigate(`/repairdetails/${repairId}`);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShow(false);
  };

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
        backgroundColor: "#FB8C00", // Warning color
        color: "white",
        boxShadow: 6,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
        <MDBox display="flex" alignItems="flex-start" width="100%">
          <MDBox
            sx={{
              mr: 2,
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              width: 40,
              height: 40,
              bgcolor: "rgba(255,255,255,0.2)",
              animation: ` 2s infinite`,
              flexShrink: 0,
            }}
          >
            <Icon fontSize="medium" sx={{ color: "white" }}>
              timer
            </Icon>
          </MDBox>
          <MDBox width="100%">
            <MDTypography variant="h6" color="white" fontWeight="medium">
              {repairs.length > 1 ? "Long Running Repairs" : "Long Running Repair"}
            </MDTypography>
            <MDTypography variant="body2" color="white" mb={1}>
              {repairs.length > 1
                ? `${repairs.length} repairs running > 90 minutes`
                : "Repair running > 90 minutes"}
            </MDTypography>

            {repairs.length === 1 ? (
              <MDBox
                onClick={() => handleNavigate(repairs[0]._id)}
                sx={{ cursor: "pointer", "&:hover": { opacity: 0.8 } }}
              >
                {repairs[0].pev && (
                  <MDTypography variant="button" color="white" fontWeight="bold">
                    {repairs[0].pev?.Brand?.name} {repairs[0].pev?.Model}
                  </MDTypography>
                )}
                <MDTypography variant="caption" display="block" color="white">
                  {repairs[0].Customer
                    ? `${repairs[0].Customer.given_name} ${repairs[0].Customer.family_name}`
                    : ""}
                </MDTypography>
              </MDBox>
            ) : (
              <List dense sx={{ width: "100%", bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1 }}>
                {repairs.map((repair, index) => (
                  <div key={repair._id}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleNavigate(repair._id)}>
                        <ListItemText
                          primary={
                            <MDTypography variant="button" color="white" fontWeight="bold">
                              {repair.pev?.Brand?.name} {repair.pev?.Model}
                            </MDTypography>
                          }
                          secondary={
                            <MDTypography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                              {repair.Customer
                                ? `${repair.Customer.given_name} ${repair.Customer.family_name}`
                                : ""}
                            </MDTypography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < repairs.length - 1 && (
                      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
                    )}
                  </div>
                ))}
              </List>
            )}
          </MDBox>
        </MDBox>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "white", alignSelf: "flex-start", mt: -0.5, mr: -0.5, ml: 1 }}
        >
          <Icon>close</Icon>
        </IconButton>
      </MDBox>
    </Card>
  );
};

export default InProgressRepairPopup;
