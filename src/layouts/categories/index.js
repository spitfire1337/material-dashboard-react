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
import { useLoginState } from "context/loginContext";
// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Modal } from "@mui/material";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import categoryTableData from "./data/categoriesData";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
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
const filter = createFilterOptions();
const useStyles = makeStyles((theme) => ({
  input: {
    background: "rgb(232, 241, 250)",
  },
}));

// eslint-disable-next-line react/prop-types
const CategoryAdmin = () => {
  const { setLoggedIn } = useLoginState();
  const classes = useStyles();
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [updateLoc, setUpdateLoc] = useState(false);
  const [updateItem, setUpdateItem] = useState();
  const [currentSku, setCurrentSku] = useState("");
  const [newCategory, setNewCategory] = useState(false);
  const [catList, setCatList] = useState([]);
  const [newCategoryData, setNewCategoryData] = useState({
    categoryType: "REGULAR_CATEGORY",
    onlineVisibility: true,
    name: "",
  });
  const [newCategorySku, setNewCategorySku] = useState(undefined);

  const updateLocation = (item) => {
    setUpdateLoc(true);
    setUpdateItem(item._id);
    setCurrentSku(item.categoryData.sku || "");
  };

  const { columns, rows, reRender, setsearchTerm, searchterm } = categoryTableData(
    updateLocation,
    setShowLoad
  );

  const fetchCategories = async () => {
    const response = await fetch(`${vars.serverUrl}/api/categories`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        let cats = [{ label: "None", id: 0 }];
        res.data.map((item) => {
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
        setCatList(cats);
        setNewCategory(true);
      } else if (res.res === 401) {
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Unauthorized",
          message: "Redirecting to login",
          show: true,
          icon: "error",
        });
      }
    } else if (response.status == 401) {
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Unauthorized",
        message: "Redirecting to login",
        show: true,
        icon: "error",
      });
    }
  };

  const submitCategory = async () => {
    try {
      setNewCategory(false);
      const response = await fetch(`${vars.serverUrl}/square/createCategory`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryData: newCategoryData, sku: newCategorySku }),
        credentials: "include",
      });
      const json = await response.json();
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        reRender();
        setNewCategoryData({
          categoryType: "REGULAR_CATEGORY",
          onlineVisibility: true,
          name: "",
        });
        setSnackBar({
          type: "success",
          title: "Category created",
          message: "Category created successfully",
          show: true,
          icon: "check",
        });
      } else {
        setSnackBar({
          type: "error",
          title: "Error occurred",
          message: "Error occurred creating category.",
          show: true,
          icon: "error",
        });
      }
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error occurred",
        message: "Error occurred creating category.",
        show: true,
        icon: "error",
      });
    }
  };
  const showNewCategory = async () => {
    fetchCategories();
  };

  const saveLoc = async () => {
    setUpdateLoc(false);
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/api/updateCategorySKUcode`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: updateItem,
        sku: currentSku,
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "SKU Code updated",
        message: "SKU Code updated successfully",
        show: true,
        icon: "check",
      });
      reRender();
    } else {
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: json.message,
        show: true,
        icon: "error",
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
                        showNewCategory();
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
        <DialogTitle>Enter Sku Code</DialogTitle>
        <DialogContent>
          <TextField
            value={currentSku}
            label="SKU Code"
            type="number"
            focused
            autoFocus="true"
            onChange={(e) => {
              setCurrentSku(e.target.value);
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
      <Modal
        open={newCategory}
        onClose={() => null}
        // onClose={() => {
        //   setNewRepair(false);
        // }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
              <FormControl fullWidth>
                <TextField
                  label="Category Name"
                  value={newCategoryData.name || ""}
                  onChange={(e) => {
                    let catdata = { ...newCategoryData };
                    catdata.name = e.currentTarget.value;
                    setNewCategoryData(catdata);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <TextField
                  label="Sku Code"
                  type="number"
                  value={newCategorySku || ""}
                  onChange={(e) => setNewCategorySku(e.currentTarget.value)}
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
                  setNewCategory(false);
                  setNewCategoryData({
                    categoryType: "REGULAR_CATEGORY",
                    onlineVisibility: true,
                    name: "",
                  });
                  reRender();
                }}
              >
                Cancel
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>
      </Modal>
      <Footer />
    </DashboardLayout>
  );
};

export default CategoryAdmin;
