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
//Global
import { globalFuncs } from "../../context/global";
import { useLoginState } from "../../context/loginContext";
// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import NewItem from "./components/newItem";
// Data
import inventoryTableData from "./data/inventoryData";

const useStyles = makeStyles((theme) => ({
  input: {
    background: "rgb(232, 241, 250)",
  },
}));

// eslint-disable-next-line react/prop-types
const InventoryAdmin = () => {
  const { setLoginState } = useLoginState();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const classes = useStyles();
  const [updateLoc, setUpdateLoc] = useState(false);
  const [updateItem, setUpdateItem] = useState();
  const [currentLoc, setCurrentLoc] = useState("");
  const [showNewItem, setShowNewItem] = useState(false);
  const [catList, setCatList] = useState([]);
  const [locations, setLocations] = useState([]);

  const fetchCategories = async () => {
    const response = await fetch(`${vars.serverUrl}/api/newItemInfo`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        let cats = [];
        res.categories.map((item) => {
          cats.push({
            label: `${
              item.categoryData.pathToRoot.length > 0
                ? `${item.categoryData.pathToRoot
                    .map((cat) => cat.categoryName)
                    .reverse()
                    .join(" -> ")} -> `
                : ""
            } ${item.categoryData.name}`,
            id: item.id,
          });
        });
        setLocations(res.locations);
        setCatList(cats);
        setShowNewItem(true);
      } else if (res.res === 401) {
        setLoginState(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "warning",
        });
      }
    } else if (response.status == 401) {
      setLoginState(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "warning",
      });
    }
  };
  const showNewItemModal = () => {
    fetchCategories();
  };

  const updateLocation = (item) => {
    setUpdateLoc(true);
    setUpdateItem(item._id);
    setCurrentLoc(item.storage_loc || "");
  };

  const { columns, rows, reRender, setsearchTerm, searchterm } = inventoryTableData(
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
      setSnackBar({
        type: "success",
        title: "Success",
        message: "Location updated",
        show: true,
        icon: "check",
      });
      reRender();
    } else {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error occured",
        show: true,
        icon: "warning",
      });
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
                  <Grid item xs={12} md={2} alignItems="center">
                    <MDButton
                      variant="contained"
                      color="success"
                      onClick={() => {
                        showNewItemModal();
                      }}
                    >
                      New Category
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
      <NewItem
        showNewItem={showNewItem}
        setShowNewItem={setShowNewItem}
        setShowLoad={setShowLoad}
      />
      {/* <Modal
        open={showNewItem}
        onClose={() => null}
        // onClose={() => {
        //   setNewRepair(false);
        // }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={itemstyle}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                <FormControl fullWidth>
                  <TextField label="Name (Required)" />
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                <FormControl fullWidth>
                  <TextField label="Price (Required)" type="number" />
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                <FormControl fullWidth>
                  <TextField label="Description" rows="5" />
                </FormControl>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4} sx={{ marginTop: "15px" }}>
              <MDTypography variant="h6">Category</MDTypography>
              <MDTypography variant="caption" color="text">
                For online ordering, POS, and sales reporting.
              </MDTypography>
              <FormControl fullWidth>
                <Autocomplete
                  onChange={(event, newValue) => {
                    if (newValue.id !== 0) {
                      let catdata = { ...newCategoryData };
                      catdata.parentCategory = { id: newValue.id };
                      setNewCategoryData(catdata);
                    } else {
                      let catdata = { ...newCategoryData };
                      delete catdata.parentCategory;
                      setNewCategoryData(catdata);
                    }
                  }}
                  disablePortal
                  options={catList}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    return filtered;
                  }}
                  fullWidth
                  renderInput={(params) => <TextField {...params} label="Parent category" />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDButton
                sx={{ marginTop: "2px" }}
                fullWidth
                color="success"
                onClick={() => {
                  submitCategory();
                }}
              >
                Submit
              </MDButton>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDButton
                sx={{ marginTop: "2px" }}
                fullWidth
                color="secondary"
                onClick={() => {
                  setShowNewItem(false);
                  // setNewCategoryData({
                  //   categoryType: "REGULAR_CATEGORY",
                  //   onlineVisibility: true,
                  //   name: "",
                  // });
                  // reRender();
                }}
              >
                Cancel
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Modal> */}
      <Footer />
    </DashboardLayout>
  );
};

export default InventoryAdmin;
