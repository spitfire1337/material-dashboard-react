import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Autocomplete,
  Tooltip,
  Icon,
  IconButton,
  Divider,
} from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { globalFuncs } from "context/global";
import vars from "config";
import { useSocket } from "context/socket";

function PauseRepairPartsButton({ repairId, onPause, size = "full" }) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [open, setOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [currentPart, setCurrentPart] = useState({
    partName: "",
    cost: "",
    customerCost: "",
    quantity: "",
    vendor: "",
    orderNumber: "",
    trackingNumber: "",
  });

  useEffect(() => {
    if (open) {
      fetchVendors();
    }
  }, [open]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${vars.serverUrl}/square/getVendors`, {
        credentials: "include",
      });
      const json = await response.json();
      if (json.res === 200) {
        setVendors(json.data);
      }
    } catch (e) {
      console.error("Error fetching vendors", e);
    }
  };

  const handleAddPart = () => {
    if (!currentPart.partName || !currentPart.quantity) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Part Name and Quantity are required",
        show: true,
        icon: "warning",
      });
      return;
    }
    setPartsList([...partsList, currentPart]);
    setCurrentPart({
      partName: "",
      cost: "",
      customerCost: "",
      quantity: "",
      vendor: "",
      orderNumber: "",
      trackingNumber: "",
    });
  };

  const handleRemovePart = (index) => {
    const newList = [...partsList];
    newList.splice(index, 1);
    setPartsList(newList);
  };

  const handleSubmit = async () => {
    if (currentPart.partName && currentPart.quantity && !currentPart.vendor) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please fill in required fields (Part Name, Quantity, Vendor)",
        show: true,
        icon: "warning",
      });
      return;
    }

    let partsToSave = [...partsList];
    if (currentPart.partName && currentPart.quantity) {
      partsToSave.push(currentPart);
    }

    setShowLoad(true);
    let successCount = 0;

    for (const part of partsToSave) {
      try {
        await new Promise((resolve) => {
          if (socket) {
            socket.emit(
              "saveRepairPartOrdered",
              {
                repairId,
                ...part,
              },
              (json) => {
                if (json.res === 200) {
                  successCount++;
                }
                resolve();
              }
            );
          } else {
            resolve();
          }
        });
      } catch (e) {
        console.error("Error saving part", e);
      }
    }

    if (partsToSave.length === 0 || successCount > 0) {
      if (onPause) {
        await onPause(11, "Repair paused - Awaiting parts", "alarm_pause", "info");
      }
      setOpen(false);
      setPartsList([]);
      setCurrentPart({
        partName: "",
        cost: "",
        customerCost: "",
        quantity: "",
        vendor: "",
        orderNumber: "",
        trackingNumber: "",
      });
      setSnackBar({
        type: "success",
        title: "Success",
        message:
          partsToSave.length > 0
            ? `${successCount} parts saved and repair paused`
            : "Repair paused",
        show: true,
        icon: "check",
      });
    } else {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Error saving parts order",
        show: true,
        icon: "warning",
      });
    }
    setShowLoad(false);
  };

  const button =
    size === "icon" ? (
      <Tooltip title="Pause Repair - Awaiting parts">
        <MDButton fullwidth color="info" variant="contained" onClick={() => setOpen(true)}>
          <Icon>alarm_pause</Icon>
        </MDButton>
      </Tooltip>
    ) : (
      <MDButton fullWidth color="info" variant="contained" onClick={() => setOpen(true)}>
        Pause - Awaiting Parts
      </MDButton>
    );

  return (
    <>
      {button}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Order Parts & Pause Repair</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={1}>
            <Grid item xs={12}>
              <Divider />
              <MDTypography variant="h6">Parts List</MDTypography>
            </Grid>
            {partsList.map((part, index) => (
              <Grid item xs={12} key={index}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={5}>
                    <MDTypography variant="body2">{part.partName}</MDTypography>
                  </Grid>
                  <Grid item xs={2}>
                    <MDTypography variant="body2">Qty: {part.quantity}</MDTypography>
                  </Grid>
                  <Grid item xs={4}>
                    <MDTypography variant="body2">
                      Cost: ${part.cost} | Cust: ${part.customerCost}
                    </MDTypography>
                    <MDTypography variant="caption">
                      {part.vendor} {part.orderNumber ? `- ${part.orderNumber}` : ""}
                      {part.trackingNumber ? ` - ${part.trackingNumber}` : ""}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton onClick={() => handleRemovePart(index)} color="error">
                      <Icon>delete</Icon>
                    </IconButton>
                  </Grid>
                </Grid>
                <Divider />
              </Grid>
            ))}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2">Add Part</MDTypography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Part Name"
                value={currentPart.partName}
                onChange={(e) => setCurrentPart({ ...currentPart, partName: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={currentPart.cost}
                onChange={(e) => setCurrentPart({ ...currentPart, cost: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Customer Cost"
                type="number"
                value={currentPart.customerCost}
                onChange={(e) => setCurrentPart({ ...currentPart, customerCost: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={currentPart.quantity}
                onChange={(e) => setCurrentPart({ ...currentPart, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                freeSolo
                options={vendors.map((v) => v.name || v)}
                value={currentPart.vendor}
                onChange={(event, newValue) => {
                  setCurrentPart({ ...currentPart, vendor: newValue });
                }}
                onInputChange={(event, newInputValue) => {
                  setCurrentPart({ ...currentPart, vendor: newInputValue });
                }}
                renderInput={(params) => <TextField {...params} label="Vendor" fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Order Number"
                value={currentPart.orderNumber}
                onChange={(e) => setCurrentPart({ ...currentPart, orderNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tracking Number"
                value={currentPart.trackingNumber}
                onChange={(e) => setCurrentPart({ ...currentPart, trackingNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <MDButton
                variant="outlined"
                color="info"
                fullWidth
                onClick={handleAddPart}
                disabled={!currentPart.partName || !currentPart.quantity}
              >
                Add Part to List
              </MDButton>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpen(false)} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} color="success">
            Save & Pause
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PauseRepairPartsButton;
