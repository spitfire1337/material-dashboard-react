import { useState, useEffect } from "react";
import { useSocket } from "context/socket";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { globalFuncs } from "../context/global";

const UnacknowledgedEventsPopup = () => {
  const { setSnackBar } = globalFuncs();
  const socket = useSocket();
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!socket) return;

    const onUnacknowledgedEvents = (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
        setCurrentEventIndex(0);
        setOpen(true);
      }
    };

    socket.on("unacknowledgedEvents", onUnacknowledgedEvents);

    return () => {
      socket.off("unacknowledgedEvents", onUnacknowledgedEvents);
    };
  }, [socket]);

  const handleAcknowledge = () => {
    const currentEvent = events[currentEventIndex];
    const acknowledgement = {
      isAcknowledged: true,
      confirmationNumber: confirmationNumber,
      details: details,
    };

    socket.emit(
      "acknowledgeEvent",
      {
        id: currentEvent._id,
        acknowledgement,
      },
      (res) => {
        if (res.res === 200) {
          setSnackBar({
            type: "success",
            message: "Event acknowledged successfully",
            show: true,
            icon: "check",
          });
          if (currentEventIndex < events.length - 1) {
            setCurrentEventIndex((prev) => prev + 1);
            setConfirmationNumber("");
            setDetails("");
          } else {
            setOpen(false);
            setEvents([]);
            setConfirmationNumber("");
            setDetails("");
          }
        }
      }
    );
  };

  const handleDismiss = () => {
    if (currentEventIndex < events.length - 1) {
      setCurrentEventIndex((prev) => prev + 1);
      setConfirmationNumber("");
      setDetails("");
    } else {
      setOpen(false);
      setEvents([]);
      setConfirmationNumber("");
      setDetails("");
    }
  };

  if (!open || events.length === 0) return null;

  const currentEvent = events[currentEventIndex];

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Acknowledge Event</DialogTitle>
      <DialogContent>
        <MDBox mb={2}>
          <MDTypography variant="h6" fontWeight="medium">
            {currentEvent.title}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            {currentEvent.description}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            Start: {new Date(currentEvent.start).toLocaleString()}
          </MDTypography>
        </MDBox>
        <TextField
          autoFocus
          margin="dense"
          label="Confirmation Number (if applicable)"
          fullWidth
          variant="outlined"
          value={confirmationNumber}
          onChange={(e) => setConfirmationNumber(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Details"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <MDButton onClick={handleDismiss} color="secondary">
          Dismiss
        </MDButton>
        <MDButton onClick={handleAcknowledge} color="info" variant="contained">
          Acknowledge
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default UnacknowledgedEventsPopup;
