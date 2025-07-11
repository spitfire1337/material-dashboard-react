import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { DateTimePickerComponent } from "@syncfusion/ej2-react-calendars";
import { useState, useEffect, useMemo } from "react";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import MDTypography from "components/MDTypography";
import { isNullOrUndefined } from "@syncfusion/ej2-base";

import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Divider,
  Grid,
  FormControlLabel,
  FormGroup,
  Checkbox,
  NativeSelect,
} from "@mui/material";
import vars from "../../../config";
const onPopupClose = (args) => {
  if (args.type === "Editor" && !isNullOrUndefined(args.data)) {
    console.log("Editor Data: ", args.data);
    //   let subjectElement = args.element.querySelector("#Summary");
    //   if (subjectElement) {
    //     args.data.Subject = subjectElement.value;
    //   }
    //   let statusElement = args.element.querySelector("#EventType");
    //   if (statusElement) {
    //     args.data.EventType = statusElement.value;
    //   }
    //   args.data.StartTime = startObj.current.value;
    //   args.data.EndTime = endObj.current.value;
    //   let descriptionElement = args.element.querySelector("#Description");
    //   if (descriptionElement) {
    //     args.data.Description = descriptionElement.value;
    //   }
  }
};

const filter = createFilterOptions();
const editorFooterTemplate = () => {
  return (
    <div id="event-footer">
      <div id="verify">
        <input type="checkbox" id="check-box" value="unchecked" />
        <label htmlFor="check-box" id="text">
          Verified
        </label>
      </div>
      <div id="right-button">
        <button id="Save" className="e-control e-btn e-primary" disabled data-ripple="true">
          Save
        </button>
        <button id="Cancel" className="e-control e-btn e-primary" data-ripple="true">
          Cancel
        </button>
      </div>
    </div>
  );
};

