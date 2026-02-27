import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Card,
  Grid,
  Modal,
  TextField,
  FormControlLabel,
  Checkbox,
  Icon,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DataTable from "react-data-table-component";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
  maxHeight: "90vh",
  overflowY: "auto",
};

function BusinessEvents() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    start: dayjs(),
    end: dayjs().add(1, "hour"),
    allDay: true,
    color: "#3788d8",
    recurrence: {
      frequency: "NONE",
      interval: 1,
      daysOfWeek: [],
      dayOfMonth: 1,
    },
  });

  const getEvents = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getBusinessEvents", {}, (res) => {
        if (res.res === 200) {
          setEvents(res.data);
        }
        setShowLoad(false);
      });
    }
  };

  useEffect(() => {
    if (socket) getEvents();
  }, [socket]);

  const handleSave = () => {
    if (!currentEvent.title || !currentEvent.start) {
      setSnackBar({ type: "error", message: "Title and Start Date are required", show: true });
      return;
    }

    setShowLoad(true);
    const eventData = {
      ...currentEvent,
      start: currentEvent.start.toDate(),
      end: currentEvent.end ? currentEvent.end.toDate() : null,
    };

    const eventName = isEditing ? "updateBusinessEvent" : "createBusinessEvent";
    socket.emit(eventName, eventData, (res) => {
      if (res.res === 200) {
        setSnackBar({
          type: "success",
          message: isEditing ? "Event updated" : "Event created",
          show: true,
          icon: "check",
        });
        setShowModal(false);
        getEvents();
      } else {
        setSnackBar({
          type: "error",
          message: res.message || "Error saving event",
          show: true,
          icon: "warning",
        });
      }
      setShowLoad(false);
    });
  };

  const handleEdit = (row) => {
    setCurrentEvent({
      ...row,
      start: dayjs(row.start),
      end: row.end ? dayjs(row.end) : null,
      recurrence: {
        frequency: row.recurrence?.frequency || "NONE",
        interval: row.recurrence?.interval || 1,
        daysOfWeek: row.recurrence?.daysOfWeek || [],
        dayOfMonth: row.recurrence?.dayOfMonth || 1,
      },
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setShowLoad(true);
    socket.emit("deleteBusinessEvent", { id: deleteId }, (res) => {
      if (res.res === 200) {
        setSnackBar({ type: "success", message: "Event deleted", show: true, icon: "check" });
        getEvents();
      } else {
        setSnackBar({
          type: "error",
          message: "Error deleting event",
          show: true,
          icon: "warning",
        });
      }
      setShowLoad(false);
      setDeleteConfirmOpen(false);
    });
  };

  const handleOpenModal = () => {
    setCurrentEvent({
      title: "",
      description: "",
      start: dayjs(),
      end: dayjs().add(1, "hour"),
      allDay: true,
      color: "#3788d8",
      recurrence: {
        frequency: "NONE",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: 1,
      },
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const columns = [
    { name: "Title", selector: (row) => row.title, sortable: true },
    {
      name: "Start",
      selector: (row) => row.start,
      format: (row) => new Date(row.start).toLocaleString(),
      sortable: true,
    },
    {
      name: "End",
      selector: (row) => row.end,
      format: (row) => (row.end ? new Date(row.end).toLocaleString() : ""),
      sortable: true,
    },
    { name: "Frequency", selector: (row) => row.recurrence?.frequency, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <IconButton onClick={() => handleEdit(row)} color="info">
            <Icon>edit</Icon>
          </IconButton>
          <IconButton onClick={() => handleDelete(row._id)} color="error">
            <Icon>delete</Icon>
          </IconButton>
        </>
      ),
    },
  ];

  const daysOfWeekOptions = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Business Events
                </MDTypography>
                <MDButton variant="contained" color="success" onClick={handleOpenModal}>
                  Add Event
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <DataTable columns={columns} data={events} pagination />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <MDBox sx={style}>
          <MDTypography variant="h6" mb={2}>
            {isEditing ? "Edit Event" : "New Event"}
          </MDTypography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={currentEvent.title}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={currentEvent.description}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, description: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start"
                  value={currentEvent.start}
                  onChange={(val) => setCurrentEvent({ ...currentEvent, start: val })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End"
                  value={currentEvent.end}
                  onChange={(val) => setCurrentEvent({ ...currentEvent, end: val })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentEvent.allDay}
                      onChange={(e) =>
                        setCurrentEvent({ ...currentEvent, allDay: e.target.checked })
                      }
                    />
                  }
                  label="All Day"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Color"
                  type="color"
                  value={currentEvent.color}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, color: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <MDTypography variant="h6" mt={2}>
                  Recurrence
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={currentEvent.recurrence.frequency}
                    label="Frequency"
                    onChange={(e) =>
                      setCurrentEvent({
                        ...currentEvent,
                        recurrence: { ...currentEvent.recurrence, frequency: e.target.value },
                      })
                    }
                    sx={{ height: "44px" }}
                  >
                    <MenuItem value="NONE">None</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="YEARLY">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {currentEvent.recurrence.frequency !== "NONE" && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Interval"
                      value={currentEvent.recurrence.interval}
                      onChange={(e) =>
                        setCurrentEvent({
                          ...currentEvent,
                          recurrence: {
                            ...currentEvent.recurrence,
                            interval: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Grid>
                  {currentEvent.recurrence.frequency === "WEEKLY" && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Days of Week</InputLabel>
                        <Select
                          multiple
                          value={currentEvent.recurrence.daysOfWeek}
                          onChange={(e) =>
                            setCurrentEvent({
                              ...currentEvent,
                              recurrence: {
                                ...currentEvent.recurrence,
                                daysOfWeek:
                                  typeof e.target.value === "string"
                                    ? e.target.value.split(",")
                                    : e.target.value,
                              },
                            })
                          }
                          input={<OutlinedInput label="Days of Week" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={daysOfWeekOptions.find((d) => d.value === value)?.label}
                                />
                              ))}
                            </Box>
                          )}
                          sx={{ minHeight: "44px" }}
                        >
                          {daysOfWeekOptions.map((day) => (
                            <MenuItem key={day.value} value={day.value}>
                              {day.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {currentEvent.recurrence.frequency === "MONTHLY" && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Day of Month"
                        inputProps={{ min: 1, max: 31 }}
                        value={currentEvent.recurrence.dayOfMonth}
                        onChange={(e) =>
                          setCurrentEvent({
                            ...currentEvent,
                            recurrence: {
                              ...currentEvent.recurrence,
                              dayOfMonth: parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </Grid>
                  )}
                </>
              )}

              <Grid item xs={12} mt={2} display="flex" justifyContent="flex-end">
                <MDButton color="secondary" onClick={() => setShowModal(false)} sx={{ mr: 1 }}>
                  Cancel
                </MDButton>
                <MDButton color="success" onClick={handleSave}>
                  Save
                </MDButton>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </MDBox>
      </Modal>
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">Are you sure you want to delete this event?</MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton color="secondary" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </MDButton>
          <MDButton color="error" onClick={confirmDelete}>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default BusinessEvents;
