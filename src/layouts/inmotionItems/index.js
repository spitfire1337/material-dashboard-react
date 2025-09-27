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
import moment from "moment";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
const filter = createFilterOptions();

// Data
import authorsTableData from "layouts/tables/data/inMotionData";

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
const InmotionItems = ({ globalFunc }) => {
  const classes = useStyles();
  const [updateLoc, setUpdateLoc] = useState(false);
  const [updateItem, setUpdateItem] = useState();
  const [currentLoc, setCurrentLoc] = useState("");
  const { setShowLoad, LoadBox } = Loading();
  const [parts, setParts] = useState([]);
  const [allparts, setAllParts] = useState();
  const [partDetails, setPartDetails] = useState({ cost: 0, name: "", qty: 0 });
  const [part, setPart] = useState();
  const [searchedpart, setSearchedpart] = useState();
  const [PartDetail, setPartDetail] = useState();

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

  const getParts = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/getParts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const json = await response.json();
    if (json.res == 200) {
      let itemList = [];
      setAllParts(json.data);
      json.data.map((item) => {
        item.itemData.variations.map((variant) => {
          itemList.push({
            label: `${item.itemData.name} - ${variant.itemVariationData.name} ${
              variant.itemVariationData != undefined &&
              variant.itemVariationData.priceMoney != undefined
                ? `- $${(Number(variant.itemVariationData.priceMoney.amount) / 100).toFixed(2)}`
                : ""
            }`,
            id: variant.id,
          });
        });
      });
      setParts(itemList);
      setShowLoad(false);
      setShowPartsModal(true);
    }
  };

  const {
    columns,
    rows,
    reRender,
    setsearchTerm,
    searchterm,
    itemid,
    showModal,
    setshowModal,
    stock,
    setCurrentStock,
    UpdateStock,
    updated,
    setsquareItem,
    showPartsModal,
    setShowPartsModal,
    UpdateSquareItem,
  } = authorsTableData(globalFunc, setShowLoad, getParts);

  const choosePart = (value) => {
    if (value == undefined || value == null || value == "") {
      return null;
    }
    if (value.id == 0) {
      return null;
    }
    setsquareItem(value.id);
  };
  useEffect(() => {
    if (showPartsModal) {
      getParts();
    }
  }, [showPartsModal]);

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
                <Grid container spacing={1}>
                  <Grid item xs={12} md={7}>
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
                  <Grid item xs={12} md={5}>
                    <MDTypography>
                      Last updated: {moment(updated).format("MM/DD/YYYY, h:mm:ss a")}
                    </MDTypography>
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
      <Dialog open={showModal}>
        <DialogTitle>Update stock</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <TextField
              label="In store stock"
              fullWidth
              value={stock}
              type="number"
              variant="outlined"
              onChange={(e) => {
                setCurrentStock(e.target.value);
              }}
            />{" "}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <MDButton color="error" onClick={() => setshowModal(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={() => UpdateStock(stock)} autoFocus>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
      <Modal
        open={showPartsModal}
        onClose={() => null}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          <MDTypography id="modal-modal-title" variant="h6" component="h2">
            Add Parts
          </MDTypography>
          <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <Autocomplete
                pb={1}
                value={searchedpart}
                onChange={(event, newValue) => {
                  setSearchedpart(newValue);
                  if (newValue == null) {
                    return null;
                  } else {
                    choosePart(newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  return filtered;
                }}
                disablePortal
                options={parts}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Part" />}
              />
            </FormControl>
          </MDTypography>
          <MDButton color="error" onClick={() => setShowPartsModal(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={() => UpdateSquareItem()} autoFocus>
            Save
          </MDButton>
        </MDBox>
      </Modal>

      <LoadBox />
      <Footer />
    </DashboardLayout>
  );
};

export default InmotionItems;
