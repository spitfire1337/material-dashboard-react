/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";
import { useSocket } from "context/socket";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Icon,
  IconButton,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import DataTable from "react-data-table-component";

function Logs() {
  const socket = useSocket();
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ module: [], action: [], status: [], user: [] });
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [moduleFilter, setModuleFilter] = useState(null);
  const [actionFilter, setActionFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [userFilter, setUserFilter] = useState(null);

  const fetchLogs = () => {
    if (!socket) return;
    setLoading(true);
    const filterPayload = {
      startDate,
      endDate,
      module: moduleFilter,
      action: actionFilter,
      status: statusFilter,
      user: userFilter,
    };
    socket.emit("getLogs", filterPayload, (res) => {
      if (res.res === 200) {
        setLogs(res.data);
        setFilters(res.filters);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (socket) {
      fetchLogs();
    }
  }, [socket, moduleFilter, actionFilter, statusFilter, userFilter]);

  const handleRowClick = (row) => {
    setSelectedLog(row);
    setShowDetailsModal(true);
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => new Date(row.createdAt).toLocaleString(),
      sortable: true,
      width: "180px",
    },
    {
      name: "User",
      selector: (row) => row.user,
      sortable: true,
    },
    {
      name: "Module",
      selector: (row) => row.module,
      sortable: true,
    },
    {
      name: "Action",
      selector: (row) => row.action,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Details",
      selector: (row) => (row.details ? JSON.stringify(row.details) : ""),
      wrap: true,
      grow: 3,
    },
  ];

  const handleResetFilters = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setModuleFilter(null);
    setActionFilter(null);
    setStatusFilter(null);
    setUserFilter(null);
    setTimeout(() => fetchLogs(), 0);
  };

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
              >
                <MDTypography variant="h6" color="white">
                  Action Logs
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Grid container spacing={2} alignItems="center" mb={3}>
                  <Grid item xs={12} md={3} lg={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate.toISOString().split("T")[0]}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [y, m, d] = e.target.value.split("-");
                        setStartDate(new Date(y, m - 1, d));
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3} lg={2}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate.toISOString().split("T")[0]}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const [y, m, d] = e.target.value.split("-");
                        setEndDate(new Date(y, m - 1, d));
                      }}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Autocomplete
                      options={filters.module || []}
                      value={moduleFilter}
                      onChange={(event, newValue) => setModuleFilter(newValue)}
                      renderInput={(params) => <TextField {...params} label="Module" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Autocomplete
                      options={filters.action || []}
                      value={actionFilter}
                      onChange={(event, newValue) => setActionFilter(newValue)}
                      renderInput={(params) => <TextField {...params} label="Action" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Autocomplete
                      options={filters.status || []}
                      value={statusFilter}
                      onChange={(event, newValue) => setStatusFilter(newValue)}
                      renderInput={(params) => <TextField {...params} label="Status" />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Autocomplete
                      options={filters.user || []}
                      value={userFilter}
                      onChange={(event, newValue) => setUserFilter(newValue)}
                      renderInput={(params) => <TextField {...params} label="User" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton variant="gradient" color="info" onClick={fetchLogs} fullWidth>
                      Filter
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={handleResetFilters}
                      fullWidth
                    >
                      Reset
                    </MDButton>
                  </Grid>
                </Grid>
                <DataTable
                  columns={columns}
                  data={logs}
                  pagination
                  progressPending={loading}
                  persistTableHead
                  dense
                  onRowClicked={handleRowClick}
                  pointerOnHover
                  highlightOnHover
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      {selectedLog && (
        <Dialog
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="h6">Log Details</MDTypography>
              <IconButton onClick={() => setShowDetailsModal(false)}>
                <Icon>close</Icon>
              </IconButton>
            </MDBox>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>ID:</strong> {selectedLog._id}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>Date:</strong> {new Date(selectedLog.createdAt).toLocaleString()}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>User:</strong> {selectedLog.user}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>Module:</strong> {selectedLog.module}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>Action:</strong> {selectedLog.action}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>Status:</strong> {selectedLog.status}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>IP Address:</strong> {selectedLog.ip || "N/A"}
                </MDTypography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="body2">
                  <strong>Server:</strong> {selectedLog.server || "N/A"}
                </MDTypography>
              </Grid>
              {selectedLog.errorMessage && (
                <Grid item xs={12}>
                  <MDTypography variant="h6" color="error" mt={2}>
                    <strong>Error Message:</strong>
                  </MDTypography>
                  <MDTypography variant="body2">{selectedLog.errorMessage}</MDTypography>
                </Grid>
              )}
              <Grid item xs={12}>
                <MDTypography variant="body2" mt={2}>
                  <strong>Details:</strong>
                </MDTypography>
                <MDBox
                  component="pre"
                  sx={{ p: 1, background: "#f0f0f0", borderRadius: "4px", whiteSpace: "pre-wrap" }}
                >
                  {JSON.stringify(selectedLog.details, null, 2)}
                </MDBox>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

export default Logs;
