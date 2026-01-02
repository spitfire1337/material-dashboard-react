import { useState, useEffect, useMemo } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Divider,
  Modal,
  Grid,
  FormControlLabel,
  FormGroup,
  Checkbox,
  NativeSelect,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

import vars from "../../../config";

const filter = createFilterOptions();
const step3 = ({
  globalFunc,
  newConsignmentData,
  updateConsignmentData,
  setrepairID,
  nextRepairStep,
}) => {
  const [pevSelection, setPEVSelection] = useState([]);
  const [allowContinue, setAllowContinue] = useState(false);
  const [pevBrand, setPEVBrand] = useState([]);
  const [showNewPev, setShowNewPev] = useState(false);
  const [brandDisable, setBrandDisable] = useState(true);
  const [newPev, setNewPev] = useState({ Brand: { name: "" }, Model: "", PevType: "EUC" });
  const [mybrands, setBrands] = useState([]);
  const [mymodels, setModels] = useState([]);
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
          let brands = [];
          unique.map((brand) => {
            brands.push({ id: brand.Brand._id, label: brand.Brand.name });
          });
          setBrands(brands);
          let custList = [{ label: "New PEV", id: 0 }];
          res.data.map((pev) => {
            custList.push({
              label: `${pev.Model}`,
              id: pev._id,
            });
          });
          setPEVSelection(res.data);
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
    let newData = { ...newPev };
    newData.Brand == undefined ? (newPev.Brand = {}) : null;
    newData.Brand._id = pev != null ? pev.id : "";
    newData.Brand.name = pev != null ? (pev.id == 0 ? pev.inputValue : pev.label) : "";
    pev != "" && pev != undefined && pev.id != undefined && pev != "" ? newPevData(newData) : null;
    console.log("PEV SELECTED", newPev);
    if (pev == null) {
      setPEVBrand(0);
      setAllowContinue(false);
      setShowNewPev(false);
    } else if (pev.id == 0) {
      //NEW PEV
      setPEVBrand(1);
      setAllowContinue(false);
      let models = [];
      setModels(models);
      //setSelectedCustomer({});
      setShowNewPev(true);
    } else {
      //Existing brand
      let pevData = pevSelection.filter((mypev) => mypev.Brand._id == pev.id);
      let models = [];
      console.log("PEV DATA", pevData);
      pevData.map((model) => {
        models.push({ id: model._id, label: model.Model, PevType: model.PevType });
      });
      setModels(models);
      setShowNewPev(true);
      console.log("Brand ID", pev.id);
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
      const response = await fetch(`${vars.serverUrl}/repairs/createRepair`, {
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

  const processPevData = async () => {
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
          let newData = { ...newPev };
          newData.Brand._id = json.data;
          setNewPev(newData);
          let newpevresp = await fetch(`${vars.serverUrl}/repairs/createPEV`, {
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
            let newRepairData = { ...newConsignmentData };
            newRepairData.itemData.name = `${newPev.Brand.name} ${newPev.Model}`;
            updateConsignmentData(newRepairData);
            nextRepairStep(4);
            //createRepair(newRepairData);
          } else {
            globalFunc.setErrorSBText("An error occured while saving data, please try again");
            globalFunc.setErrorSB(true);
          }
        } else {
          globalFunc.setErrorSBText("An error occured while saving data, please try again");
          globalFunc.setErrorSB(true);
        }
      } catch (e) {
        globalFunc.setErrorSBText("An error occured while saving data, please try again");
        globalFunc.setErrorSB(true);
      }
    } else if (pevBrand == 1) {
      //
      let newRepairData = { ...repairData };
      let newData = { ...newPev };
      newData.Brand._id = newPev.Brand._id;
      let newpevresp = await fetch(`${vars.serverUrl}/repairs/createPEV`, {
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
        let newRepairData = { ...newConsignmentData };
        newRepairData.itemData.name = `${newPev.Brand.name} ${newPev.Model}`;
        updateConsignmentData(newRepairData);
        nextRepairStep(4);
      } else {
        globalFunc.setErrorSBText("An error occured while saving data, please try again");
        globalFunc.setErrorSB(true);
      }
    } else {
      let newRepairData = { ...newConsignmentData };
      newRepairData.itemData.name = `${newPev.Brand.name} ${newPev.Model}`;
      updateConsignmentData(newRepairData);
      nextRepairStep(4);
    }
  };
  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        PEV Details
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Autocomplete
            onChange={(event, newValue) => {
              choosePevBrand(newValue);
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue !== "") {
                let finder = mybrands.find(
                  (element) => element.label.toLowerCase() === params.inputValue.toLowerCase()
                );
                if (
                  (params.inputValue.toLowerCase() !== "generic" ||
                    params.inputValue.toLowerCase() !== "custom") &&
                  finder == undefined
                ) {
                  console.log("FINDER", finder);
                  filtered.unshift({
                    inputValue: params.inputValue,
                    label: `Add "${params.inputValue}"`,
                    id: 0,
                  });
                }
              }
              return filtered;
            }}
            disablePortal
            options={mybrands}
            //getOptionDisabled={(option) => !!brands.find((element) => element.label === "Generic")}
            getOptionDisabled={(option) =>
              option.label.toLowerCase() === "generic" || option.label.toLowerCase() === "custom"
            }
            fullWidth
            renderInput={(params) => <TextField {...params} label="Select Brand" />}
          />
        </FormControl>

        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            {showNewPev == true ? (
              <>
                {/* <Grid item sm={12}>
                  <MDTypography>Please provide as many fields as possible.</MDTypography>
                </Grid> */}
                <Grid item sm={12}>
                  <Autocomplete
                    onChange={(event, newValue) => {
                      let newData = { ...newPev };
                      newValue.id != 0 ? setPEVBrand(newValue.id) : setPEVBrand(1);
                      newData.Model = newValue.id == 0 ? newValue.inputValue : newValue.label;
                      newValue != "" &&
                      newValue != undefined &&
                      newValue.id != undefined &&
                      newValue != ""
                        ? newPevData(newData)
                        : null;
                      console.log("PEV SELECTED", newData);
                      // let newData = { ...newPev };
                      // newData.Brand == undefined ? (newPev.Brand = {}) : null;
                      // newData.Brand._id = newValue != null ? newValue.id : "";
                      // newData.Brand.name =
                      //   newValue != null ? (newValue.id == 0 ? "" : newValue.label) : "";
                      // newValue != "" &&
                      // newValue != undefined &&
                      // newValue.id != undefined &&
                      // newValue != ""
                      //   ? newPevData(newData)
                      //   : null;
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      if (params.inputValue !== "") {
                        filtered.unshift({
                          inputValue: params.inputValue,
                          label: `Add "${params.inputValue}"`,
                          id: 0,
                        });
                      }
                      return filtered;
                    }}
                    disablePortal
                    options={mymodels}
                    fullWidth
                    renderInput={(params) => <TextField {...params} label="Model" />}
                  />
                </Grid>
                {/* <Grid item md={6} sm={12}>
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
                </Grid> */}
                <Grid item sm={12}>
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
    </>
  );
};
export default step3;
