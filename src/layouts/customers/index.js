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

// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import { makeStyles } from "@mui/styles";
import { Modal, Select, IconButton, Icon } from "@mui/material";
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
import authorsTableData from "layouts/tables/data/customersTable";
import projectsTableData from "layouts/tables/data/projectsTableData";
import FilterDialog from "./components/filter";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  minHeight: "50vh",
  maxHeight: "80vh",
  overflowY: "scroll",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

const useStyles = makeStyles((theme) => ({
  input: {
    background: "rgb(232, 241, 250)",
  },
}));
const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;

    // if (transparentNavbar) {
    //   colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
    // }

    return colorValue;
  },
});
// eslint-disable-next-line react/prop-types
const Customers = ({ globalFunc }) => {
  const classes = useStyles();
  const [repairData, setRepairData] = useState({});
  const [repairID, setrepairID] = useState(null);
  const [showFilter, setShowFiler] = useState(false);
  const [filterVal, setfilterVal] = useState();
  const [filteKey, setfilterKey] = useState();

  const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    return [
      values,
      (newValue) => {
        setValues({
          ...values,
          ...newValue,
        });
      },
    ];
  };
  const [repairStep, setRepairStep] = useState(1);

  const updateRepairData = (val) => {
    setRepairData({ ...val });
  };

  const contIntake = (repair) => {
    setrepairID(repair._id);
    updateRepairData({ customer: repair.Customer._id, pev: repair.pev._id });
    setNewRepair(true);
    setRepairStep(3);
  };

  const { columns, rows, reRender, filter, resetFilter, repairs, myFilters } = authorsTableData(
    globalFunc,
    contIntake
  );

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
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
                  <Grid item xs={12} md={4} alignItems="center" textAlign="right">
                    <TextField
                      label="Search"
                      InputProps={{ className: classes.input }}
                      fullWidth
                      value={myFilters}
                      onChange={(e) => {
                        filter(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item md={8} alignItems="center"></Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  noEndBorder
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

export default Customers;
