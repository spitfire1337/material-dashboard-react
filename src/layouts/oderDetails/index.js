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
import { useParams } from "react-router-dom";
import { useSocket } from "context/socket";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "react-data-table-component";

function OrderDetails() {
  const { id } = useParams();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket && id) {
      setLoading(true);
      socket.emit("getOrder", { id }, (res) => {
        if (res.res === 200) {
          setOrder(res.data);
        }
        setLoading(false);
      });
    }
  }, [socket, id]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading...</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Order not found</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  const lineItemsColumns = [
    { name: "Item", selector: (row) => row.name, sortable: true, grow: 2 },
    { name: "Qty", selector: (row) => row.quantity, sortable: true, width: "80px" },
    {
      name: "Price",
      selector: (row) => `$${(row.base_price_money?.amount / 100).toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Total",
      selector: (row) => `$${(row.gross_sales_money?.amount / 100).toFixed(2)}`,
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
                  Order Details: {order.orderId || order.id}
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6">General Info</MDTypography>
                    <MDTypography variant="body2">
                      Date: {new Date(order.created_at).toLocaleString()}
                    </MDTypography>
                    <MDTypography variant="body2">Status: {order.state}</MDTypography>
                    <MDTypography variant="body2">
                      Total: ${(order.total_money?.amount / 100).toFixed(2)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="h6">Customer</MDTypography>
                    {order.customer ? (
                      <>
                        <MDTypography variant="body2">
                          {order.customer.given_name || ""} {order.customer.family_name || ""}
                        </MDTypography>
                        <MDTypography variant="body2">{order.customer.email_address}</MDTypography>
                        <MDTypography variant="body2">{order.customer.phone_number}</MDTypography>
                      </>
                    ) : (
                      <MDTypography variant="body2">Guest</MDTypography>
                    )}
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <MDTypography variant="h6" gutterBottom>
                  Line Items
                </MDTypography>
                <DataTable columns={lineItemsColumns} data={order.line_items || []} pagination />
                <Divider sx={{ my: 3 }} />
                <MDTypography variant="h6" gutterBottom>
                  Payment Details
                </MDTypography>
                {order.tenders && order.tenders.length > 0 ? (
                  order.tenders.map((tender, index) => (
                    <MDBox key={index} mb={1}>
                      <MDTypography variant="body2">Type: {tender.type}</MDTypography>
                      <MDTypography variant="body2">
                        Amount: ${(tender.amount_money?.amount / 100).toFixed(2)}
                      </MDTypography>
                      <MDTypography variant="body2">
                        Date: {new Date(tender.created_at).toLocaleString()}
                      </MDTypography>
                      {tender.card_details && (
                        <MDTypography variant="body2">
                          Card: {tender.card_details.card.card_brand} ****{" "}
                          {tender.card_details.card.last_4}
                        </MDTypography>
                      )}
                    </MDBox>
                  ))
                ) : (
                  <MDTypography variant="body2">No payment details available</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrderDetails;
