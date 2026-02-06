import { useState, React, useEffect } from "react";
//Global
import { globalFuncs } from "../../../context/global";

// Vars
import vars from "../../../config";

// @mui material components
import Grid from "@mui/material/Grid";
import {
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
  Checkbox,
  NativeSelect,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { Modal } from "@mui/material";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  minHeight: "50vh",
  maxHeight: "80vh",
  overflowY: "scroll",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};

const PEVEdit = ({ pev = undefined, open, brands, close, reRender }) => {
  const { setSnackBar } = globalFuncs();
  const [brandDisable, setBrandDisable] = useState(true);
  const [selectedPEV, setSelectedPEV] = useState(null);
  const [showNewPev, setShowNewPev] = useState(false);

  const newPevData = (value) => {
    if (value.Brand._id == 0) {
      setBrandDisable(false);
    } else {
      setBrandDisable(true);
    }
    setSelectedPEV({ ...value });
  };

  const savePevUpdate = async () => {
    close(false);
    let newPev = { ...selectedPEV };
    if (newPev.Brand._id == 0) {
      //First we must create the new brand and return the ID
      try {
        const response = await fetch(`${vars.serverUrl}/repairs/createBrand`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newPev.Brand.name }),
          credentials: "include",
        });
        const json = await response.json();
        if (json.res == 200) {
          //We can now save PEV details with the new brand id
          let newData = { ...selectedPEV };
          newData.Brand._id = json.data;
          let newpevresp = await fetch(`${vars.serverUrl}/api/updatePEV`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pev: newData }),
            credentials: "include",
          });
          let pevjson = await newpevresp.json();
          if (pevjson.res == 200) {
            setSnackBar({
              type: "success",
              title: "Success",
              message: "PEV Database Updated",
              show: true,
              icon: "check",
            });
            reRender();
          } else {
            setSnackBar({
              type: "error",
              title: "Error",
              message: "An error occurred while saving data, please try again",
              show: true,
              icon: "check",
            });
          }
        } else {
          setSnackBar({
            type: "error",
            title: "Error",
            message: "An error occurred while saving data, please try again",
            show: true,
            icon: "check",
          });
        }
      } catch (e) {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "An error occurred while saving data, please try again",
          show: true,
          icon: "check",
        });
      }
    } else {
      //
      let newPev = { ...selectedPEV };
      let newpevresp = await fetch(`${vars.serverUrl}/api/updatePEV`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pev: newPev }),
        credentials: "include",
      });
      let pevjson = await newpevresp.json();
      if (pevjson.res == 200) {
        setSnackBar({
          type: "success",
          title: "Success",
          message: "PEV Database Updated",
          show: true,
          icon: "check",
        });
        reRender();
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "An error occurred while saving data, please try again",
          show: true,
          icon: "check",
        });
      }
    }
  };

  useEffect(() => {
    setSelectedPEV(pev);
    if (pev != {}) {
      setShowNewPev(true);
    }
  }, [pev]);

  return (
    <Modal
      open={open}
      onClose={() => null}
      // onClose={() => {
      //   setNewRepair(false);
      // }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <MDBox sx={style}>
        {selectedPEV != null ? (
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <MDTypography>Please provide as many fields as possible.</MDTypography>
            </Grid>
            <Grid item md={6} sm={12}>
              <Autocomplete
                onChange={(event, newValue) => {
                  let newData = { ...selectedPEV };
                  newData.Brand == undefined ? (newPev.Brand = {}) : null;
                  newData.Brand._id = newValue != null ? newValue.id : "";
                  newData.Brand.name =
                    newValue != null ? (newValue.id == 0 ? "" : newValue.label) : "";
                  newValue != "" &&
                  newValue != undefined &&
                  newValue.id != undefined &&
                  newValue != ""
                    ? newPevData(newData)
                    : null;
                }}
                value={selectedPEV.Brand.name}
                disablePortal
                options={brands}
                fullWidth
                renderInput={(params) => <TextField {...params} label="Select brand" />}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Brand name"
                fullWidth
                disabled={brandDisable}
                value={selectedPEV.Brand.name}
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.Brand.name = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <FormControl fullWidth size="small">
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                  PEV Type
                </InputLabel>
                <NativeSelect
                  value={selectedPEV.PevType}
                  label="PEV Type"
                  onChange={(e) => {
                    let newData = { ...selectedPEV };
                    newData.PevType = e.target.value;
                    newPevData(newData);
                  }}
                >
                  <option></option>
                  <option value="EUC">EUC</option>
                  <option value="Scooter">Scooter</option>
                  <option value="OneWheel">OneWheel</option>
                  <option value="Ebike">Ebike</option>
                  <option value="Emoto">Emoto</option>
                  <option value="Eskate">Eskate</option>
                </NativeSelect>
              </FormControl>
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Model Name"
                fullWidth
                value={selectedPEV.Model}
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.Model = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Voltage"
                fullWidth
                value={selectedPEV.Voltage != undefined ? selectedPEV.Voltage : ""}
                type="number"
                variant="outlined"
                inputProps={{
                  maxLength: 13,
                  step: "1",
                }}
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.Voltage = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Motor Watts"
                fullWidth
                value={selectedPEV.Motor != undefined ? selectedPEV.Motor : ""}
                type="number"
                variant="outlined"
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.Motor = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Battery WH"
                fullWidth
                value={selectedPEV.BatterySize != undefined ? selectedPEV.BatterySize : ""}
                type="number"
                variant="outlined"
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.BatterySize = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Tire Size"
                fullWidth
                value={selectedPEV.TireSize != undefined ? selectedPEV.TireSize : ""}
                type="number"
                variant="outlined"
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.TireSize = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Weight"
                fullWidth
                value={selectedPEV.Weight != undefined ? selectedPEV.Weight : ""}
                type="number"
                variant="outlined"
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.Weight = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Top Speed"
                fullWidth
                value={selectedPEV.TopSpeed != undefined ? selectedPEV.TopSpeed : ""}
                type="number"
                variant="outlined"
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.TopSpeed = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Range"
                fullWidth
                value={selectedPEV.Range != undefined ? selectedPEV.Range : ""}
                type="number"
                variant="outlined"
                onChange={(e) => {
                  let newData = { ...selectedPEV };
                  newData.Range = e.target.value;
                  newPevData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Suspension"
                  onChange={(e) => {
                    let newData = { ...selectedPEV };
                    newData.Suspension = e.target.checked;
                    newPevData(newData);
                  }}
                />
              </FormGroup>
            </Grid>
            <Grid item md={6} sm={12}>
              <MDButton variant="contained" color="error" fullWidth onClick={() => close(false)}>
                Cancel
              </MDButton>
            </Grid>
            <Grid item md={6} sm={12}>
              <MDButton
                variant="contained"
                color="success"
                fullWidth
                onClick={() => savePevUpdate()}
              >
                Save
              </MDButton>
            </Grid>
          </Grid>
        ) : null}
      </MDBox>
    </Modal>
  );
};

export default PEVEdit;
