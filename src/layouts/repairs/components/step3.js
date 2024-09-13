import { useState, useEffect, useMemo } from "react";

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
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

const step3 = ({ globalFunc, repairID, nextRepairStep }) => {
  const [repairType, setRepairType] = useState([]);
  const [repairDetails, setRepairDetails] = useState();
  const [warranty, setWarranty] = useState(false);
  const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    return [
      values,
      (newValue) => {
        setValues({
          ...values,
          ...newValue,
        });
      },
    ];
  };
  const updateRepair = async (pev) => {
    try {
      let postData = {
        _id: repairID,
        Details: repairDetails,
        RepairType: repairType,
        warranty: warranty,
      };
      const response = await fetch(`${vars.serverUrl}/square/updateRepair`, {
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
        nextRepairStep(4);
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
  };

  return (
    <MDBox sx={style}>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Repair information
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Tire Change"
                  onChange={(e) => {
                    let myrepairType = "Tire Change";
                    let newData = [...repairType];
                    if (e.target.checked) {
                      if (!newData.includes(myrepairType)) {
                        newData.push(myrepairType);
                        setRepairType(newData);
                      }
                    } else {
                      let newArray = newData.filter((item) => item !== myrepairType);
                      setRepairType(newArray);
                    }
                  }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Tube Change"
                  onChange={(e) => {
                    let myrepairType = "Tube Change";
                    let newData = [...repairType];
                    if (e.target.checked) {
                      if (!newData.includes(myrepairType)) {
                        newData.push(myrepairType);
                        setRepairType(newData);
                      }
                    } else {
                      let newArray = newData.filter((item) => item !== myrepairType);
                      setRepairType(newArray);
                    }
                  }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Power issue"
                  onChange={(e) => {
                    let myrepairType = "Power issue";
                    let newData = [...repairType];
                    if (e.target.checked) {
                      if (!newData.includes(myrepairType)) {
                        newData.push(myrepairType);
                        setRepairType(newData);
                      }
                    } else {
                      let newArray = newData.filter((item) => item !== myrepairType);
                      setRepairType(newArray);
                    }
                  }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Mechanical Repair"
                  onChange={(e) => {
                    let myrepairType = "Mechanical Repair";
                    let newData = [...repairType];
                    if (e.target.checked) {
                      if (!newData.includes(myrepairType)) {
                        newData.push(myrepairType);
                        setRepairType(newData);
                      }
                    } else {
                      let newArray = newData.filter((item) => item !== myrepairType);
                      setRepairType(newArray);
                    }
                  }}
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Other"
                  onChange={(e) => {
                    let myrepairType = "Other";
                    let newData = [...repairType];
                    if (e.target.checked) {
                      if (!newData.includes(myrepairType)) {
                        newData.push(myrepairType);
                        setRepairType(newData);
                      }
                    } else {
                      let newArray = newData.filter((item) => item !== myrepairType);
                      setRepairType(newArray);
                    }
                  }}
                />
              </FormGroup>
            </Grid>
            <Grid item sm={12}>
              <TextField
                id="outlined-multiline-static"
                label="Repair Details"
                multiline
                rows={4}
                fullWidth
                onChange={(e) => {
                  setRepairDetails(e.target.value);
                }}
              />
            </Grid>
            <Grid item sm={12}>
              <FormControlLabel
                control={<Checkbox />}
                label="Warranty repair?"
                onChange={(e) => {
                  setWarranty(e.target.checked);
                }}
              />
            </Grid>
            <Grid item sm={12}>
              <MDButton fullWidth variant="outlined" color="primary" onClick={() => updateRepair()}>
                Next
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </MDBox>
  );
};
export default step3;
