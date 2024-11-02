import MDButton from "components/MDButton";
import { Input, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import vars from "../../../config";

function AddPhoto({ setloadingOpen, getRepair, repairID, globalFunc, hide, openVar }) {
  const [file, setFile] = useState();
  const [description, setDescription] = useState("");
  return (
    <Dialog open={openVar}>
      <DialogTitle>Enter adjusted hours</DialogTitle>
      <DialogContent>
        <Input
          label="Minutes"
          type="file"
          filename={file}
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*"
        />
      </DialogContent>
      <DialogActions>
        <MDButton onClick={() => hide(false)}>Cancel</MDButton>
        <MDButton onClick={() => saveTime()}>Upload</MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddPhoto;
