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
} from "@mui/material";

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
import Step3 from "./components/step3";
import Step4 from "./components/step4";

// Data
import authorsTableData from "layouts/tables/data/repairsDataTable";
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
const Repairs = ({ globalFunc }) => {
  const { columns: pColumns, rows: pRows } = projectsTableData();
  const [newRepair, setNewRepair] = useState(false);
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

  const { columns, rows, reRender, filter, resetFilter, repairs } = authorsTableData(
    globalFunc,
    contIntake
  );

  const nextRepairStep = async (val, customer = null) => {
    if (val == 2) {
      setRepairStep(2);
      setRepairData({ Customer: customer });
    }
    if (val == 3) {
      //Show step 3
      setRepairStep(3);
    }
    if (val == 4) {
      //Show step 3
      setRepairStep(4);
    }
    if (val == 5) {
      reRender();
      setNewRepair(false);
      setRepairStep(0);
    }
  };

  const showNewRepair = async () => {
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
                  <Grid item xs={6} alignItems="center">
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
                  <Grid item xs={6} alignItems="center" textAlign="right">
                    <IconButton
                      size="large"
                      disableRipple
                      color="red"
                      onClick={() => {
                        setShowFiler(true);
                      }}
                    >
                      <Icon sx={iconsStyle}>filter_list</Icon>
                    </IconButton>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={true}
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
      <Modal
        open={newRepair}
        onClose={() => null}
        // onClose={() => {
        //   setNewRepair(false);
        // }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          {repairStep == 0 ? (
            <Step1 nextRepairStep={nextRepairStep} globalFunc={globalFunc}></Step1>
          ) : repairStep == 2 ? (
            <Step2
              nextRepairStep={nextRepairStep}
              repairData={repairData}
              updateRepairData={updateRepairData}
              setrepairID={setrepairID}
              globalFunc={globalFunc}
            ></Step2>
          ) : repairStep == 3 ? (
            <Step3
              repairID={repairID}
              globalFunc={globalFunc}
              nextRepairStep={nextRepairStep}
            ></Step3>
          ) : (
            <Step4
              repairID={repairID}
              globalFunc={globalFunc}
              nextRepairStep={nextRepairStep}
              reRender={reRender}
              setNewRepair={setNewRepair}
            ></Step4>
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
      <FilterDialog
        filter={filter}
        showFilter={showFilter}
        resetFilter={resetFilter}
        setShowFiler={setShowFiler}
        repairs={repairs}
      />
    </DashboardLayout>
  );
};

export default Repairs;
