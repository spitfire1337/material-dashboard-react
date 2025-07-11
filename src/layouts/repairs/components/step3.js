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
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import vars from "../../../config";
const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;

    // if (transparentNavbar) {
    //   colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
    // }

    return colorValue;
  },
});
const step3 = ({ globalFunc, repairID, nextRepairStep }) => {
  const [repairType, setRepairType] = useState([]);
  const [repairDetails, setRepairDetails] = useState();
  const [warranty, setWarranty] = useState(false);
  const [accessories, setAccessories] = useState([]);
  const [accessoryCount, setAccessoryCount] = useState(0);
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
        accessories: accessories,
      };
      const response = await fetch(`${vars.serverUrl}/repairs/updateRepair`, {
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
      globalFunc.setErrorSBText("Error occurred saving repair progress.");
      globalFunc.setErrorSB(true);
      // TODO: Add error notification
    }
  };
  const addAccessorie = () => {
    let newaccessoryCount = accessoryCount + 1;
    setAccessoryCount(newaccessoryCount);
    let details = {
      id: newaccessoryCount,
      name: "",
    };
    let oldAccessory = [...accessories];
    oldAccessory.push(details);
    setAccessories(oldAccessory);
  };
  return (
    <>
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
              <MDTypography variant="body1">Accessories</MDTypography>
            </Grid>
            {accessories.map((accessorie, i) => {
              return (
                <>
                  <Grid item key={accessorie.id} sm={11}>
                    <TextField
                      fullWidth
                      value={accessorie.name}
                      onChange={(e) => {
                        let oldAccessory = [...accessories];
                        oldAccessory[i].name = e.currentTarget.value;
                        //oldAccessory.find((x) => (x.id = accessorie.id)).name = e.currentTarget.value;
                        setAccessories(oldAccessory);
                      }}
                    />
                  </Grid>
                  <Grid item key={accessorie.id} sm={1}>
                    <IconButton
                      size="small"
                      disableRipple
                      color="red"
                      onClick={() => {
                        let oldAccessory = [...accessories];
                        oldAccessory.splice(i, 1);
                        setAccessories(oldAccessory);
                      }}
                    >
                      <Icon sx={iconsStyle}>clear</Icon>
                    </IconButton>
                  </Grid>
                </>
              );
            })}
            <Grid item sm={12}>
              <MDButton variant="outlined" color="secondary" onClick={() => addAccessorie()}>
                Add accessory
              </MDButton>
            </Grid>
            <Grid item sm={12}>
              <MDButton fullWidth variant="outlined" color="primary" onClick={() => updateRepair()}>
                Next
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step3;
