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
import authorsTableData from "layouts/tables/data/categories";
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
  const [currentSku, setCurrentSku] = useState("");
  const { setShowLoad, LoadBox } = Loading();
  const [newCategory, setNewCategory] = useState(false);
  const [catList, setCatList] = useState([]);
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
    setUpdateLoc(true);
    setUpdateItem(item._id);
    setCurrentSku(item.categoryData.sku || "");
  };

  const { columns, rows, reRender, setsearchTerm, searchterm } = authorsTableData(
    globalFunc,
    updateLocation,
    setShowLoad
  );

  const fetchCategories = async (globalFunc) => {
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
        globalFunc.setLoggedIn(false);
        globalFunc.setErrorSBText("Unauthorized, redirecting to login");
        globalFunc.setErrorSB(true);
      }
    } else if (response.status == 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    }
  };

  const showNewCategory = async () => {
    fetchCategories(globalFunc);
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
      globalFunc.setSuccessSBText("SKU Code updated");
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Autocomplete
                  onChange={(event, newValue) => {
                    //chooseCustomer(newValue);
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
                <TextField label="Category Name" />
              </FormControl>
            </Grid>
          </Grid>
          <MDButton
            sx={{ marginTop: "2px" }}
            fullWidth
            color="secondary"
            onClick={() => {
              setNewCategory(false);
              reRender();
            }}
          >
            Cancel
          </MDButton>
        </MDBox>
      </Modal>
      <LoadBox />
      <Footer />
    </DashboardLayout>
  );
};

export default InventoryAdmin;
