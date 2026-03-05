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
// React components
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Vars
import vars from "../../config";

//Global
import { useSocket } from "context/socket";
import { globalFuncs } from "../../context/global";
import { useLoginState } from "context/loginContext";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Icon, IconButton, Tooltip, Dialog, DialogTitle, DialogContent } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "react-data-table-component";
import EditCustomerDetails from "../repairDetails/components/editCustomerDetails";

const WhatsAppIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    style={style}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.381a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const statusMap = {
  0: { content: "Created", gradient: "linear-gradient(195deg, #FFFF00, #989845)", color: "#000" },
  1: {
    content: "Not started",
    gradient: "linear-gradient(195deg, #ffae00, #B38D4C)",
    color: "#000",
  },
  2: {
    content: "In Progress",
    gradient: "linear-gradient(195deg, #00BEFF, #4C99B3)",
    color: "#000",
  },
  3: { content: "Paused", gradient: "linear-gradient(195deg, #3D8E8C, #00FFF9)", color: "#000" },
  4: {
    content: "Repair Complete",
    gradient: "linear-gradient(195deg, #3C9041, #00FF0F)",
    color: "#000",
  },
  5: {
    content: "Invoice Created",
    gradient: "linear-gradient(195deg, #8E833E, #FFDE03)",
    color: "#000",
  },
  6: { content: "Complete", gradient: "linear-gradient(195deg, #329858, #00FF60)", color: "#000" },
  11: {
    content: "Paused - Awaiting parts",
    gradient: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
    color: "#000",
  },
  12: {
    content: "Paused - Parts delivered",
    gradient: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
    color: "#000",
  },
  997: {
    content: "Cancelled - Return to Customer",
    gradient: "linear-gradient(195deg, #984742, #FB0F00)",
    color: "#fff",
  },
  998: {
    content: "Cancelled",
    gradient: "linear-gradient(195deg, #984742, #FB0F00)",
    color: "#fff",
  },
  999: {
    content: "Unrepairable",
    gradient: "linear-gradient(195deg, #9E3755, #F70048)",
    color: "#fff",
  },
};

const Status = ({ repairStatus }) => {
  const statusInfo = statusMap[repairStatus];

  if (!statusInfo) {
    return null;
  }

  return (
    <MDBox ml={-1}>
      <MDBadge
        badgeContent={statusInfo.content}
        sx={{
          "& .MuiBadge-badge": {
            color: statusInfo.color,
            backgroundColor: "green",
            background: statusInfo.gradient,
          },
        }}
        size="sm"
        bg=""
        container
      />
    </MDBox>
  );
};

