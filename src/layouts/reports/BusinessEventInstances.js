import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { Card, Grid, TextField, Tooltip, Icon } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "react-data-table-component";
import { useSocket } from "context/socket";
import { globalFuncs } from "../../context/global";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BusinessEventInstancesReport = () => {
  const socket = useSocket();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const getEvents = (start = undefined, end = undefined) => {
    if (socket) {
      const startD = start != undefined ? start : startDate;
      const endD = end != undefined ? end : endDate;
      setShowLoad(true);
      socket.emit("getBusinessEventInstances", { startDate: startD, endDate: endD }, (res) => {
        if (res.res === 200) {
          setEvents(res.data);
        } else {
          setSnackBar({
            type: "error",
            message: "Failed to load event instances",
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
      getEvents();
    }
  }, [socket]);

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
    getEvents(start, end);
    setStartDate(start);
    setEndDate(end);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchLower = searchTerm.toLowerCase();
      const title = event.title ? event.title.toLowerCase() : "";
      const description = event.description ? event.description.toLowerCase() : "";

      return title.includes(searchLower) || description.includes(searchLower);
    });
  }, [events, searchTerm]);

  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Start",
      selector: (row) => row.start,
      format: (row) => dayjs(row.start).format("MM/DD/YYYY HH:mm"),
      sortable: true,
    },
    {
      name: "End",
      selector: (row) => row.end,
      format: (row) => (row.end ? dayjs(row.end).format("MM/DD/YYYY HH:mm") : ""),
      sortable: true,
    },
    {
      name: "Acknowledged",
      selector: (row) => row.acknowledgement?.isAcknowledged,
      sortable: true,
      cell: (row) =>
        row.acknowledgement?.isAcknowledged ? (
          <Tooltip
            title={`By: ${row.acknowledgement.acknowledgedBy || "Unknown"} - ${
              row.acknowledgement.details || ""
            }`}
          >
            <Icon color="success">check_circle</Icon>
          </Tooltip>
        ) : (
          <Icon color="error">cancel</Icon>
        ),
    },
    {
      name: "Confirmation #",
      selector: (row) => row.acknowledgement?.confirmationNumber || "",
      sortable: true,
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
                    <MDButton
                      fullWidth
                      variant="contained"
                      color="info"
                      onClick={() => getEvents()}
                    >
                      Filter
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <MDButton variant="outlined" color="info" onClick={() => setDateRange("today")}>
                      Today
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => setDateRange("yesterday")}
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
                      onClick={() => setDateRange("thisMonth")}
                    >
                      This Month
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={() => setDateRange("lastMonth")}
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
                  data={filteredEvents}
                  pagination
                  persistTableHead
                  noHeader
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default BusinessEventInstancesReport;
