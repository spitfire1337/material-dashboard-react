import { useState, useEffect, useMemo } from "react";
import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  TextField,
  Divider,
  Grid,
  FormControlLabel,
  FormGroup,
  Checkbox,
} from "@mui/material";

import vars from "../../../config";

const step5 = ({ globalFunc, repairID, nextRepairStep, reRender, setNewRepair }) => {
  const [repairType, setRepairType] = useState([]);
  const [repairDetails, setRepairDetails] = useState();
  const [warranty, setWarranty] = useState(false);
  const signatureCanvasRef = useRef(null);

  const clearSignature = () => {
    signatureCanvasRef.current.clear();
  };

  const saveSignature = () => {
    const signatureImage = signatureCanvasRef.current.toDataURL();
    console.log("Signature Image:", signatureImage);
  };
  const printRepair = async (pev) => {
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
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        reRender();
        setNewRepair(false);
        nextRepairStep(5);
        globalFunc.setSuccessSBText("Sent to printer");
        globalFunc.setSuccessSB(true);
      } else {
        globalFunc.setErrorSBText("Error occurred saving repair progress.");
        globalFunc.setErrorSB(true);
      }
    } catch (e) {
      globalFunc.setErrorSBText("Error occurred saving repair progress.");
      globalFunc.setErrorSB(true);
      // TODO: Add error notification
    }
  };

  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Customer Agreement:
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <SignatureCanvas
                ref={signatureCanvasRef}
                penColor="blue"
                canvasProps={{ width: "100%", height: 200, className: "signature-canvas" }}
              />
              <button onClick={clearSignature}>Clear</button>
              <button onClick={saveSignature}>Save</button>
            </Grid>
            <Grid item sm={12}>
              <MDButton fullWidth variant="outlined" color="primary" onClick={() => printRepair()}>
                Print paperwork & Complete intake
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step5;
