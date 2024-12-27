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

import Step1 from "./components/step1";
import Step2 from "./components/step2";

// Data
import authorsTableData from "layouts/tables/data/warrantyData";

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
const WarrantyAdmin = ({ globalFunc }) => {
  const classes = useStyles();
  const [newRepair, setNewRepair] = useState(false);
  const [warrantyData, setWarrantyData] = useState({
    pev: null,
    serialNumber: null,
    warrantyLengthBattery: null,
    warrantyLengthOther: null,
    warrantyStart: null,
  });

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

  useEffect(() => {
    console.log("Warranty data: ", warrantyData);
  }, [warrantyData]);
  const { columns, rows, reRender, setsearchTerm, searchterm } = authorsTableData(globalFunc);

  const nextRepairStep = async (val, data = null) => {
    if (val == 2) {
      setWarrantyData({ pev: data });
      setRepairStep(2);
    }
    if (val == 3) {
      //Show step 3
      console.log(data.serialNumber);
      let newWarrantyData = { ...warrantyData };
      newWarrantyData.serialNumber = data.serialNumber;
      newWarrantyData.warrantyStart = new Date(data.warrantyStart.$d).toLocaleDateString();
      newWarrantyData.warrantyLengthBattery = data.warrantyLengthBattery;
      newWarrantyData.warrantyLengthOther = data.warrantyLengthOther;
      setWarrantyData(newWarrantyData);
      setNewRepair(false);
      submitWarranty(newWarrantyData);
    }
  };

  const submitWarranty = async (newWarrantyData) => {
    const response = await fetch(`${vars.serverUrl}/warranty_admin/createWarranty`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newWarrantyData),
      credentials: "include",
    });
    const json = await response.json();
    //setCustomerID(json.data.customer.id);
    if (json.res == 200) {
      setWarrantyData({
        pev: null,
        serialNumber: null,
        warrantyLengthBattery: null,
        warrantyLengthOther: null,
        warrantyStart: null,
      });
      globalFunc.setSuccessSBText("Warranty details saved");
      globalFunc.setSuccessSB(true);
      reRender();
    } else {
      setWarrantyData({
        pev: null,
        serialNumber: null,
        warrantyLengthBattery: null,
        warrantyLengthOther: null,
        warrantyStart: null,
      });
      globalFunc.setErrorSBText("Error occurred saving warranty details.");
      globalFunc.setErrorSB(true);
    }
  };

  const showNewPev = async () => {
    setNewRepair(true);
    setRepairStep(0);
  };

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
                  <Grid item xs={12} md={4} alignItems="center">
                    <MDButton
                      variant="contained"
                      color="success"
                      onClick={() => {
                        showNewPev();
                      }}
                    >
                      New PEV
                    </MDButton>
                  </Grid>
                  <Grid item xs={11} md={7}>
                    <TextField
                      label="Search"
                      InputProps={{ className: classes.input }}
                      fullWidth
                      value={searchterm}
                      onChange={(e) => {
                        setsearchTerm(e.target.value);
                      }}
                    />
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  entriesPerPage={10}
                  table={{ columns, rows }}
                  showTotalEntries={true}
                  noEndBorder
                  pagination
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Modal
        open={newRepair}
        onClose={() => null}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          {repairStep == 0 ? (
            <Step1 callback={nextRepairStep} globalFunc={globalFunc}></Step1>
          ) : (
            <Step2 callback={nextRepairStep} globalFunc={globalFunc}></Step2>
          )}
          <MDButton
            sx={{ marginTop: "2px" }}
            fullWidth
            color="secondary"
            onClick={() => {
              setNewRepair(false);
              reRender();
              setRepairStep(0);
            }}
          >
            Cancel
          </MDButton>
        </MDBox>
      </Modal>
    </DashboardLayout>
  );
};

export default WarrantyAdmin;
