import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  Card,
  Grid,
  Icon,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import DataTable from "react-data-table-component";
import MDButton from "components/MDButton";

// Context & Config
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";

function PartsOnOrder() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingPart, setTrackingPart] = useState(null);

  const getTrackingLink = (trackingNumber) => {
    if (!trackingNumber) return null;
    const cleanNumber = trackingNumber.replace(/\s/g, "").toUpperCase();

    // UPS
    if (/^1Z[A-Z0-9]{16}$/.test(cleanNumber)) {
      return `https://www.ups.com/track?tracknum=${cleanNumber}`;
    }
    // FedEx
    if (/^\d{12}$|^\d{15}$/.test(cleanNumber)) {
      return `https://www.fedex.com/fedextrack/?trknbr=${cleanNumber}`;
    }
    // USPS
    if (
      /^9\d{21}$/.test(cleanNumber) ||
      /^\d{20}$/.test(cleanNumber) ||
      /^\d{22}$/.test(cleanNumber)
    ) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanNumber}`;
    }
    // DHL
    if (/^\d{10}$/.test(cleanNumber)) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${cleanNumber}&brand=DHL`;
    }
    // Amazon Tracking Number (TBA...)
    if (/^TB[A-Z]\d{12}$/.test(cleanNumber)) {
      return `https://track.amazon.com/tracking/${cleanNumber}`;
    }
    return null;
  };

  const fetchData = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getPartsOnOrder", {}, (res) => {
        if (res.res === 200) {
          setData(res.data);
        } else {
          setSnackBar({
            type: "error",
            title: "Error",
            message: "Failed to load parts on order",
            show: true,
            icon: "warning",
          });
        }
        setShowLoad(false);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    if (socket) {
      fetchData();
    }
  }, [socket]);

  const receivePart = (row) => {
    setShowLoad(true);
    if (socket) {
      socket.emit(
        "receivePart",
        {
          repairId: row.repairId._id,
          partId: row._id,
        },
        (json) => {
          setShowLoad(false);
          if (json.res == 200) {
            setSnackBar({
              type: "success",
              title: "Part Received",
              message: "Part has been moved to repair parts list",
              show: true,
              icon: "check",
            });
            fetchData();
          } else {
            setSnackBar({
              type: "error",
              title: "Error",
              message: json.message,
              show: true,
              icon: "error",
            });
          }
        }
      );
    }
  };

  const handleViewTracking = (part) => {
    setTrackingPart(part);
    setShowTrackingModal(true);
  };

  const columns = [
    {
      name: "Part Name",
      selector: (row) => row.partName,
      sortable: true,
      wrap: true,
    },
    {
      name: "Qty",
      selector: (row) => row.quantity,
      sortable: true,
      width: "80px",
    },
    {
      name: "Vendor",
      selector: (row) => row.vendor,
      sortable: true,
    },
    {
      name: "Order #",
      cell: (row) => (
        <div>
          {row.orderNumber}
          {row.vendor && row.vendor.toLowerCase().includes("amazon") && row.orderNumber && (
            <a
              href={`https://www.amazon.com/gp/your-account/ship-track?orderId=${row.orderNumber}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#1A73E8",
                textDecoration: "underline",
              }}
            >
              Track on Amazon
            </a>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Tracking",
      cell: (row) => {
        if (row.trackingInfo) {
          return (
            <MDBox>
              <MDTypography
                component="span"
                variant="body2"
                color="info"
                sx={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => handleViewTracking(row)}
              >
                {row.trackingNumber}
              </MDTypography>
              <MDTypography variant="caption" display="block" color="text">
                {row.trackingInfo.tracking_status?.status_details ||
                  row.trackingInfo.tracking_status?.status}
              </MDTypography>
            </MDBox>
          );
        }
        const link = getTrackingLink(row.trackingNumber);
        return link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#1A73E8", textDecoration: "underline" }}
          >
            {row.trackingNumber}
          </a>
        ) : (
          row.trackingNumber
        );
      },
      sortable: true,
    },
    {
      name: "Customer",
      selector: (row) => row.repairId.Customer.given_name + " " + row.repairId.Customer.family_name,
      sortable: true,
    },
    {
      name: "Repair",
      cell: (row) => (
        <Link
          to={`/repairdetails/${row.repairId._id}`}
          style={{ color: "#1A73E8", textDecoration: "underline" }}
        >
          View Repair
        </Link>
      ),
      button: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Tooltip title="Mark as Received">
          <IconButton color="success" onClick={() => receivePart(row)}>
            <Icon>check</Icon>
          </IconButton>
        </Tooltip>
      ),
      button: true,
    },
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
              >
                <MDTypography variant="h6" color="white">
                  Parts on Order
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable columns={columns} data={data} pagination progressPending={loading} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      {/* Tracking Info Modal */}
      <Dialog
        open={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Tracking Information - {trackingPart?.trackingNumber}</DialogTitle>
        <DialogContent>
          {trackingPart?.trackingInfo && (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12}>
                <MDTypography variant="h6">
                  Status: {trackingPart.trackingInfo.tracking_status?.status}
                </MDTypography>
                <MDTypography variant="body2">
                  {trackingPart.trackingInfo.tracking_status?.status_details}
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Last Updated:{" "}
                  {new Date(
                    trackingPart.trackingInfo.tracking_status?.status_date
                  ).toLocaleString()}
                </MDTypography>
              </Grid>
              {trackingPart.trackingInfo.eta && (
                <Grid item xs={12}>
                  <MDTypography variant="body2">
                    ETA: {new Date(trackingPart.trackingInfo.eta).toLocaleString()}
                  </MDTypography>
                </Grid>
              )}
              {trackingPart.trackingInfo.servicelevel && (
                <Grid item xs={12}>
                  <MDTypography variant="body2">
                    Service Level: {trackingPart.trackingInfo.servicelevel.name}
                  </MDTypography>
                </Grid>
              )}
              {trackingPart.trackingInfo.address_from && (
                <Grid item xs={6}>
                  <MDTypography variant="subtitle2">From:</MDTypography>
                  <MDTypography variant="body2">
                    {trackingPart.trackingInfo.address_from.city},{" "}
                    {trackingPart.trackingInfo.address_from.state}{" "}
                    {trackingPart.trackingInfo.address_from.zip}
                  </MDTypography>
                </Grid>
              )}
              {trackingPart.trackingInfo.address_to && (
                <Grid item xs={6}>
                  <MDTypography variant="subtitle2">To:</MDTypography>
                  <MDTypography variant="body2">
                    {trackingPart.trackingInfo.address_to.city},{" "}
                    {trackingPart.trackingInfo.address_to.state}{" "}
                    {trackingPart.trackingInfo.address_to.zip}
                  </MDTypography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider />
                <MDTypography variant="h6">History</MDTypography>
                <List dense>
                  {trackingPart.trackingInfo.tracking_history?.map((history, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={history.status_details || history.status}
                        secondary={`${new Date(history.status_date).toLocaleString()} - ${
                          history.location?.city
                        }, ${history.location?.state}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowTrackingModal(false)} color="secondary">
            Close
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default PartsOnOrder;