const CustomerDetails = () => {
  const { setLoginState } = useLoginState();
  const { setSnackBar, setShowLoad, asteriskStatus } = globalFuncs();
  const socket = useSocket();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState({});
  const [repairs, setRepairs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [callHistory, setCallHistory] = useState([]);

  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [openPlayer, setOpenPlayer] = useState(false);

  const getCustomer = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getCustomerDetails", { id }, (res) => {
        if (res.res === 401) {
          setLoginState(false);
          setSnackBar({
            type: "error",
            title: "Server error occured",
            message: "Unauthorized, redirecting to login",
            show: true,
            icon: "error",
          });
        } else if (res.res === 500) {
          setSnackBar({
            type: "error",
            title: "Server error occured",
            message: "An unexpected error occurred",
            show: true,
            icon: "error",
          });
        } else {
          setCustomer(res.data.customer || {});
          setRepairs(res.data.repairs || []);
          setOrders(res.data.orders || []);
          setMessages(res.data.messages || []);
          setCallHistory(res.data.callHistory || []);
          setLoading(false);
          setShowLoad(false);
        }
      });
    }
  };

  useEffect(() => {
    if (socket) {
      getCustomer();
    }
  }, [socket, id]);

  const handleSaveCustomerDetails = (data) => {
    setShowLoad(true);
    if (socket) {
      socket.emit("updateCustomer", data, (res) => {
        if (res.res === 200) {
          setSnackBar({
            type: "success",
            title: "Success",
            message: "Customer details updated",
            show: true,
            icon: "check",
          });
          setShowEditCustomerModal(false);
          getCustomer();
        } else {
          setSnackBar({
            type: "error",
            title: "Error",
            message: "Failed to update customer details",
            show: true,
            icon: "warning",
          });
        }
        setShowLoad(false);
      });
    }
  };

  const handleCallCustomer = (phoneNumber) => {
    if (!phoneNumber) return;
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    setShowLoad(true);
    if (socket) {
      socket.emit("CallCustomer", { phoneNumber: cleanNumber }, (res) => {
        setShowLoad(false);
        if (res.res === 200) {
          setSnackBar({
            type: "success",
            title: "Call Initiated",
            message: "Calling customer...",
            show: true,
            icon: "call",
          });
        } else {
          setSnackBar({
            type: "error",
            title: "Call Failed",
            message: res.message || "Failed to initiate call",
            show: true,
            icon: "error",
          });
        }
      });
    } else {
      setShowLoad(false);
    }
  };

  const handlePlay = (url) => {
    setAudioSrc(url);
    setOpenPlayer(true);
  };

  const handleClosePlayer = () => {
    setOpenPlayer(false);
    setAudioSrc(null);
  };

  const repairColumns = [
    {
      name: "ID",
      selector: (row) => row.repairID,
      sortable: true,
      width: "80px",
    },
    {
      name: "Device",
      selector: (row) => (row.pev ? `${row.pev.Brand?.name} ${row.pev.Model}` : "Unknown"),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <Status repairStatus={row.status} />,
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
      format: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const orderColumns = [
    {
      name: "Order ID",
      selector: (row) => row.id,
      sortable: true,
      wrap: true,
    },
    {
      name: "Date",
      selector: (row) => row.created_at,
      sortable: true,
      format: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      name: "Items",
      selector: (row) => row.line_items?.length || 0,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.state,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.total_money?.amount,
      sortable: true,
      format: (row) => `$${(row.total_money?.amount / 100).toFixed(2)}`,
    },
  ];

  const messageColumns = [
    {
      name: "Direction",
      selector: (row) => (row.SmsStatus === "received" ? "Incoming" : "Outgoing"),
      sortable: true,
      width: "120px",
      cell: (row) => {
        const isWa =
          (row.To && row.To.startsWith("whatsapp:")) ||
          (row.From && row.From.startsWith("whatsapp:"));
        return (
          <MDBox display="flex" alignItems="center">
            <Icon color={row.SmsStatus === "received" ? "success" : "info"} sx={{ mr: 1 }}>
              {row.SmsStatus === "received" ? "call_received" : "call_made"}
            </Icon>
            {isWa ? (
              <WhatsAppIcon style={{ width: "20px", height: "20px", fill: "#25D366" }} />
            ) : (
              <Icon fontSize="small">sms</Icon>
            )}
          </MDBox>
        );
      },
    },
    {
      name: "Message",
      selector: (row) => row.Body,
      sortable: false,
      wrap: true,
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
      width: "180px",
      format: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  const callColumns = [
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <MDBox display="flex" alignItems="center">
          <Icon
            color={row.type === "IN" ? "success" : row.type === "VOICEMAIL" ? "warning" : "info"}
          >
            {row.type === "IN"
              ? "call_received"
              : row.type === "VOICEMAIL"
              ? "voicemail"
              : "call_made"}
          </Icon>
          <MDTypography variant="caption" ml={1}>
            {row.type}
          </MDTypography>
        </MDBox>
      ),
    },
    {
      name: "Duration",
      selector: (row) => row.duration_seconds,
      sortable: true,
      format: (row) => `${row.duration_seconds}s`,
    },
    {
      name: "Date",
      selector: (row) => row.timestamp || row.createdAt,
      sortable: true,
      format: (row) => new Date(row.timestamp || row.createdAt).toLocaleString(),
    },
    {
      name: "Recording",
      cell: (row) =>
        row.recordingUrl || row.filename ? (
          <IconButton
            onClick={() =>
              handlePlay(
                row.recordingUrl ||
                  `https://api.pevconnection.com/asterisk/recordings/${encodeURIComponent(
                    row.filename
                  )}`
              )
            }
            color="info"
          >
            <Icon>play_circle</Icon>
          </IconButton>
        ) : null,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Customer Details */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
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
                  Customer Details
                </MDTypography>
                <IconButton onClick={() => setShowEditCustomerModal(true)} sx={{ color: "white" }}>
                  <Icon>edit</Icon>
                </IconButton>
              </MDBox>
              <MDBox p={3}>
                <MDTypography variant="h5" fontWeight="medium">
                  {customer.given_name || ""} {customer.family_name || ""}
                </MDTypography>
                <MDBox mt={2}>
                  {customer.phone_number && (
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <Icon fontSize="small" sx={{ mr: 1 }}>
                        phone
                      </Icon>
                      <MDTypography variant="body2">{customer.phone_number}</MDTypography>
                      <Tooltip title={asteriskStatus ? "Call Customer" : "PBX Server Offline"}>
                        <MDBox component="span">
                          <IconButton
                            size="small"
                            color="success"
                            disabled={!asteriskStatus}
                            onClick={() => handleCallCustomer(customer.phone_number)}
                            sx={{ ml: 1 }}
                          >
                            <Icon>call</Icon>
                          </IconButton>
                        </MDBox>
                      </Tooltip>
                    </MDBox>
                  )}
                  {customer.email_address && (
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <Icon fontSize="small" sx={{ mr: 1 }}>
                        email
                      </Icon>
                      <MDTypography variant="body2">{customer.email_address}</MDTypography>
                    </MDBox>
                  )}
                  {customer.address && (
                    <MDBox display="flex" alignItems="flex-start" mb={1}>
                      <Icon fontSize="small" sx={{ mr: 1, mt: 0.5 }}>
                        location_on
                      </Icon>
                      <MDBox>
                        <MDTypography variant="body2" display="block">
                          {customer.address.address_line_1}
                        </MDTypography>
                        {customer.address.address_line_2 && (
                          <MDTypography variant="body2" display="block">
                            {customer.address.address_line_2}
                          </MDTypography>
                        )}
                        <MDTypography variant="body2" display="block">
                          {customer.address.locality}
                          {customer.address.administrative_district_level_1
                            ? `, ${customer.address.administrative_district_level_1}`
                            : ""}
                          {customer.address.postal_code ? ` ${customer.address.postal_code}` : ""}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Repair History */}
          <Grid item xs={12} md={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Repair History
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <DataTable
                  columns={repairColumns}
                  data={repairs}
                  pagination
                  onRowClicked={(row) => navigate(`/repairdetails/${row._id}`)}
                  pointerOnHover
                  highlightOnHover
                  noDataComponent="No repair history found"
                />
              </MDBox>
            </Card>
          </Grid>

          {/* Message History */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDTypography variant="h6" color="white">
                  Message History
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <DataTable
                  columns={messageColumns}
                  data={messages}
                  pagination
                  onRowClicked={(row) => {
                    const conversationId = row.SmsStatus === "received" ? row.From : row.To;
                    navigate("/messages", { state: { conversationId } });
                  }}
                  pointerOnHover
                  highlightOnHover
                  noDataComponent="No messages found"
                />
              </MDBox>
            </Card>
          </Grid>

          {/* Call History */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                variant="gradient"
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  Call History
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <DataTable
                  columns={callColumns}
                  data={callHistory}
                  pagination
                  noDataComponent="No call history found"
                />
              </MDBox>
            </Card>
          </Grid>

          {/* Order History */}
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
                px={2}
                variant="gradient"
                bgColor="primary"
                borderRadius="lg"
                coloredShadow="primary"
              >
                <MDTypography variant="h6" color="white">
                  Order History
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <DataTable
                  columns={orderColumns}
                  data={orders}
                  pagination
                  onRowClicked={(row) => navigate(`/orders/${row.id}`)}
                  pointerOnHover
                  highlightOnHover
                  noDataComponent="No orders found"
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <EditCustomerDetails
        open={showEditCustomerModal}
        onClose={() => setShowEditCustomerModal(false)}
        customer={customer}
        onSave={handleSaveCustomerDetails}
      />

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

      <Footer />
    </DashboardLayout>
  );
};

export default CustomerDetails;
