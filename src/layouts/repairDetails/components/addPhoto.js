import MDButton from "components/MDButton";
import { Input, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import vars from "../../../config";

function AddPhoto({ setloadingOpen, getRepair, repairID, globalFunc, hide, openVar }) {
  const [file, setFile] = useState();
  const [description, setDescription] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);
    formData.append("id", repairID);

    //const result = await axios.post('/api/images', formData, { headers: {'Content-Type': 'multipart/form-data'}})
    const response = await fetch(`${vars.serverUrl}/repairs/addPhoto`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const json = await response.json();
    if (!response.ok) {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
      hide(false);
      return;
    }
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Photo uploaded");
      globalFunc.setSuccessSB(true);
      hide(false);
      getRepair();
    }
  };

  return (
    <Dialog open={openVar}>
      <form onSubmit={submit}>
        <DialogTitle>Enter adjusted hours</DialogTitle>
        <DialogContent>
          <Input
            label="Image"
            type="file"
            filename={file}
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
          <br />
          <TextField
            label="Description"
            onChange={(e) => setDescription(e.target.value)}
            type="text"
          ></TextField>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => hide(false)}>Cancel</MDButton>
          <MDButton type="submit">Upload</MDButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddPhoto;
