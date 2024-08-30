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
import { useState, React } from "react";

// Vars
import vars from "../../vars";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  TextField,
  Divider,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";
import { Label } from "@mui/icons-material";

function Repairs() {
  const { columns, rows } = authorsTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
  const [newRepair, setNewRepair] = useState(false);
  const [showCustForm, setShowCustForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersSelection, setCustomersSelection] = useState([]);
  const [selectedcustomer, setSelectedCustomer] = useState([]);
  const [repairStep, setRepairStep] = useState(1);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "25px",
  };

  const respairStepTwo = async () => {
    return null;
  };

  const showNewRepair = async () => {
    const response = await fetch(`${vars.server}/square/getMyData?action=getCustomers`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();
      if (res.res === 200) {
        const useableCustomers = res.data.filter((cust) => cust.email_address != undefined);
        setCustomers(useableCustomers);
        let custList = [{ label: "New Customer", id: 0 }];
        useableCustomers.map((cust) => {
          custList.push({
            label: `${cust.email_address} ${
              cust.given_name != undefined && cust.family_name != undefined
                ? `| ${cust.given_name} ${cust.family_name}`
                : ""
            }`,
            id: cust.id,
          });
        });
        setCustomersSelection(custList);
        setSelectedCustomer({});
        setShowCustForm(false);
        setNewRepair(true);
        setRepairStep(0);
      } else {
        console.log(res);
      }
    } else {
      //Unauthorized or invalid response
      console.log(response);
    }
  };

  const chooseCustomer = (cust) => {
    console.log(cust);
    if (cust == null) {
      setSelectedCustomer({});
      setShowCustForm(false);
    } else if (cust.id == 0) {
      //NEW CUSTOMER
      console.log("New customer");
      setSelectedCustomer({});
      setShowCustForm(true);
    } else {
      let custData = customers.filter((mycust) => mycust.id == cust.id)[0];
      setSelectedCustomer(custData);
      console.log("Selected customer", custData);
      setShowCustForm(true);
    }
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
                <Grid container>
                  <Grid item xs={6} alignItems="center">
                    <MDTypography variant="h6" color="white">
                      Test Table
                    </MDTypography>
                  </Grid>
                  <Grid item xs={6} alignItems="center" textAlign="right">
                    <MDButton
                      variant="contained"
                      color="success"
                      onClick={() => {
                        showNewRepair();
                      }}
                    >
                      New Repair
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
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
                  Projects Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Modal
        open={newRepair}
        onClose={() => {
          setNewRepair(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {repairStep == 0 ? (
          <MDBox sx={style}>
            <MDTypography id="modal-modal-title" variant="h6" component="h2">
              Customer details
            </MDTypography>
            <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <Autocomplete
                  onChange={(event, newValue) => {
                    chooseCustomer(newValue);
                  }}
                  disablePortal
                  options={customersSelection}
                  fullWidth
                  renderInput={(params) => <TextField {...params} label="Customer" />}
                />
              </FormControl>
              {showCustForm == true ? (
                <FormControl fullWidth>
                  <Divider fullWidth></Divider>
                  <Grid container spacing={1} marginTop={1}>
                    <Grid item md={6} sm={12}>
                      <TextField
                        label="First Name"
                        fullWidth
                        value={
                          selectedcustomer.given_name != undefined
                            ? selectedcustomer.given_name
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item md={6} sm={12}>
                      <TextField
                        label="Last Name"
                        fullWidth
                        value={
                          selectedcustomer.family_name != undefined
                            ? selectedcustomer.family_name
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12}>
                      <TextField
                        label="Email address"
                        fullWidth
                        value={
                          selectedcustomer.email_address != undefined
                            ? selectedcustomer.email_address
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12}>
                      <TextField
                        label="Phone number"
                        fullWidth
                        value={
                          selectedcustomer.phone_number != undefined
                            ? selectedcustomer.phone_number
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12}>
                      <TextField
                        label="Street Address"
                        fullWidth
                        value={
                          selectedcustomer.address != undefined
                            ? selectedcustomer.address.address_line_1
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12} md={6}>
                      <TextField
                        label="City"
                        fullWidth
                        value={
                          selectedcustomer.address != undefined
                            ? selectedcustomer.address.locality
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        label="State"
                        fullWidth
                        value={
                          selectedcustomer.address != undefined
                            ? selectedcustomer.address.administrative_district_level_1
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <TextField
                        label="Zip"
                        fullWidth
                        value={
                          selectedcustomer.address != undefined
                            ? selectedcustomer.address.postal_code
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item sm={12}>
                      <MDButton
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => respairStepTwo()}
                      >
                        Next
                      </MDButton>
                    </Grid>
                  </Grid>
                </FormControl>
              ) : null}
            </MDTypography>
          </MDBox>
        ) : (
          <MDBox></MDBox>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default Repairs;
