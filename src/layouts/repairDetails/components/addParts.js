import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { Grid } from "@mui/material";
import vars from "../../../config";
import { useState, React, useEffect, useMemo } from "react";
import MDTypography from "components/MDTypography";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  Checkbox,
  TextField,
  Divider,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
const filter = createFilterOptions();
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};
const PartsAdd = ({
  globalFunc,
  showPartsModal,
  setshowPartsModal,
  toggleloadingOpen,
  createInvoice,
  dialogOpen,
  toggleDialogOpen,
  repairID,
  getRepair,
  status,
}) => {
  const [newRepairPart, setnewRepairPart] = useState(false);
  const [parts, setParts] = useState([]);
  const [allparts, setAllParts] = useState();
  const [partDetails, setPartDetails] = useState({ cost: 0, name: "", qty: 0 });
  const [part, setPart] = useState();
  const [searchedpart, setSearchedpart] = useState();
  const [partCost, setPartCost] = useState((0).toFixed(2));
  const [partName, setPartName] = useState();
  const [PartDetail, setPartDetail] = useState();

  const dialogHandleClose = () => {
    // setPartCost(0);
    // setPartQuantity(1);
    setPartDetails({
      qty: 1,
      cost: 0,
      name: "",
    });
    toggleDialogOpen(false);
  };

  const choosePart = (value) => {
    if (value == undefined || value == null || value == "") {
      return null;
    }
    if (value.id == 0) {
      //New item
      setPartName(value.inputValue);
      setPartCost((0).toFixed(2));
      setPartDetail(true);
    } else {
      let selectedpart = allparts.filter((x) =>
        x.itemData.variations.filter((y) => y.id == value.id)
      );
      const filteredArray = allparts.filter((part) => {
        // Use Array.prototype.some() to check if any rating has the desired category
        return part.itemData.variations.some((item) => {
          return item.id === value.id;
        });
      })[0];
      let variant = filteredArray.itemData.variations.filter((x) => x.id == value.id);
      let cost =
        variant[0].itemVariationData.priceMoney != undefined
          ? variant[0].itemVariationData.priceMoney
          : 0;
      setPartDetails({
        ...partDetails,
        qty: 1,
        cost:
          variant[0].itemVariationData.priceMoney != undefined
            ? (variant[0].itemVariationData.priceMoney.amount / 100).toFixed(2)
            : (0).toFixed(2),
        name: filteredArray.itemData.name + " - " + variant[0].itemVariationData.name,
      });
      setPart(value.id);
      setPartDetail(true);
    }
  };

  const getParts = async () => {
    toggleloadingOpen(true);
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
            label: `${variant.itemVariationData.sku} | ${item.itemData.name} - ${
              variant.itemVariationData.name
            } ${
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
      setPartDetails({
        qty: 1,
        cost: 0,
        name: "",
      });
      setPartDetail(false);
      setnewRepairPart(true);
      toggleloadingOpen(false);
    }
  };

  const addParts = async () => {
    toggleloadingOpen(true);
    const response = await fetch(`${vars.serverUrl}/repairs/addParts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        status: status,
        parts: {
          quantity: partDetails.qty,
          name: partDetails.name,
          basePriceMoney: {
            amount: Math.round(partDetails.cost * 100),
          },
          catalogObjectId: part,
        },
      }),
    });
    const json = await response.json();
    toggleloadingOpen(false);
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Part added to repair");
      globalFunc.setSuccessSB(true);
      getRepair();
      if (status == 4) {
        createInvoice();
      }
      setnewRepairPart(false);
      setSearchedpart();
      setPartDetails({ cost: 0, name: "", qty: 0 });
      setPartCost((0).toFixed(2));
      setPartName();
      setshowPartsModal(false);
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  useEffect(() => {
    if (showPartsModal) {
      getParts();
    }
  }, [showPartsModal]);

  return (
    <>
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
                  } else if (newValue && newValue.inputValue) {
                    toggleDialogOpen(true);
                    // setPartCost(0);
                    // setPartQuantity(1);
                    // setPartName(newValue.inputValue);
                    setPartDetails({
                      qty: 1,
                      cost: 0,
                      name: newValue.inputValue,
                    });
                  } else {
                    choosePart(newValue);
                  }
                }}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  if (params.inputValue !== "") {
                    filtered.unshift({
                      inputValue: params.inputValue,
                      label: `Add "${params.inputValue}"`,
                      id: 0,
                    });
                  }
                  return filtered;
                }}
                disablePortal
                options={parts}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Part" />}
              />
              {PartDetail ? (
                <Grid container spacing={1} pt={1} pb={1}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={partDetails.qty}
                      onChange={(e, val) => {
                        setPartDetails({
                          ...partDetails,
                          qty: event.target.value,
                        });
                      }}
                      type="number"
                    ></TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cost"
                      value={partDetails.cost}
                      onChange={(e, val) => {
                        setPartDetails({
                          ...partDetails,
                          cost: event.target.value,
                        });
                      }}
                      type="number"
                    ></TextField>
                  </Grid>
                </Grid>
              ) : (
                ""
              )}
            </FormControl>
          </MDTypography>
          <MDButton
            sx={{ marginTop: "2px" }}
            fullWidth
            color="success"
            onClick={() => {
              addParts();
            }}
          >
            Save
          </MDButton>
          <MDButton
            sx={{ marginTop: "2px" }}
            fullWidth
            color="secondary"
            onClick={() => {
              setshowPartsModal(false);
            }}
          >
            Cancel
          </MDButton>
        </MDBox>
      </Modal>
      <Dialog open={dialogOpen} onClose={dialogHandleClose}>
        <form onSubmit={addParts}>
          <DialogTitle>Add a new item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Item not listed? Add it here for single use. To store item in inventory, add item
              through square.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              value={partDetails.name}
              onChange={(event) => {
                //setPartName(event.target.value)
                setPartDetails({
                  ...partDetails,
                  name: event.target.value,
                });
              }}
              label="Name"
              type="text"
              variant="standard"
            />
            <TextField
              margin="dense"
              id="name"
              value={partDetails.qty}
              onChange={(event) => {
                setPartDetails({
                  ...partDetails,
                  qty: event.target.value,
                });
                //setPartQuantity(event.target.value)
              }}
              label="Qty"
              type="number"
              variant="standard"
            />
            <TextField
              margin="dense"
              id="name"
              value={partDetails.cost}
              onChange={(event) => {
                //setPartCost(event.target.value)
                setPartDetails({
                  ...partDetails,
                  cost: event.target.value,
                });
              }}
              label="Cost"
              type="number"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <MDButton onClick={dialogHandleClose}>Cancel</MDButton>
            <MDButton type="submit">Add</MDButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default PartsAdd;
