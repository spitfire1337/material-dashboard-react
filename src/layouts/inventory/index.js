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
import Loading from "../../components/Loading_Dialog";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import authorsTableData from "layouts/tables/data/inventoryData";

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
const InventoryAdmin = ({ globalFunc }) => {
  const classes = useStyles();
  const [updateLoc, setUpdateLoc] = useState(false);
  const [updateItem, setUpdateItem] = useState();
  const [currentLoc, setCurrentLoc] = useState("");
  const { setShowLoad, LoadBox } = Loading();

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

  const updateLocation = (item) => {
    console.log("Item data: ", item);
    setUpdateLoc(true);
    setUpdateItem(item._id);
    setCurrentLoc(item.storage_loc || "");
  };

  const { columns, rows, reRender, setsearchTerm, searchterm } = authorsTableData(
    globalFunc,
    updateLocation,
    setShowLoad
  );

  const saveLoc = async () => {
    setUpdateLoc(false);
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/square/updateInventoryLoc`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: updateItem,
        location: currentLoc,
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Location updated");
      globalFunc.setSuccessSB(true);
      reRender();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
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
      <Dialog open={updateLoc}>
        <DialogTitle>Enter storage location</DialogTitle>
        <DialogContent>
          <TextField
            value={currentLoc}
            label="Location"
            onChange={(e) => {
              setCurrentLoc(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setUpdateLoc(false)}>Cancel</MDButton>
          <MDButton onClick={() => saveLoc()} autoFocus>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
      <LoadBox />
      <Footer />
    </DashboardLayout>
  );
};

export default InventoryAdmin;
