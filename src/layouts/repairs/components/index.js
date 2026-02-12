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
} from "@mui/material";
import MDButton from "components/MDButton";
import { globalFuncs } from "context/global";
import vars from "config";

function PauseRepairPartsButton({ repairId, onPause, size = "full" }) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [open, setOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [partsData, setPartsData] = useState({
    partName: "",
    cost: "",
    customerCost: "",
    quantity: "",
    vendor: "",
    orderNumber: "",
  });

  useEffect(() => {
    if (open) {
      fetchVendors();
    }
  }, [open]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${vars.serverUrl}/repairs/vendors`, {
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

  const handleSubmit = async () => {
    if (!partsData.partName || !partsData.quantity || !partsData.vendor) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please fill in required fields (Part Name, Quantity, Vendor)",
        show: true,
        icon: "warning",
      });
      return;
    }

    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/repairs/savePartsOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repairId,
          ...partsData,
        }),
        credentials: "include",
      });
      const json = await response.json();

      if (json.res === 200) {
        if (onPause) {
          await onPause(11, "Repair paused - Awaiting parts", "alarm_pause", "info");
        }
        setOpen(false);
        setPartsData({
          partName: "",
          cost: "",
          customerCost: "",
          quantity: "",
          vendor: "",
          orderNumber: "",
        });
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Parts order saved and repair paused",
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
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error",
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
              <TextField
                fullWidth
                label="Part Name"
                value={partsData.partName}
                onChange={(e) => setPartsData({ ...partsData, partName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={partsData.cost}
                onChange={(e) => setPartsData({ ...partsData, cost: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Customer Cost"
                type="number"
                value={partsData.customerCost}
                onChange={(e) => setPartsData({ ...partsData, customerCost: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={partsData.quantity}
                onChange={(e) => setPartsData({ ...partsData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                freeSolo
                options={vendors.map((v) => v.name || v)}
                value={partsData.vendor}
                onChange={(event, newValue) => {
                  setPartsData({ ...partsData, vendor: newValue });
                }}
                onInputChange={(event, newInputValue) => {
                  setPartsData({ ...partsData, vendor: newInputValue });
                }}
                renderInput={(params) => <TextField {...params} label="Vendor" fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Order Number"
                value={partsData.orderNumber}
                onChange={(e) => setPartsData({ ...partsData, orderNumber: e.target.value })}
              />
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
