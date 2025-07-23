/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { useState, useEffect, useMemo, useRef } from "react";

// @mui material components
import vars from "../../config";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { onPopupClose } from "./components/editAppt";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

import moment from "moment";
import "../../schedule.css";
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
import MDTypography from "components/MDTypography";

// /import "@zach.codes/react-calendar/dist/calendar-tailwind.css";
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-react-schedule/styles/material.css";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";
import { Internationalization } from "@syncfusion/ej2-base";
import MDButton from "components/MDButton";
const localizer = momentLocalizer(moment);
// eslint-disable-next-line react/prop-types
function Availability({ globalFunc }) {
  const [customersSelection, setCustomersSelection] = useState([]);
  const scheduleObj = useRef(null);
  //  const [customersSelection, setCustomersSelection] = useState([]);
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
  const instance = new Internationalization();
  let redirect = useNavigate();
  const [appointments, setAppointments] = useState([]);
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
  const { defaultDate } = useMemo(
    () => ({
      defaultDate: new Date(),
    }),
    []
  );
  const getAppointments = async () => {
    const response = await fetch(`${vars.serverUrl}/api/appointments`, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const res = await response.json();
    let myappts = [];
    if (res.res == 200) {
      res.data.map((appointments) => {
        let appt = {
          Title: appointments.title,
          start: new Date(appointments.start),
          end: new Date(appointments.end),
        };
        myappts.push(appt);
      });
      setAppointments(res.data);
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      showSnackBar("error", "Unauthorized");
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);
  const fieldsData = {
    id: "_id",
    subject: { name: "title" },
    startTime: { name: "start" },
    endTime: { name: "end" },
    SecondaryColor: { name: "SecondaryColor" },
  };
  const getTimeString = (value) => {
    return instance.formatDate(value, { skeleton: "hm" });
  };
  const eventTemplate = (props) => {
    const secondaryColor = { background: props.PrimaryColor };
    const primaryColor_1 = { background: props.PrimaryColor };
    const primaryColor_2 = { background: props.PrimaryColor };
    return (
      <div className="template-wrap" style={secondaryColor}>
        <div className="subject" style={primaryColor_1}>
          {props.title}
        </div>
        <div className="time" style={primaryColor_2}>
          Time: {moment(props.start).format("hh:mm A")} - {moment(props.end).format("hh:mm A")}
        </div>
      </div>
    );
  };
  const eventSettings = {
    dataSource: appointments,
    fields: fieldsData,
    template: eventTemplate,
    allowDeleting: false,
    allowAdding: false,
  };
  const editorHeaderTemplate = (props) => {
    return (
      <div id="event-header">
        {props !== undefined ? (
          props.Subject ? (
            <div>{props.Subject}</div>
          ) : (
            <div>Create Appointment</div>
          )
        ) : (
          <div></div>
        )}
      </div>
    );
  };

  useEffect(() => {
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

  const editorTemplate = (props, t) => {
    console.log("Editor props", props);
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
                      selectedcustomer.phone_number != undefined
                        ? selectedcustomer.phone_number
                        : ""
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
        <Grid container spacing={1} marginTop={1}>
          <Grid item md={6}>
            <MDButton onClick={() => onSaveButtonClick()}>Save</MDButton>
          </Grid>
        </Grid>
      </div>
    ) : (
      <div></div>
    );
  };

  const editorFooterTemplate = () => {
    return <div id="event-footer"></div>;
  };
  const onPopupOpen = (args) => {
    if (args.type === "Editor") {
    }
  };

  const onSaveButtonClick = () => {
    console.log("Save button clicked");
    scheduleObj.current.closeEditor();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar globalFunc={globalFunc} />
      <MDTypography variant="h6" fontWeight="medium" mt={3} mb={2}>
        NOTE: Apointment scheduling is currently not functional!! Setting availability however is
        functional
      </MDTypography>
      <ScheduleComponent
        ref={scheduleObj}
        width="100%"
        height="75vh"
        eventSettings={eventSettings}
        editorTemplate={editorTemplate.bind(this)}
        editorFooterTemplate={editorFooterTemplate.bind(this)}
        popupOpen={onPopupOpen.bind(this)}
        popupClose={onPopupClose.bind(this)}
      >
        <ViewsDirective>
          <ViewDirective option="Day" startHour="10:00" endHour="18:00" />
          <ViewDirective option="Week" startHour="10:00" endHour="18:00" />
          <ViewDirective option="Month" showWeekend={true} />
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
      </ScheduleComponent>
      {/* </Grid>
      </Grid> */}
      <Footer />
    </DashboardLayout>
  );
}

export default Availability;
