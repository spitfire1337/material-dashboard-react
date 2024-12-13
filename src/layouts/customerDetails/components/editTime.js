import MDButton from "components/MDButton";
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import vars from "../../../config";

function EditTime({ repairTime, setloadingOpen, getRepair, repairID, globalFunc, hide, openVar }) {
  const [newMinutes, setnewMinutes] = useState(Math.round(60 * repairTime));
  const saveTime = async () => {
    hide(false);
    setloadingOpen(true);
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
    setloadingOpen(false);
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Repair time adjusted");
      globalFunc.setSuccessSB(true);
      getRepair();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
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
