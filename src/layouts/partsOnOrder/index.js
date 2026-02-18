import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Material Dashboard 2 React components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, Icon, IconButton, Tooltip } from "@mui/material";
import DataTable from "react-data-table-component";

// Context & Config
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";

function PartsOnOrder() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/reports/partsOnOrder`, {
        credentials: "include",
      });
      const res = await response.json();
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
    } catch (e) {
      console.error(e);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    </DashboardLayout>
  );
}

export default PartsOnOrder;