const onSaveButtonClick = (args) => {
  const data = {
    Id: args.data.Id,
    Subject: args.element.querySelector("#Subject").value,
    StartTime: args.element.querySelector("#StartTime").ej2_instances[0].value,
    EndTime: args.element.querySelector("#EndTime").ej2_instances[0].value,
    IsAllDay: args.element.querySelector("#IsAllDay").checked,
  };
  if (args.target.classList.contains("e-appointment")) {
    scheduleObj.current.saveEvent(data, "Save");
  } else {
    data.Id = scheduleObj.current.getEventMaxID();
    scheduleObj.current.addEvent(data);
  }
  scheduleObj.current.closeEditor();
};
const editorTemplate = (props, t) => {
  console.log("Editor props", props);
  const [customersSelection, setCustomersSelection] = useState([]);
  const [showCustForm, setShowCustForm] = useState(false);
  const [apptid, setApptId] = useState(0);
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [customers, setCustomers] = useState([]);
  const [pevSelection, setPEVSelection] = useState([]);
  const [allowContinue, setAllowContinue] = useState(false);
  const [pevBrand, setPEVBrand] = useState([]);
  const [showNewPev, setShowNewPev] = useState(false);
  const [brandDisable, setBrandDisable] = useState(true);
  const [newPev, setNewPev] = useState({ Brand: { name: "" }, Model: "", PevType: "EUC" });
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
      () => setValues({}),
    ];
  };
  let [selectedcustomer, setSelectedCustomer, emptyCustomer] = useForm({});
  const chooseCustomer = (cust) => {
    selectedcustomer = {};
    if (cust == null) {
      emptyCustomer();
      setShowCustForm(false);
    } else if (cust.id == 0) {
      //NEW CUSTOMER
      selectedcustomer.phone_number = "";
      selectedcustomer.email_address = "";
      selectedcustomer.given_name = "";
      selectedcustomer.family_name = "";
      if (Number.isNaN(parseInt(cust.inputValue))) {
        if (validateEmail(cust.inputValue)) {
          emptyCustomer();
          selectedcustomer.email_address = cust.inputValue;
        } else {
          emptyCustomer();
          let name = cust.inputValue.split(" ");
          selectedcustomer.given_name = name[0];
          if (name.length > 1) selectedcustomer.family_name = name[1];
        }
      } else {
        emptyCustomer();
        selectedcustomer.phone_number = cust.inputValue;
      }
      setSelectedCustomer(selectedcustomer);
      setShowCustForm(true);
    } else {
      let custData = customers.filter((mycust) => mycust.id == cust.id)[0];
      setSelectedCustomer(custData);
      setShowCustForm(true);
    }
  };

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  useEffect(() => {
    if (props !== undefined) {
      if (props.start != undefined) {
        setStartTime(new Date(props.start));
      }
      if (props.end != undefined) {
        setEndTime(new Date(props.end));
      }
      if (props._id != undefined) {
        setApptId(props._id);
      }
    }

    const fetchData = async () => {
      let response = await fetch(`${vars.serverUrl}/square/getMyData?action=getCustomers`, {
        credentials: "include",
      });
      if (response.status == 200) {
        let res = await response.json();
        if (res.res === 200) {
          const useableCustomers = res.data.filter(
            (cust) => cust.email_address != undefined || cust.phone_number != undefined
          );
          setCustomers(useableCustomers);
          let custList = [];
          useableCustomers.map((cust) => {
            custList.push({
              label: `${cust.given_name != undefined ? `${cust.given_name} ` : ""}
                    ${cust.family_name != undefined ? `${cust.family_name}` : ""}
                 ${cust.email_address != undefined ? ` | ${cust.email_address}` : ""} ${
                cust.phone_number != undefined ? ` | ${cust.phone_number}` : ""
              }`,
              id: cust.id,
            });
          });
          setCustomersSelection(custList);
          emptyCustomer();
          //setShowCustForm(false);
        }
      }

      response = await fetch(`${vars.serverUrl}/square/getMyData?action=getPEVS`, {
        credentials: "include",
      });
      if (response.status == 200) {
        let res = await response.json();
        if (res.res === 200) {
          setModels(res.data);
          function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
          }
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
        }
      }
    };
    fetchData();
  }, []);

  const choosePevBrand = (pev) => {
    if (pev == null) {
      setPEVBrand(0);
      setShowNewPev(false);
    } else if (pev.id == 0) {
      //NEW PEV
      setPEVBrand(1);
      //setSelectedCustomer({});
      setShowNewPev(true);
    } else {
      let pevData = pevSelection.filter((mypev) => mypev._id == pev.id)[0];
      setShowNewPev(false);
      setPEVBrand(pev.id);
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
  console.log("Event props", props);
  return props !== undefined ? (
    <div className="editorHolder">
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Customer details
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <input
            format="dd/MM/yy hh:mm a"
            type="hidden"
            id="end"
            data-name="end"
            value={new Date(props.end || props.end)}
          />
          <input
            format="dd/MM/yy hh:mm a"
            type="hidden"
            id="start"
            data-name="start"
            value={new Date(props.start || props.start)}
          />
          <Autocomplete
            onChange={(event, newValue) => {
              chooseCustomer(newValue);
            }}
            disablePortal
            name="customer"
            options={customersSelection}
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
            fullWidth
            renderInput={(params) => <TextField {...params} label="Customer" />}
          />
        </FormControl>
        {showCustForm == true ? (
          <FormControl fullWidth>
            <Divider fullWidth></Divider>
            <Grid container spacing={1} marginTop={1}>
              <Grid item md={6} sm={12}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={
                    selectedcustomer.given_name != undefined ? selectedcustomer.given_name : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.given_name = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item md={6} sm={12}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={
                    selectedcustomer.family_name != undefined ? selectedcustomer.family_name : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.family_name = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  label="Email address"
                  fullWidth
                  value={
                    selectedcustomer.email_address != undefined
                      ? selectedcustomer.email_address
                      : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.email_address = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  label="Phone number"
                  fullWidth
                  value={
                    selectedcustomer.phone_number != undefined ? selectedcustomer.phone_number : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.phone_number = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
            </Grid>
          </FormControl>
        ) : null}
        <Divider fullWidth></Divider>
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
                </>
              ) : null}
            </Grid>
          </FormControl>
        </MDTypography>
      </MDTypography>
    </div>
  ) : (
    <div></div>
  );
};

export { editorTemplate, onPopupClose, editorFooterTemplate };
