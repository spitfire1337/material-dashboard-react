import MDButton from "components/MDButton";
import { Input, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import Loading from "components/Loading_Dialog";
import vars from "../../../config";

function AddPhotos({ getRepair, globalFunc, open, close }) {
  const [file, setFile] = useState();
  const [showUpload, setShowUpload] = useState(false);
  const [repairID, setRepairId] = useState();
  const [uploadData, setUploadData] = useState({
    file: {},
    description: "",
  });
  const [description, setDescription] = useState("");
  const { setShowLoad, LoadBox } = Loading();
  const submit = async (event) => {
    event.preventDefault();
    setShowUpload(false);
    setShowLoad(true);
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
      setShowLoad(false);
      return;
    }
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Photo uploaded");
      globalFunc.setSuccessSB(true);
      setShowLoad(false);
      getRepair();
    }
  };
  const showUploadFunc = () => {
    setShowUpload(true);
  };

  const setFileState = (e) => {
    console.log(e);
    setUploadData({ file: e.target.files[0] });
    console.log(file);
  };
  const AddPhotoModal = () => {
    console.log("Rerender");
    return (
      <>
        <Dialog open={open}>
          <form onSubmit={submit}>
            <DialogTitle>Upload image</DialogTitle>
            <DialogContent>
              <Input
                label="Image"
                type="file"
                filename={uploadData.file}
                onChange={setFileState}
                accept="image/*"
              />
              <br />
              <TextField
                fullWidth
                value={uploadData.description}
                onChange={(e) => setUploadData({ description: e.currentTarget.value })}
              />
            </DialogContent>
            <DialogActions>
              <MDButton onClick={() => setShowUpload(false)}>Cancel</MDButton>
              <MDButton type="submit">Upload</MDButton>
            </DialogActions>
          </form>
        </Dialog>
        <LoadBox />
      </>
    );
  };
  return {
    showUploadFunc: showUploadFunc,
    AddPhotoModal: AddPhotoModal,
    setRepairId: setRepairId,
  };
}

export default AddPhotos;
