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
  NativeSelect,
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

const step2 = ({ globalFunc, repairData, updateRepairData, setrepairID, nextRepairStep }) => {
  const [pevSelection, setPEVSelection] = useState([]);
  const [allowContinue, setAllowContinue] = useState(false);
  const [pevBrand, setPEVBrand] = useState([]);
  const [showNewPev, setShowNewPev] = useState(false);
  const [brandDisable, setBrandDisable] = useState(true);
  const [newPev, setNewPev] = useState({ Brand: { name: "" }, Model: "" });
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
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
  //const [selectedcustomer, setSelectedCustomer] = useForm({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getPEVS`, {
        credentials: "include",
      });
      if (response.status == 200) {
        const res = await response.json();
        if (res.res === 200) {
          setModels(res.data);
          function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
          }
          // usage example:
          //var unique = res.data.filter((v, i, a) => a.indexOf(v.Model) == i);
          var unique = res.data.filter(
            (item, idx) => res.data.findIndex((x) => x.Brand._id == item.Brand._id) == idx
          );
          let brands = [{ id: 0, label: "Other" }];
          unique.map((brand) => {
            brands.push({ id: brand.Brand._id, label: brand.Brand.name });
          });
          setBrands(brands);
          let custList = [{ label: "New PEV", id: 0 }];
          res.data.map((pev) => {
            custList.push({
              label: `${pev.Brand.name} ${pev.Model}`,
              id: pev._id,
            });
          });
          setPEVSelection(custList);
          //setSelectedCustomer({});
          //setShowCustForm(false);
        } else if (res.res === 401) {
          globalFunc.setLoggedIn(false);
        }
      } else if (response.status == 401) {
        globalFunc.setLoggedIn(false);
      }
    };
    fetchData();
  }, []);

  const choosePevBrand = (pev) => {
    if (pev == null) {
      setPEVBrand(0);
      setAllowContinue(false);
      setShowNewPev(false);
    } else if (pev.id == 0) {
      //NEW PEV
      setPEVBrand(0);
      setAllowContinue(false);
      //setSelectedCustomer({});
      setShowNewPev(true);
    } else {
      let pevData = pevSelection.filter((mypev) => mypev._id == pev.id)[0];
      setPEVBrand(pev.id);
      setAllowContinue(true);
      //setShowCustForm(true);
    }
  };

  const newPevData = (value) => {
    if (value.Brand._id == 0) {
      setBrandDisable(false);
    } else {
      setBrandDisable(true);
    }
    if (value.Brand.name != "" && value.Model != "") {
      setAllowContinue(true);
    } else {
      setAllowContinue(false);
    }
    setNewPev({ ...value });
  };

  const createRepair = async (pev) => {
    try {
      const response = await fetch(`${vars.serverUrl}/square/createRepair`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pev),
        credentials: "include",
      });
      const json = await response.json();
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        setrepairID(json.data._id);
        nextRepairStep(3);
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

  const processPevData = async () => {
    if (newPev.Brand._id == 0) {
      //First we must create the new brand and return the ID
      try {
        const response = await fetch(`${vars.serverUrl}/square/createBrand`, {
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
          let newData = { ...newPev };
          newData.Brand._id = json.data;
          setNewPev(newData);
          let newpevresp = await fetch(`${vars.serverUrl}/square/createPEV`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
            credentials: "include",
          });
          let pevjson = await newpevresp.json();
          if (pevjson.res == 200) {
            globalFunc.setSuccessSBText("New PEV Added to database");
            globalFunc.setSuccessSB(true);
            let newRepairData = { ...repairData };
            newRepairData.Pev = pevjson.data._id;
            createRepair(newRepairData);
          } else {
            globalFunc.setErrorSBText("An error occured while saving data, please try again");
            globalFunc.setErrorSB(true);
          }
        } else {
          globalFunc.setErrorSBText("An error occured while saving data, please try again");
          globalFunc.setErrorSB(true);
        }
      } catch (e) {
        console.error(e);
        globalFunc.setErrorSBText("An error occured while saving data, please try again");
        globalFunc.setErrorSB(true);
      }
    } else {
      //
      console.log(pevBrand);
      let newRepairData = { ...repairData };
      newRepairData.pev = pevBrand;
      console.log(newRepairData);
      createRepair(newRepairData);
    }
  };
  return (
    <MDBox sx={style}>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        PEV Details
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Autocomplete
            onChange={(event, newValue) => {
              choosePevBrand(newValue);
            }}
            disablePortal
            options={pevSelection}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Select" />}
          />
        </FormControl>

        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            {showNewPev == true ? (
              <>
                <Grid item sm={12}>
                  <MDTypography>Please provide as many fields as possible.</MDTypography>
                </Grid>
                <Grid item md={6} sm={12}>
                  <Autocomplete
                    onChange={(event, newValue) => {
                      let newData = { ...newPev };
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
                    value={newPev.Brand.name}
                    onChange={(e) => {
                      let newData = { ...newPev };
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
                      value={newPev.PevType}
                      label="PEV Type"
                      onChange={(e) => {
                        let newData = { ...newPev };
                        newData.PevType = e.target.value;
                        newPevData(newData);
                      }}
                    >
                      {/* <Select
                      value={newPev.PevType}
                      label="PEV Type"
                      onChange={(e) => {
                        let newData = { ...newPev };
                        newData.PevType = e.target.value;
                        newPevData(newData);
                      }}
                    > */}
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
                    value={newPev.Model}
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.Model = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Voltage"
                    fullWidth
                    value={newPev.Voltage != undefined ? newPev.Voltage : ""}
                    type="number"
                    variant="outlined"
                    inputProps={{
                      maxLength: 13,
                      step: "1",
                    }}
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.Voltage = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Motor Watts"
                    fullWidth
                    value={newPev.Motor != undefined ? newPev.Motor : ""}
                    type="number"
                    variant="outlined"
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.Motor = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Battery WH"
                    fullWidth
                    value={newPev.BatterySize != undefined ? newPev.BatterySize : ""}
                    type="number"
                    variant="outlined"
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.BatterySize = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Tire Size"
                    fullWidth
                    value={newPev.TireSize != undefined ? newPev.TireSize : ""}
                    type="number"
                    variant="outlined"
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.TireSize = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Weight"
                    fullWidth
                    value={newPev.Weight != undefined ? newPev.Weight : ""}
                    type="number"
                    variant="outlined"
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.Weight = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Top Speed"
                    fullWidth
                    value={newPev.TopSpeed != undefined ? newPev.TopSpeed : ""}
                    type="number"
                    variant="outlined"
                    onChange={(e) => {
                      let newData = { ...newPev };
                      newData.TopSpeed = e.target.value;
                      newPevData(newData);
                    }}
                  />
                </Grid>
                <Grid item md={6} sm={12}>
                  <TextField
                    label="Range"
                    fullWidth
                    value={newPev.Range != undefined ? newPev.Range : ""}
                    type="number"
                    variant="outlined"
                    onChange={(e) => {
                      let newData = { ...newPev };
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
                        let newData = { ...newPev };
                        newData.Suspension = e.target.checked;
                        newPevData(newData);
                      }}
                    />
                  </FormGroup>
                </Grid>
                {/*<Grid item sm={12}>
                  <TextField
                    label="Address line 1"
                    fullWidth
                    value={
                      selectedcustomer.address != undefined
                        ? selectedcustomer.address.address_line_1
                        : ""
                    }
                    onChange={(e) => {
                      selectedcustomer.address == undefined
                        ? (selectedcustomer.address = {})
                        : null;
                      selectedcustomer.address.address_line_1 = e.target.value;
                      updateCustomer(selectedcustomer);
                    }}
                  />
                </Grid>
                <Grid item sm={12}>
                  <TextField
                    label="Address line 2"
                    fullWidth
                    value={
                      selectedcustomer.address != undefined &&
                      selectedcustomer.address.address_line_2 != undefined
                        ? selectedcustomer.address.address_line_2
                        : ""
                    }
                    onChange={(e) => {
                      selectedcustomer.address == undefined
                        ? (selectedcustomer.address = {})
                        : null;
                      selectedcustomer.address.address_line_2 = e.target.value;
                      updateCustomer(selectedcustomer);
                    }}
                  />
                </Grid>
                <Grid item sm={12}>
                  <TextField
                    label="Address line 3"
                    fullWidth
                    value={
                      selectedcustomer.address != undefined &&
                      selectedcustomer.address.address_line_3 != undefined
                        ? selectedcustomer.address.address_line_3
                        : ""
                    }
                    onChange={(e) => {
                      selectedcustomer.address == undefined
                        ? (selectedcustomer.address = {})
                        : null;
                      selectedcustomer.address.address_line_3 = e.target.value;
                      updateCustomer(selectedcustomer);
                    }}
                  />
                </Grid>
                <Grid item sm={12} md={6}>
                  <TextField
                    label="City"
                    fullWidth
                    value={
                      selectedcustomer.address != undefined ? selectedcustomer.address.locality : ""
                    }
                    onChange={(e) => {
                      selectedcustomer.address == undefined
                        ? (selectedcustomer.address = {})
                        : null;
                      selectedcustomer.address.locality = e.target.value;
                      updateCustomer(selectedcustomer);
                    }}
                  />
                </Grid>
                <Grid item sm={12} md={3}>
                  <TextField
                    label="State"
                    fullWidth
                    value={
                      selectedcustomer.address != undefined
                        ? selectedcustomer.address.administrative_district_level_1
                        : ""
                    }
                    onChange={(e) => {
                      selectedcustomer.address == undefined
                        ? (selectedcustomer.address = {})
                        : null;
                      selectedcustomer.address.administrative_district_level_1 = e.target.value;
                      updateCustomer(selectedcustomer);
                    }}
                  />
                </Grid>
                <Grid item sm={12} md={3}>
                  <TextField
                    label="Zip"
                    fullWidth
                    value={
                      selectedcustomer.address != undefined
                        ? selectedcustomer.address.postal_code
                        : ""
                    }
                    onChange={(e) => {
                      selectedcustomer.address == undefined
                        ? (selectedcustomer.address = {})
                        : null;
                      selectedcustomer.address.postal_code = e.target.value;
                      updateCustomer(selectedcustomer);
                    }}
                  />
                </Grid> */}
              </>
            ) : null}
            <Grid item sm={12}>
              <MDButton
                fullWidth
                variant="outlined"
                color="primary"
                disabled={!allowContinue}
                onClick={() => processPevData()}
              >
                Next
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </MDBox>
  );
};
export default step2;
