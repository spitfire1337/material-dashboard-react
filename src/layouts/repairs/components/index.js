import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTableState } from "../../context/tableState";

//Material UI
import { Grid, Card, TextField, Tooltip, Modal, IconButton, Icon } from "@mui/material";
import { makeStyles } from "@mui/styles";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

//External Components
import DataTable from "react-data-table-component";
import ExpandedComponent from "./components/expand";

//Data
import repairsTableData from "./data/repairsDataTable";

const useStyles = makeStyles((theme) => ({
  input: {
    background: "rgb(232, 241, 250)",
  },
}));

const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;
    return colorValue;
  },
});
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
const Repairs = () => {
  const classes = useStyles();
  const [state, setState] = useState();
  //const { tableState, setTableState, RepairRerender } = useTableState();
  const { repairstatus } = useParams();
  const { columns, rows, setsearchTerm, searchterm, setmyFilters, doFilter } = repairsTableData();
  const { tableState, setTableState, RepairRerender } = useTableState();
  const [newRepair, setNewRepair] = useState(false);

  const doFilterRef = useRef(doFilter);
  useEffect(() => {
    doFilterRef.current = doFilter;
  }, [doFilter]);

  const RepairRerenderRef = useRef(RepairRerender);
  useEffect(() => {
    RepairRerenderRef.current = RepairRerender;
  }, [RepairRerender]);

  const ExpandedRow = useMemo(() => {
    return ({ data }) => (
      <ExpandedComponent
        data={data}
        reRender={() => RepairRerenderRef.current(doFilterRef.current)}
      />
    );
  }, []);

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
    setTableState((s) => ({ ...s, filters: { status: statusfilter } }));
    doFilter();
  }, [repairstatus]);
  console.log("Repair table rendered");
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
                  <Grid item xs={12} md={4} alignItems="center">
                    <MDButton
                      variant="contained"
                      color="success"
                      onClick={() => {
                        showNewRepair();
                      }}
                    >
                      New Repair Layout
                    </MDButton>
                  </Grid>
                  <Grid item xs={11} md={7}>
                    <TextField
                      label="Search"
                      InputProps={{ className: classes.input }}
                      fullWidth
                      value={searchterm}
                      onChange={(e) => {
                        setTableState((s) => ({ ...s, searchterm: e.target.value }));
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
                  expandableRowsComponent={ExpandedRow}
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
          {/* {repairStep == 0 ? (
            <Step1 nextRepairStep={nextRepairStep}></Step1>
          ) : repairStep == 2 ? (
            <Step2
              nextRepairStep={nextRepairStep}
              repairData={repairData}
              updateRepairData={updateRepairData}
              setrepairID={setrepairID}
            ></Step2>
          ) : repairStep == 3 ? (
            <Step3 repairID={repairID} nextRepairStep={nextRepairStep}></Step3>
          ) : (
            <Step4
              repairID={repairID}
              nextRepairStep={nextRepairStep}
              reRender={() => RepairRerender(doFilter)}
              setNewRepair={setNewRepair}
            ></Step4>
          )} */}
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
      {/* <FilterDialog
        filter={filter}
        showFilter={showFilter}
        resetFilter={resetFilter}
        setShowFiler={setShowFiler}
        setmyFilters={setmyFilters}
        myFilters={myFilters}
        repairs={repairs}
      /> */}
    </DashboardLayout>
  );
};

export default Repairs;
