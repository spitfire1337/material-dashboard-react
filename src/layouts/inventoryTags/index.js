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
//Global
import { globalFuncs } from "../../context/global";

// Vars
import vars from "../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Modal, Select } from "@mui/material";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
const filter = createFilterOptions();

// Data
import authorsTableData from "layouts/tables/data/eTagsData";

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

// eslint-disable-next-line react/prop-types
const ETags = ({ globalFunc }) => {
  const { setShowLoad } = globalFuncs();
  const classes = useStyles();
  const [parts, setParts] = useState([]);
  const [allparts, setAllParts] = useState();
  const [searchedpart, setSearchedpart] = useState();
  const [screenSize, setscreenSize] = useState("");
  const [colorProfile, setColorProfile] = useState("");
  const [customDataEnabled, setUseCustomData] = useState(false);
  const [customDataFields, setCustomDataFields] = useState({
    title: "",
    description: "",
    price: "",
    sku: "",
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
                ? `- $${(variant.itemVariationData.priceMoney.amount / 100).toFixed(2)}`
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
    showModal,
    setshowModal,
    updated,
    setsquareItem,
    showPartsModal,
    setShowPartsModal,
    showResModal,
    setShowResModal,
    UpdateSquareItem,
    UpdateResolution,
    setShowColorModal,
    UpdateColor,
    showColorModal,
    setCustomData,
    customData,
    itemid,
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

  useEffect(() => {
    console.log("itemid changed", customData.squareId);
    if (customData.squareId == "custom") {
      setUseCustomData(true);
      setCustomDataFields(customData);
    } else {
      setSearchedpart(parts.find((part) => part.id == customData.squareId));
      setUseCustomData(false);
    }
  }, [customData]);

  useEffect(() => {
    console.log("customDataEnabled changed", customDataEnabled);
  }, []);
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
            <Grid container spacing={1} mb={1}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Checkbox
                        label="Use Custom Data"
                        checked={customDataEnabled}
                        defaultChecked={false}
                        onChange={(e) => {
                          setUseCustomData(e.target.checked);
                          setSearchedpart(null);
                          choosePart(null);
                        }}
                      />
                    }
                    label="Use Custom Data"
                  />
                </FormControl>
              </Grid>
              {!customDataEnabled ? (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Autocomplete
                      pb={1}
                      value={searchedpart}
                      disabled={customDataEnabled}
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
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        className={classes.input}
                        label="Title"
                        fullWidth
                        disabled={!customDataEnabled}
                        value={customDataFields.title}
                        onChange={(e) =>
                          setCustomDataFields({ ...customDataFields, title: e.target.value })
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        className={classes.input}
                        label="Description"
                        fullWidth
                        value={customDataFields.description}
                        onChange={(e) =>
                          setCustomDataFields({ ...customDataFields, description: e.target.value })
                        }
                        disabled={!customDataEnabled}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        className={classes.input}
                        label="Price"
                        fullWidth
                        disabled={!customDataEnabled}
                        value={customDataFields.price}
                        onChange={(e) =>
                          setCustomDataFields({ ...customDataFields, price: e.target.value })
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <TextField
                        className={classes.input}
                        label="SKU"
                        fullWidth
                        disabled={!customDataEnabled}
                        value={customDataFields.sku}
                        onChange={(e) =>
                          setCustomDataFields({ ...customDataFields, sku: e.target.value })
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </MDTypography>
          <MDButton color="error" onClick={() => setShowPartsModal(false)}>
            Cancel
          </MDButton>
          <MDButton
            color="success"
            onClick={() => {
              if (customDataEnabled) {
                setCustomData(customDataFields);
              } else {
                UpdateSquareItem();
              }
            }}
            autoFocus
          >
            Save
          </MDButton>
        </MDBox>
      </Modal>
      <Dialog open={showResModal}>
        <DialogTitle>Set Screen Size</DialogTitle>
        <DialogContent sx={{ paddingTop: "2px" }}>
          <FormControl fullWidth sx={{ paddingTop: "5px" }}>
            <Grid container spacing={1} mb={1}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Size</InputLabel>
                  <Select
                    fullWidth
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={screenSize}
                    label="Size"
                    onChange={(e) => setscreenSize(e.target.value)}
                  >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value={2.9}>2.9</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <MDButton color="error" onClick={() => setShowResModal(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={() => UpdateResolution(screenSize)} autoFocus>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
      <Dialog open={showColorModal}>
        <DialogTitle>Set Color Profile</DialogTitle>
        <DialogContent sx={{ paddingTop: "2px" }}>
          <FormControl fullWidth sx={{ paddingTop: "5px" }}>
            <Grid container spacing={1} mb={1}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Color Profile</InputLabel>
                  <Select
                    fullWidth
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={colorProfile}
                    label="Color Profile"
                    onChange={(e) => setColorProfile(e.target.value)}
                  >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="BW">Black/White</MenuItem>
                    <MenuItem value="BWR">Black/White/Red</MenuItem>
                    <MenuItem value="BWY">Black/White/Yellow</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <MDButton color="error" onClick={() => setShowColorModal(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={() => UpdateColor(colorProfile)} autoFocus>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
};

export default ETags;
