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
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { TextField } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "react-data-table-component";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";

function Customers() {
  const { setShowLoad } = globalFuncs();
  const socket = useSocket();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchCustomers = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getCustomers", {}, (res) => {
        if (res && res.res === 200) {
          setCustomers(res.data);
        }
        setShowLoad(false);
      });
    }
  };

  useEffect(() => {
    if (socket) {
      fetchCustomers();
    }
  }, [socket]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      if (!customer.given_name && !customer.email_address && !customer.phone_number) {
        return false;
      }

      const searchLower = searchText.toLowerCase();
      const firstName = customer.given_name?.toLowerCase() || "";
      const lastName = customer.family_name?.toLowerCase() || "";
      const email = customer.email_address?.toLowerCase() || "";
      const phone = customer.phone_number?.toLowerCase() || "";

      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower)
      );
    });
  }, [customers, searchText]);

  const columns = [
    {
      name: "Name",
      selector: (row) => [row.given_name, row.family_name].filter(Boolean).join(" "),
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email_address,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone_number,
      sortable: true,
    },
    {
      name: "City",
      selector: (row) => row.address?.locality || "",
      sortable: true,
    },
    {
      name: "State",
      selector: (row) => row.address?.administrative_district_level_1 || "",
      sortable: true,
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
                  Customers
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Search Customers"
                      variant="outlined"
                      fullWidth
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <DataTable
                  columns={columns}
                  data={filteredCustomers}
                  pagination
                  onRowClicked={(row) => navigate(`/customer/${row._id}`)}
                  pointerOnHover
                  highlightOnHover
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

export default Customers;
