//React
import { useState, React, useEffect, forwardRef } from "react";

// Vars
import vars from "../../../config";

//Material UI components
import {
  FormControl,
  FormGroup,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  Icon,
  Grid,
  TextField,
  Modal,
  Tooltip,
} from "@mui/material";
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDButton from "../../../components/MDButton";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { NumericFormat } from "react-number-format";
import { PatternFormat } from "react-number-format";
const itemstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "98%",
  minHeight: "95vh",
  maxHeight: "98vh",
  overflowY: "scroll",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

const borderStyle = {
  bgcolor: "background.paper",
  border: "1px solid #989898ff",
  p: 4,
  borderRadius: "7px",
};

const filter = createFilterOptions();
const NewItem = ({ globalFunc, showNewItem, setShowNewItem, setShowLoad }) => {
  const [catList, setCatList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [catSku, setCatSku] = useState(null);

  const [nextSku, setNextSku] = useState(null);

  const [newItemData, setNewItemData] = useState({
    type: "ITEM",
    itemData: {
      name: "",
      descriptionHtml: "",
      variations: [
        {
          itemVariationData: {
            name: "",
            priceMoney: {
              amount: "",
              currency: "USD",
            },
            pricingType: "FIXED_PRICING",
            sku: "",
            stockable: true,
            sellable: true,
            trackInventory: true,
          },
        },
      ],
    },
    presentAtAllLocations: true,
    id: "123",
  });
  const [showNewitemModal, setShowNewitemModal] = useState(false);
  const VariationTemplate = () => {
    return (
      <Grid item xs={12} sx={{ marginTop: "15px" }}>
        <MDBox>Test</MDBox>
      </Grid>
    );
  };
  useEffect(() => {
    if (showNewItem) {
      fetchCategories(globalFunc);
    }
  }, [showNewItem]);
  const fetchCategories = async (globalFunc) => {
    const response = await fetch(`${vars.serverUrl}/api/newItemInfo`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        let cats = [];
        console.log("Categories for new item:", res.categories);
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
            sku: item.categoryData.pathToRoot
              .map((cat) => {
                return res.categories.find((cats) => cats.id == cat.categoryId)
                  ? res.categories.find((cats) => cats.id == cat.categoryId).categoryData?.sku
                  : "";
              })
              .reverse()
              .join("")
              .toString()
              .concat(item.categoryData.sku),
          });
        });
        setLocations(res.locations);
        setAvailableLocations(res.locations);
        setCatList(cats);
        setShowNewitemModal(true);
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
  let variationEl = [VariationTemplate()];
  const addVarination = () => {
    console.log("add variation");
    variationEl.push(VariationTemplate());
  };

  const NumericFormatCustom = forwardRef(function NumericFormatCustom(props, ref) {
    const { onChange, startAdornment, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value * 100,
            },
          });
        }}
        fixedDecimalScale
        thousandSeparator
        decimalScale={2}
      />
    );
  });

  const GenerateSku = async (index) => {
    if (catSku == null) {
      globalFunc.setErrorSBText("Please select a category");
      globalFunc.setErrorSB(true);
      return;
    } else if (nextSku != null) {
      setNextSku(nextSku + 1);
      let updatedFields = { ...newItemData };
      updatedFields["itemData"]["variations"][index]["itemVariationData"]["sku"] =
        Number(nextSku) + 1;
      setNewItemData(updatedFields);
    } else {
      if (catSku.length < 4) {
        setCatSku(catSku & "99");
      }
      const response = await fetch(`${vars.serverUrl}/square/getNextSku`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sku: catSku }),
        credentials: "include",
      });
      const json = await response.json();
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        setNextSku(Number(json.data) + 1);
        let updatedFields = { ...newItemData };
        updatedFields["itemData"]["variations"][index]["itemVariationData"]["sku"] =
          Number(json.data) + 1;
        setNewItemData(updatedFields);
        console.log("Next Sku:", json.data);
      } else {
        globalFunc.setErrorSBText("Error generating SKU");
        globalFunc.setErrorSB(true);
      }
    }
  };

  const handleChange = (index, event, pricing = false, root = false) => {
    let updatedFields = { ...newItemData };
    if (root) {
      updatedFields["itemData"][event.target.name] = event.target.value;
    } else if (pricing) {
      updatedFields["itemData"]["variations"][index]["itemVariationData"]["priceMoney"]["amount"] =
        event.target.value;
    } else {
      updatedFields["itemData"]["variations"][index]["itemVariationData"][event.target.name] =
        event.target.value;
    }
    setNewItemData(updatedFields);
    console.log(newItemData);
  };

  const addField = () => {
    let fields = { ...newItemData };
    fields.itemData.variations.push({
      itemVariationData: {
        name: "",
        priceMoney: {
          amount: "",
          currency: "USD",
        },
        pricingType: "FIXED_PRICING",
        sku: "",
        stockable: true,
        sellable: true,
        trackInventory: true,
      },
    });
    setNewItemData(fields);
  };

  const removeField = (index) => {
    let fields = { ...newItemData };
    const updatedFields = newItemData.itemData.variations.filter((_, i) => i !== index);
    newItemData.itemData.variations = updatedFields;
    setNewItemData(fields);
    console.log(fields);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(updatedFields);
  };
  return (
    <Modal
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
          {/* Left side */}

          <Grid item xs={12} md={8}>
            <MDBox sx={{ border: "1px solid #989898ff", borderRadius: "10px", p: 4 }}>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                <MDTypography variant="h6" gutterBottom>
                  Details
                </MDTypography>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                <FormControl fullWidth>
                  <TextField
                    label="Name (Required)"
                    name="name"
                    value={newItemData.itemData.name}
                    onChange={(e) => handleChange(0, e, false, true)}
                    sx={{ border: "1px solid #989898ff", borderRadius: "10px" }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                <FormControl fullWidth>
                  <TextField
                    label="Description"
                    rows="5"
                    multiline
                    name="descriptionHtml"
                    value={newItemData.itemData.descriptionHtml}
                    onChange={(e) => handleChange(0, e, false, true)}
                    sx={{ border: "1px solid #989898ff", borderRadius: "10px" }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ marginTop: "15px" }}>
                {/* TODO: Add spot for uploaded photos and high upload form */}
                <MDBox sx={borderStyle}>
                  <MDBox sx={{ width: "100%", textAlign: "center", cursor: "pointer", m: 0, p: 0 }}>
                    <Icon
                      sx={{
                        border: "1px solid #989898ff",
                        borderRadius: "10px",
                        pl: 1,
                        pt: 1,
                        pr: 3.5,
                        pb: 3.5,
                        m: 0,
                      }}
                    >
                      add_a_photo
                    </Icon>
                    <MDTypography variant="h6" gutterBottom></MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            </MDBox>
            {/* Variations */}
            <Grid item xs={12} sx={{ marginTop: "15px" }}>
              <MDBox sx={{ border: "1px solid #989898ff", borderRadius: "10px", p: 4 }}>
                <Grid container justifyContent="space-between">
                  <Grid item xs={8} md={10}>
                    <MDTypography variant="h6" gutterBottom>
                      Variations
                    </MDTypography>
                  </Grid>
                  <Grid item xs={4} md={2} sx={{ textAlign: "right" }}>
                    <MDButton color="info" onClick={() => addField()}>
                      Add Variation
                    </MDButton>
                  </Grid>
                </Grid>
                {newItemData.itemData.variations.map((field, index) => (
                  <Grid
                    container
                    spacing={2}
                    key={index}
                    sx={{
                      paddingTop: "15px",
                      paddingBottom: "15px",
                      paddingRight: "15px",
                      marginTop: "15px",
                      border: "1px solid #cdcbcbff",
                      borderRadius: "10px",
                    }}
                  >
                    <Grid item xs={12} md={3} sx={{ margin: "0px" }}>
                      <FormControl fullWidth>
                        <TextField
                          name="name"
                          label="Name"
                          value={field.itemVariationData.name}
                          onChange={(e) => handleChange(index, e)}
                          sx={{ border: "1px solid #989898ff", borderRadius: "10px" }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <TextField
                          label="Price (Required)"
                          type="number"
                          value={field.itemVariationData.priceMoney.amount}
                          onChange={(e) => handleChange(index, e, true)}
                          sx={{ border: "1px solid #989898ff", borderRadius: "10px" }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <TextField
                          name="sku"
                          label="SKU"
                          value={field.itemVariationData.sku}
                          onChange={(e) => handleChange(index, e, true)}
                          sx={{ border: "1px solid #989898ff", borderRadius: "10px" }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Tooltip title="Generate SKU">
                        <MDButton type="button" color="success" onClick={() => GenerateSku(index)}>
                          <Icon>autorenew</Icon>
                        </MDButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      {index != 0 ? (
                        <Tooltip title="Remove variation">
                          <MDButton type="button" color="error" onClick={() => removeField(index)}>
                            <Icon>delete</Icon>
                          </MDButton>
                        </Tooltip>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </MDBox>
            </Grid>
          </Grid>

          {/* Right side */}
          <Grid item xs={12} md={4}>
            {/* Category */}
            <Grid item xs={12} md={12} sx={{ marginBottom: "15px" }}>
              <MDBox sx={{ border: "1px solid #989898ff", borderRadius: "15px", p: 4 }}>
                <MDTypography variant="h6">Category</MDTypography>
                <MDTypography variant="caption" color="text">
                  For online ordering, POS, and sales reporting.
                </MDTypography>
                <FormControl fullWidth>
                  <Autocomplete
                    onChange={(event, newValue) => {
                      if (newValue.id !== 0) {
                        //let catdata = { ...newCategoryData };
                        //catdata.parentCategory = { id: newValue.id };
                        //setNewCategoryData(catdata);
                        setNextSku(null);
                        setCatSku(newValue.sku);
                        console.log("Selected category sku:", newValue.sku);
                      } else {
                        //let catdata = { ...newCategoryData };
                        //delete catdata.parentCategory;
                        //setNewCategoryData(catdata);
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
              </MDBox>
            </Grid>
            {/* Locations */}
            <Grid item xs={12} md={12} sx={{ marginBottom: "15px" }}>
              <MDBox sx={{ border: "1px solid #989898ff", borderRadius: "15px", p: 4 }}>
                <MDTypography variant="h6">Locations</MDTypography>
                <MDTypography variant="caption" color="text">
                  Locations where item is available
                </MDTypography>
                <FormGroup>
                  <FormControl fullWidth>
                    {locations.map((location) => {
                      return (
                        <FormControlLabel
                          key={location.id}
                          control={
                            <Switch
                              checked={availableLocations.find((e) => e.id == location.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  let newLocs = [...availableLocations];
                                  newLocs.push(location);
                                  setAvailableLocations(newLocs);
                                } else {
                                  let newLocs = availableLocations.filter(
                                    (loc) => loc.id != location.id
                                  );
                                  setAvailableLocations(newLocs);
                                }
                              }}
                            />
                          }
                          label={location.name}
                        />
                      );
                    })}
                  </FormControl>
                </FormGroup>
              </MDBox>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              sx={{ marginTop: "2px" }}
              fullWidth
              color="success"
              onClick={() => {
                //submitCategory();
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
                setShowNewitemModal(false);
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
    </Modal>
  );
};
export default NewItem;
