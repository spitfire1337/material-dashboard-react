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
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import DataTable from "react-data-table-component";

function Orders() {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(location.state?.status || "All");

  const fetchOrders = () => {
    if (!socket) return;
    setLoading(true);
    socket.emit("getOrders", { startDate, endDate }, (res) => {
      if (res.res === 200) {
        setOrders(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    if (socket) {
      fetchOrders();
    }
  }, [socket]);

  const handleRowClicked = (row) => {
    navigate(`/orders/${row.orderId || row.id}`);
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => row.updated_at,
      format: (row) => new Date(row.updated_at).toLocaleString(),
      sortable: true,
    },
    {
      name: "Order ID",
      selector: (row) => row.orderId || row.id,
      sortable: true,
    },
    {
      name: "Customer",
      selector: (row) =>
        row.customerName ||
        (row.customer
          ? `${row.customer.given_name || ""} ${row.customer.family_name || ""}`
          : "Guest"),
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => row.total_money?.amount || 0,
      format: (row) => (row.total_money ? `$${(row.total_money.amount / 100).toFixed(2)}` : ".00"),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.state || row.status,
      sortable: true,
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const orderId = order.orderId || order._id || "";
    const customerName =
      order.customerName ||
      (order.customer
        ? `${order.customer.given_name || ""} ${order.customer.family_name || ""}`
        : "Guest");
    const status = order.state || order.status || "";

    const matchesSearch =
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
                  Order History
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Grid container spacing={2} alignItems="center" mb={3}>
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel id="status-select-label">Status</InputLabel>
                      <Select
                        labelId="status-select-label"
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ height: "44px" }}
                      >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="OPEN">OPEN</MenuItem>
                        <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton variant="gradient" color="info" onClick={fetchOrders} fullWidth>
                      Filter
                    </MDButton>
                  </Grid>
                </Grid>
                <DataTable
                  columns={columns}
                  data={filteredOrders}
                  pagination
                  progressPending={loading}
                  persistTableHead
                  onRowClicked={handleRowClicked}
                  pointerOnHover
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Orders;
