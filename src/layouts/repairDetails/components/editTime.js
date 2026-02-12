import { useState } from "react";
//Global
import { globalFuncs } from "../../../context/global";
import MDButton from "components/MDButton";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import vars from "../../../config";

function EditTime({ repairTime, getRepair, repairID, hide, openVar }) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [newMinutes, setnewMinutes] = useState(Math.round(60 * repairTime));
  const saveTime = async () => {
    hide(false);
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/repairs/adjustTime`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: repairID,
        time: (newMinutes / 60).toFixed(2),
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Success",
        message: "Repair time adjusted",
        show: true,
        icon: "check",
      });
      getRepair();
    } else {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error occurred",
        show: true,
        icon: "check",
      });
    }
  };
  return (
    <Dialog open={openVar}>
      <DialogTitle>Enter adjusted hours</DialogTitle>
      <DialogContent>
        <TextField
          value={newMinutes}
          label="Minutes"
          type="number"
          onChange={(e) => {
            setnewMinutes(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <MDButton onClick={() => hide(false)}>Cancel</MDButton>
        <MDButton onClick={() => saveTime()} autoFocus>
          Save
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditTime;
