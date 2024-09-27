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
import { useState, React, useEffect } from "react";
import { useParams } from "react-router-dom";

// Vars
import vars from "../../config";

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
import Loading from "components/loading";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};
// eslint-disable-next-line react/prop-types
const RepairDetails = ({ globalFunc }) => {
  const { id } = useParams();
  const [repairID, setrepairID] = useState(id);
  const [loading, setLoading] = useState(true);
  const [repairDetails, setrepairDetails] = useState({});
  console.log("Repair id received:", id);
  const getRepair = async () => {
    const response = await fetch(`${vars.serverUrl}/square/repairdetails`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    } else if (res.res === 500) {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
      console.log(res);
    } else {
      setLoading(false);
      setrepairDetails(res.data);
      console.log("Repair details: ", res.data);
    }
  };

  useEffect(() => {
    getRepair();
  }, [repairID]);

  if (loading) {
    return <Loading />;
  }
  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <MDBox pt={3}>
              <Grid container spacing={1}>
                {/* Repair Actions */}
                <Grid item xs={12}>
                  <Card>
                    <MDBox
                      mx={1}
                      mt={-3}
                      py={1}
                      px={1}
                      variant="gradient"
                      bgColor="info"
                      borderRadius="lg"
                      coloredShadow="info"
                    >
                      <MDTypography variant="h6" color="white">
                        Actions
                      </MDTypography>
                    </MDBox>
                    <MDBox mx={2} py={3} px={2}>
                      <MDTypography variant="subtitle2"></MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                {/* Customer info */}
                <Grid item xs={12} md={4}>
                  <Card>
                    <MDBox
                      mx={1}
                      mt={-3}
                      py={2}
                      px={1}
                      variant="gradient"
                      bgColor="info"
                      borderRadius="lg"
                      coloredShadow="info"
                    >
                      <MDTypography variant="h6" color="white">
                        Customer Details
                      </MDTypography>
                    </MDBox>
                    <MDBox mx={2} py={3} px={2}>
                      <MDTypography variant="subtitle2">
                        {repairDetails.Customer.given_name} {repairDetails.Customer.family_name}
                        {repairDetails.Customer.address != undefined
                          ? [<br key="" />, repairDetails.Customer.address.address_line_1]
                          : ""}
                        {repairDetails.Customer.address != undefined
                          ? repairDetails.Customer.address.address_line_2 != undefined
                            ? [<br key="" />, repairDetails.Customer.address.address_line_2]
                            : ""
                          : ""}
                        {repairDetails.Customer.address != undefined
                          ? [
                              <br key="" />,
                              repairDetails.Customer.address.locality || "",
                              ",",
                              repairDetails.Customer.address.administrative_district_level_1 || "",
                              repairDetails.Customer.address.postal_code || "",
                            ]
                          : ""}
                        {repairDetails.Customer.email_address != undefined
                          ? [<br key="" />, repairDetails.Customer.email_address]
                          : ""}
                        {repairDetails.Customer.phone_number != undefined
                          ? [<br key="" />, repairDetails.Customer.phone_number]
                          : ""}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                {/* Repair Details */}
                <Grid item xs={12} md={8}>
                  <Card>
                    <MDBox
                      mx={1}
                      mt={-3}
                      py={2}
                      px={1}
                      variant="gradient"
                      bgColor="info"
                      borderRadius="lg"
                      coloredShadow="info"
                    >
                      <MDTypography variant="h6" color="white">
                        Repair Details
                      </MDTypography>
                    </MDBox>
                    <MDBox mx={2} py={3} px={2}>
                      <MDTypography variant="body1">
                        {repairDetails.pev.Brand.name} {repairDetails.pev.Model}
                      </MDTypography>
                      <MDTypography variant="body1">Repair Type:</MDTypography>
                      <MDTypography variant="body2">
                        {repairDetails.RepairType.map((type) => {
                          return ` ${type}, `;
                        })}
                      </MDTypography>
                      <MDTypography variant="body1">Details:</MDTypography>
                      <MDTypography variant="body2">{repairDetails.Details}</MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default RepairDetails;
