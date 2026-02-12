import { useState, useRef, useCallback } from "react";
//Global
import { globalFuncs } from "../../../context/global";
import MDButton from "components/MDButton";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import vars from "../../../config";
import Webcam from "react-webcam";

function AddPhotos({ getRepair }) {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [file, setFile] = useState(null);
  const webcamRef = useRef(null);
  const [showUpload, setShowUpload] = useState(false);
  const [repairID, setRepairId] = useState();

  const [description, setDescription] = useState("");
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
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: file, description: description, id: repairID }),
    });
    const json = await response.json();
    if (!response.ok) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Server error occurred",
        show: true,
        icon: "check",
      });
      setShowLoad(false);
      return;
    }
    if (json.res == 200) {
      setSnackBar({
        type: "success",
        title: "Success",
        message: "Photo uploaded",
        show: true,
        icon: "check",
      });
      setShowLoad(false);
      getRepair();
    }
  };
  const capture = useCallback(() => {
    const imgsrc = webcamRef.current.getScreenshot();
    setFile(imgsrc);
  }, [webcamRef, setFile]);
  const showUploadFunc = () => {
    setShowUpload(true);
  };
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: { exact: "environment" },
  };

  const WebcamCapture = () => {
    if (!file) {
      return (
        <>
          <Webcam
            audio={false}
            screenshotFormat="image/png"
            width="100%"
            ref={webcamRef}
            height="75%"
            videoConstraints={videoConstraints}
          ></Webcam>
          <MDButton color="success" fullwidth onClick={capture}>
            Capture
          </MDButton>
        </>
      );
    } else {
      return (
        <>
          <img src={file} width="100%"></img>
          <MDButton onClick={() => setFile(null)}>Re-take photo</MDButton>
        </>
      );
    }
  };
  const addPhotoModal = (
    <>
      <Dialog open={showUpload}>
        <form onSubmit={submit}>
          <DialogTitle>Upload image</DialogTitle>
          <DialogContent>
            <WebcamCapture />
            <br />
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setShowUpload(false)}>Cancel</MDButton>
            <MDButton type="submit" disabled={file != null ? false : true}>
              Upload
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
  return {
    showUploadFunc: showUploadFunc,
    addPhotoModal: addPhotoModal,
    setRepairId: setRepairId,
  };
}

export default AddPhotos;
