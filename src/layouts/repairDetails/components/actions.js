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

import PartsAdd from "../components/addParts";
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
const filter = createFilterOptions();
function Actions({
  status,
  getRepair,
  repairID,
  globalFunc,
  repairTime,
  repairOrder,
  setRepairOrder,
  repairOrderReady,
  setRepairOrderReady,
  createInvoice,
}) {
  const [Labor, setLabor] = useState(100);
  const [Tax, setTax] = useState(0);
  const [TaxRate, setTaxRate] = useState(7);
  const [Taxable, setTaxable] = useState(false);
  const [subTotal, setSubtotal] = useState(0);
  const [Total, setTotal] = useState(0);
  const [parts, setParts] = useState([]);
  const [allparts, setAllParts] = useState();
  const [partDetails, setPartDetails] = useState({ cost: 0, name: "", qty: 0 });
  const [part, setPart] = useState();
  const [searchedpart, setSearchedpart] = useState();
  const [partCost, setPartCost] = useState((0).toFixed(2));
  const [partName, setPartName] = useState();
  const [PartDetail, setPartDetail] = useState();
  // const [repairOrder, setRepairOrder] = useState();
  // const [repairOrderReady, setRepairOrderReady] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [timeUsed, setLaborTime] = useState(repairTime.toFixed(2));

  const [newRepairPart, setnewRepairPart] = useState(false);
  const [loadingOpen, toggleloadingOpen] = useState(false);
  const [dialogOpen, toggleDialogOpen] = useState(false);

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
    if (value.id == 0) {
      //New item
      setPartName(value.inputValue);
      setPartCost((0).toFixed(2));
      setPartDetail(true);
    } else {
      let selectedpart = allparts.filter((x) =>
        x.item_data.variations.filter((y) => y.id == value.id)
      );
      const filteredArray = allparts.filter((part) => {
        // Use Array.prototype.some() to check if any rating has the desired category
        return part.item_data.variations.some((item) => {
          return item.id === value.id;
        });
      })[0];
      let variant = filteredArray.item_data.variations.filter((x) => x.id == value.id);
      let cost =
        variant[0].item_variation_data.price_money != undefined
          ? variant[0].item_variation_data.price_money
          : 0;
      setPartDetails({
        ...partDetails,
        qty: 1,
        cost:
          variant[0].item_variation_data.price_money != undefined
            ? (variant[0].item_variation_data.price_money.amount / 100).toFixed(2)
            : (0).toFixed(2),
        name: filteredArray.item_data.name + " - " + variant[0].item_variation_data.name,
      });
      // setPartName(filteredArray.item_data.name + " - " + variant[0].item_variation_data.name);
      // setPartCost(
      //   variant[0].item_variation_data.price_money != undefined
      //     ? (variant[0].item_variation_data.price_money.amount / 100).toFixed(2)
      //     : (0).toFixed(2)
      // );
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
        item.item_data.variations.map((variant) => {
          itemList.push({
            label: `${item.item_data.name} - ${variant.item_variation_data.name} ${
              variant.item_variation_data != undefined &&
              variant.item_variation_data.price_money != undefined
                ? `- $${(variant.item_variation_data.price_money.amount / 100).toFixed(2)}`
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

  const repairAction = async (status, Event, icon, color, globalFunc) => {
    toggleloadingOpen(true);
    const response = await fetch(`${vars.serverUrl}/repairs/updateRepairStatus`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: repairID,
        status: status,
        history: {
          repairId: repairID,
          Event: Event,
          Details: "",
          icon: icon,
          color: color,
        },
      }),
      credentials: "include",
    });
    const json = await response.json();
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Repair updated");
      globalFunc.setSuccessSB(true);
      getRepair();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
    toggleloadingOpen(false);
    return null;
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
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  //const selectedValues = useMemo(() => parts.filter((v) => v.selected), [parts]);

  const doCreateInvoice = async () => {
    toggleloadingOpen(true);
    let dueTaxes;
    if (Taxable) {
      dueTaxes = { taxes: [{ percentage: TaxRate.toString(), name: "FL Sales Tax" }] };
    }
    const response = await fetch(`${vars.serverUrl}/repairs/createInvoice`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        parts: {
          quantity: 1,
          name: "Labor",
          note: `${timeUsed} hours @ $${Labor}/hr`,
          basePriceMoney: {
            amount: Math.round(Labor * timeUsed) * 100,
          },
        },
        tax: dueTaxes,
      }),
    });
    const json = await response.json();
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Invoice created");
      globalFunc.setSuccessSB(true);
      setShowInvoice(false);
      getRepair();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
    toggleloadingOpen(false);
  };

  // const createInvoice = async () => {
  //   toggleloadingOpen(true);
  //   const response = await fetch(`${vars.serverUrl}/repairs/getRepairOrder`, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //     body: JSON.stringify({ id: repairID }),
  //   });
  //   const json = await response.json();
  //   if (json.res == 200) {
  //     setRepairOrder(json.data[0]);
  //     setRepairOrderReady(true);
  //   } else {
  //     globalFunc.setErrorSBText("Server error occured");
  //     globalFunc.setErrorSB(true);
  //   }
  //   toggleloadingOpen(false);
  // };

  const reprintPaperwork = async () => {
    toggleloadingOpen(true);
    try {
      let postData = {
        id: repairID,
      };
      const response = await fetch(`${vars.serverUrl}/repairs/printDropOff`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      const json = await response.json();
      if (json.res == 200) {
        globalFunc.setSuccessSBText("Sent to printer");
        globalFunc.setSuccessSB(true);
      } else {
        globalFunc.setErrorSBText("Error occurred saving repair progress.");
        globalFunc.setErrorSB(true);
      }
    } catch (e) {
      console.error(e);
      globalFunc.setErrorSBText("Error occurred saving repair progress.");
      globalFunc.setErrorSB(true);
      // TODO: Add error notification
    }
    toggleloadingOpen(false);
  };

  useEffect(() => {
    if (status == 4) {
      createInvoice();
    }
  }, [status]);

  // useEffect(() => {
  //   if (status == 4) {
  //     setLaborTime(repairTime.toFixed(2));
  //   }
  // }, [repairTime]);

  useEffect(() => {
    let mySubtotal = parseFloat(0);
    if (repairOrderReady && status == 4) {
      repairOrder.lineItems.map((item) => {
        let cost = item.basePriceMoney.amount * item.quantity;
        mySubtotal = parseFloat(mySubtotal) + parseFloat(cost);
      });
      mySubtotal = parseFloat(mySubtotal / 100) + parseFloat(timeUsed * Labor);
      setSubtotal(mySubtotal);
      if (Taxable) {
        setTax(mySubtotal * (TaxRate / 100));
        setTotal(mySubtotal + mySubtotal * (TaxRate / 100));
      } else {
        setTotal(mySubtotal);
      }
    }
  }, [repairOrderReady, timeUsed, Labor]);

  const LoadDialog = () => {
    return (
      <Dialog open={loadingOpen}>
        <DialogTitle>Loading</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  };

  const PartsModal = () => {
    return (
      <>
        <Modal
          open={newRepairPart}
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
                    if (newValue && newValue.inputValue) {
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
                          console.log(e);
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
                setnewRepairPart(false);
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

  const ReprintButton = () => {
    return (
      <Grid item xs={12} md={6}>
        <MDButton fullwidth color="dark" variant="contained" onClick={() => reprintPaperwork()}>
          Reprint paperwork
        </MDButton>
      </Grid>
    );
  };

  if (status == 1) {
    return (
      <>
        <Grid container spacing={1} mb={3}>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="success"
              variant="contained"
              pb={3}
              onClick={() =>
                repairAction(2, "Repair started", "construction", "success", globalFunc)
              }
            >
              Start Repair
            </MDButton>
          </Grid>
          <ReprintButton />
        </Grid>
        <LoadDialog />
      </>
    );
  }
  if (status == 2) {
    return (
      <>
        <Grid container spacing={1} mb={3}>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="info"
              variant="contained"
              onClick={() => repairAction(3, "Repair paused", "pause", "info", globalFunc)}
            >
              Pause Repair
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton fullwidth color="dark" variant="contained" onClick={() => getParts()}>
              Add parts
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="success"
              variant="contained"
              onClick={() =>
                repairAction(4, "Repair completed", "build_circle", "success", globalFunc)
              }
            >
              Complete Repair
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="primary"
              variant="contained"
              onClick={() =>
                repairAction(998, "Repair cancelled", "event_busy", "primary", globalFunc)
              }
            >
              Cancel Repair
            </MDButton>
          </Grid>
          <ReprintButton />
        </Grid>
        <PartsAdd
          globalFunc={globalFunc}
          showPartsModal={newRepairPart}
          setshowPartsModal={setnewRepairPart}
          toggleloadingOpen={toggleloadingOpen}
          createInvoice={createInvoice}
          dialogOpen={dialogOpen}
          toggleDialogOpen={toggleDialogOpen}
          repairID={repairID}
          getRepair={getRepair}
        />
        <LoadDialog />
      </>
    );
  }
  if (status == 3) {
    return (
      <>
        <Grid container spacing={1} mb={3}>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="success"
              variant="contained"
              p={3}
              onClick={() =>
                repairAction(2, "Repair resumed", "construction", "success", globalFunc)
              }
            >
              Resume Repair
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="primary"
              variant="contained"
              p={3}
              onClick={() =>
                repairAction(998, "Repair cancelled", "event_busy", "primary", globalFunc)
              }
            >
              Cancel Repair
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="success"
              variant="contained"
              onClick={() =>
                repairAction(4, "Repair completed", "build_circle", "success", globalFunc)
              }
            >
              Complete Repair
            </MDButton>
          </Grid>
          <ReprintButton />
        </Grid>
        <toggleloadingOpen />
      </>
    );
  }
  if (status == 4) {
    return (
      <>
        <Grid container spacing={1} mb={3}>
          <Grid item xs={12} md={6}>
            <MDButton fullwidth color="dark" variant="contained" onClick={() => getParts()}>
              Add parts
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="success"
              variant="contained"
              p={3}
              disabled={!repairOrderReady}
              onClick={() => setShowInvoice(true)}
            >
              Create Invoice
            </MDButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDButton
              fullwidth
              color="success"
              variant="contained"
              p={3}
              onClick={() => repairAction(2, "Repair restarted", "info", "secondary", globalFunc)}
            >
              Restart Repair
            </MDButton>
          </Grid>
          <ReprintButton />
        </Grid>
        <LoadDialog />
        {repairOrderReady ? (
          <Modal
            open={showInvoice}
            onClose={() => null}
            // onClose={() => {
            //   setNewRepair(false);
            // }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <MDBox sx={style}>
              <MDTypography id="modal-modal-title" variant="h6" component="h2">
                Create Invoice
              </MDTypography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Item
                  </MDTypography>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Qty
                  </MDTypography>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Cost
                  </MDTypography>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="h6" sx={{ mt: 1 }}>
                    Subtotal
                  </MDTypography>
                </Grid>
                {repairOrder.lineItems.map((item) => {
                  return (
                    <>
                      <Grid item xs={4}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          {item.name}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={2}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          {item.quantity}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={3}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          ${(item.basePriceMoney.amount / 100).toFixed(2)}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={3}>
                        <MDTypography variant="body2" sx={{ mt: 1 }}>
                          ${((item.basePriceMoney.amount * item.quantity) / 100).toFixed(2)}
                        </MDTypography>
                      </Grid>
                    </>
                  );
                })}
                <Grid item xs={4}>
                  <MDTypography variant="body2" sx={{ mt: 1 }}>
                    Labor
                  </MDTypography>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    label="Time (hours)"
                    value={timeUsed}
                    onChange={(e) => {
                      setLaborTime(e.target.value);
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Labor Rate"
                    value={Labor}
                    onChange={(e, val) => {
                      setLabor(e.target.value);
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  <MDTypography variant="body2" sx={{ mt: 1 }}>
                    ${(timeUsed * Labor).toFixed(2)}
                  </MDTypography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={9}>
                  Subtotal
                </Grid>
                <Grid item xs={3}>
                  ${subTotal.toFixed(2)}
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={3}>
                  Tax
                </Grid>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Taxable"
                    onChange={(e) => {
                      setTaxable(e.target.checked);
                      if (!e.target.checked) {
                        setTax(0);
                        setTotal(subTotal);
                      } else {
                        setTax(subTotal * (TaxRate / 100));
                        setTotal(subTotal + subTotal * (TaxRate / 100));
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Tax Rate %"
                    disabled={!Taxable}
                    value={TaxRate}
                    onChange={(e, val) => {
                      setTaxRate(e.target.value);
                      setTax(subTotal * (TaxRate / 100));
                      setTotal(subTotal + subTotal * (TaxRate / 100));
                    }}
                    type="number"
                  ></TextField>
                </Grid>
                <Grid item xs={3}>
                  ${Tax.toFixed(2)}
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={9}>
                  Total
                </Grid>
                <Grid item xs={3}>
                  ${Total.toFixed(2)}
                </Grid>
              </Grid>
              <FormControl fullWidth></FormControl>
              <MDButton
                sx={{ marginTop: "2px" }}
                fullWidth
                color="success"
                onClick={() => {
                  doCreateInvoice();
                }}
              >
                Create Invoice
              </MDButton>
              <MDButton
                sx={{ marginTop: "2px" }}
                fullWidth
                color="secondary"
                onClick={() => {
                  setShowInvoice(false);
                }}
              >
                Cancel
              </MDButton>
            </MDBox>
          </Modal>
        ) : null}
        <PartsAdd
          globalFunc={globalFunc}
          showPartsModal={newRepairPart}
          setshowPartsModal={setnewRepairPart}
          toggleloadingOpen={toggleloadingOpen}
          createInvoice={createInvoice}
          dialogOpen={dialogOpen}
          toggleDialogOpen={toggleDialogOpen}
          repairID={repairID}
          getRepair={getRepair}
        />
      </>
    );
  }
}

export default Actions;
