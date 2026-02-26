import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  Card,
  Grid,
  TextField,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "react-data-table-component";
import { useSocket } from "context/socket";
import { globalFuncs } from "../../context/global";
import vars from "../../config";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CallHistoryReport = () => {
  const socket = useSocket();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [calls, setCalls] = useState([]);
  const [audioSrc, setAudioSrc] = useState(null);
  const [openPlayer, setOpenPlayer] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const getCalls = (start = undefined, end = undefined) => {
    if (socket) {
      const startD = start != undefined ? start : startDate;
      const endD = end != undefined ? end : endDate;
      setShowLoad(true);
      socket.emit("getCallHistory", { startDate: startD, endDate: endD }, (res) => {
        if (res.res === 200) {
          setCalls(res.data);
        } else {
          setSnackBar({
            type: "error",
            message: "Failed to load call history",
            show: true,
            icon: "warning",
          });
        }
        setShowLoad(false);
      });
    }
  };

  useEffect(() => {
    if (socket) {
      getCalls();
    }
  }, [socket]);

  const handlePlay = (url) => {
    if (url && !url.startsWith("http") && !url.startsWith("//")) {
      setAudioSrc(`${vars.serverUrl}${url}`);
    } else {
      setAudioSrc(url);
    }
    setOpenPlayer(true);
  };

  const handleClosePlayer = () => {
    setOpenPlayer(false);
    setAudioSrc(null);
  };

  const setDateRange = (range) => {
    const today = dayjs();
    let start, end;
    switch (range) {
      case "today":
        start = today.startOf("day").toDate();
        end = today.endOf("day").toDate();
        break;
      case "yesterday":
        start = today.subtract(1, "day").startOf("day").toDate();
        end = today.subtract(1, "day").endOf("day").toDate();
        break;
      case "last7":
        start = today.subtract(7, "day").startOf("day").toDate();
        end = today.endOf("day").toDate();
        break;
      case "last30":
        start = today.subtract(30, "day").startOf("day").toDate();
        end = today.endOf("day").toDate();
        break;
      case "thisMonth":
        start = today.startOf("month").toDate();
        end = today.endOf("month").toDate();
        break;
      case "lastMonth":
        start = today.subtract(1, "month").startOf("month").toDate();
        end = today.subtract(1, "month").endOf("month").toDate();
        break;
      default:
        return;
    }
    getCalls(start, end);
    setStartDate(start);
    setEndDate(end);
  };

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const matchesType = filterType === "ALL" || call.type === filterType;
      const searchLower = searchTerm.toLowerCase();
      const callerName = call.caller_customer
        ? `${call.caller_customer.given_name} ${call.caller_customer.family_name}`.toLowerCase()
        : "";
      const destName = call.destination_customer
        ? `${call.destination_customer.given_name} ${call.destination_customer.family_name}`.toLowerCase()
        : "";
      const matchesSearch =
        (call.caller_id && call.caller_id.toLowerCase().includes(searchLower)) ||
        (call.destination && call.destination.toLowerCase().includes(searchLower)) ||
        callerName.includes(searchLower) ||
        destName.includes(searchLower);
      return matchesType && matchesSearch;
    });
  }, [calls, searchTerm, filterType]);

  const columns = [
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      width: "80px",
      cell: (row) => (
        <Tooltip title={row.type === "IN" ? "Incoming" : "Outgoing"}>
          <Icon color={row.type === "IN" ? "success" : "info"}>
            {row.type === "IN" ? "call_received" : "call_made"}
          </Icon>
        </Tooltip>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.timestamp,
      format: (row) => dayjs(row.timestamp).format("MM/DD/YYYY HH:mm"),
      sortable: true,
    },
    {
      name: "From",
      selector: (row) =>
        row.caller_customer != null
          ? `${row.caller_id} (${row.caller_customer.given_name} ${row.caller_customer.family_name}`
          : row.caller_id,
      sortable: true,
    },
    {
      name: "To",
      selector: (row) =>
        row.destination_customer != null
          ? `${row.destination} (${row.destination_customer.given_name} ${row.destination_customer.family_name})`
          : row.destination,
      sortable: true,
    },
    {
      name: "Duration",
      selector: (row) => row.duration_seconds,
      format: (row) => {
        const totalSeconds = parseInt(row.duration_seconds || 0, 10);
        if (!totalSeconds) return "0s";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let result = "";
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0 || hours > 0) result += `${minutes}m `;
        result += `${seconds}s`;
        return result;
      },
      sortable: true,
    },
    {
      name: "Recording",
      cell: (row) =>
        row.filename ? (
          <IconButton
            onClick={() =>
              handlePlay(
                `https://api.pevconnection.com/asterisk/recordings/${encodeURIComponent(
                  row.filename
                )}`
              )
            }
            color="info"
          >
            <Icon>play_circle</Icon>
          </IconButton>
        ) : (
          "N/A"
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Filters
                </MDTypography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      customInput={<TextField fullWidth label="Start Date" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      customInput={<TextField fullWidth label="End Date" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton fullWidth variant="contained" color="info" onClick={() => getCalls()}>
                      Filter
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={filterType}
                        label="Type"
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{ height: "43px" }}
                      >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="IN">Incoming</MenuItem>
                        <MenuItem value="OUT">Outgoing</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => {
                        setDateRange("today");
                      }}
                    >
                      Today
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => {
                        setDateRange("yesterday");
                      }}
                    >
                      Yesterday
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton variant="outlined" color="info" onClick={() => setDateRange("last7")}>
                      Last 7 Days
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => {
                        setDateRange("thisMonth");
                      }}
                    >
                      This Month
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => {
                        setDateRange("lastMonth");
                      }}
                    >
                      Last Month
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <DataTable
                  columns={columns}
                  data={filteredCalls}
                  pagination
                  persistTableHead
                  noHeader
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={openPlayer} onClose={handleClosePlayer} maxWidth="sm" fullWidth>
          <DialogTitle>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              Call Recording
              <IconButton onClick={handleClosePlayer}>
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </DialogTitle>
          <DialogContent>
            <MDBox display="flex" justifyContent="center" p={2}>
              {audioSrc && <audio controls src={audioSrc} autoPlay style={{ width: "100%" }} />}
            </MDBox>
          </DialogContent>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default CallHistoryReport;
