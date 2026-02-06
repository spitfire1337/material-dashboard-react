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
import { useTableState } from "../../context/tableState";
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
  Tooltip,
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
//import DataTable from "examples/Tables/DataTable";
import DataTable from "react-data-table-component";
import Step1 from "./components/step1";
import Step2 from "./components/step2_new";
import Step3 from "./components/step3";
import Step4 from "./components/step4";

import ExpandedComponent from "./components/expand";
// Data
import authorsTableData from "layouts/tables/data/repairsDataTable";
import projectsTableData from "layouts/tables/data/projectsTableData";
import FilterDialog from "./components/filter";
import tab from "assets/theme/components/tabs/tab";

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
const Repairs = ({ globalFunc }) => {
  const { tableState, setTableState, RepairRerender } = useTableState();
  const { repairstatus } = useParams();
  const classes = useStyles();
  const [newRepair, setNewRepair] = useState(false);
  const [repairData, setRepairData] = useState({});
  const [repairID, setrepairID] = useState(null);
  const [showFilter, setShowFiler] = useState(false);

  const [repairStep, setRepairStep] = useState(1);

  const updateRepairData = (val) => {
    setRepairData({ ...val });
  };
  let statusfilter = [];

  const {
    columns,
    rows,
    reRender,
    filter,
    resetFilter,
    repairs,
    setsearchTerm,
    searchterm,
    myFilters,
    setmyFilters,
    doFilter,
  } = authorsTableData(globalFunc, statusfilter, tableState, setTableState);

  useEffect(() => {
    let statusfilter = [];
    if (repairstatus) {
      if (repairstatus.indexOf("|") > -1) {
        const statusParts = repairstatus.split("|");
        statusfilter = statusParts.map((s) => parseInt(s));
      } else {
        statusfilter = [parseInt(repairstatus)];
      }
    } else {
      statusfilter = [0, 1, 2, 3, 4, 5, 11, 997];
    }
    setmyFilters((s) => ({ ...s, status: statusfilter }));
    doFilter();
  }, []);

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
      RepairRerender(doFilter);
      setNewRepair(false);
      setRepairStep(0);
    }
  };

  const showNewRepair = async () => {
    setNewRepair(true);
    setRepairStep(0);
  };

  console.log("Repair table rendered");
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
                        showNewRepair();
                      }}
                    >
                      New Repair
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
                  <Grid item xs={1} alignItems="center" textAlign="right">
                    <Tooltip title="Refresh list">
                      <IconButton
                        size="large"
                        disableRipple
                        color="red"
                        onClick={() => {
                          RepairRerender(doFilter);
                        }}
                      >
                        <Icon sx={iconsStyle}>refresh</Icon>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Filter">
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
                    </Tooltip>
                  </Grid>
                </Grid>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  entriesPerPage={tableState.pageSize}
                  //table={{ columns, rows }}
                  columns={columns}
                  data={rows}
                  showTotalEntries={true}
                  noEndBorder
                  pagination
                  defaultSortFieldId={5}
                  expandableRows={true}
                  expandableRowsComponent={(data) => (
                    <ExpandedComponent data={data} reRender={() => RepairRerender(doFilter)} />
                  )}
                  paginationPerPage={tableState.pageSize}
                  paginationDefaultPage={tableState.page + 1}
                  onChangePage={(page) => setTableState((s) => ({ ...s, page: page - 1 }))}
                  onChangeRowsPerPage={(newSize) =>
                    setTableState((s) => ({ ...s, pageSize: newSize }))
                  }
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
              reRender={() => RepairRerender(doFilter)}
              setNewRepair={setNewRepair}
            ></Step4>
          )}
          <MDButton
            sx={{ marginTop: "2px" }}
            fullWidth
            color="secondary"
            onClick={() => {
              setNewRepair(false);
              RepairRerender(doFilter);
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
        setmyFilters={setmyFilters}
        myFilters={myFilters}
        repairs={repairs}
      />
    </DashboardLayout>
  );
};

export default Repairs;
