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

import { useState, useEffect } from "react";
import vars from "../../config";

//Global
import { globalFuncs } from "../../context/global";
import { useLoginState } from "../../context/loginContext";

// @mui material components
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
// @mui icons
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  TextField,
  Grid,
} from "@mui/material";
// Custom styles for the Configurator
import ConfiguratorRoot from "examples/Configurator/ConfiguratorRoot";
// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setOpenConfigurator,
  setTransparentSidenav,
  setWhiteSidenav,
  setFixedNavbar,
  setDarkMode,
} from "context";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

// eslint-disable-next-line react/prop-types
function Configurator() {
  const [controller, dispatch] = useMaterialUIController();
  const { openConfigurator, fixedNavbar, darkMode } = controller;
  const [disabled, setDisabled] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [eightXelevenPrinter, seteightXelevenPrinter] = useState();
  const [twoXonePrinter, settwoXonePrinter] = useState();
  const [businessHours, setBusinessHours] = useState([]);
  const [myAvailability, setMyAvailabilty] = useState([]);
  const { setSnackBar } = globalFuncs();
  const { setLoginState } = useLoginState();

  // Use the useEffect hook to change the button state for the sidenav type based on window size.
  useEffect(() => {
    const fetchPrinters = async () => {
      const response = await fetch(`${vars.serverUrl}/settings/getPrinters`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        let custList = [];
        res.data.map((printer) => {
          custList.push({
            label: `${printer.name}`,
            id: printer.name,
          });
        });
        setAvailablePrinters(custList);
      }

      const myPrintersresponse = await fetch(`${vars.serverUrl}/settings/getSetPrinters`, {
        credentials: "include",
      });
      const printerres = await myPrintersresponse.json();
      if (printerres.res === 200) {
        seteightXelevenPrinter(printerres.data.eightxelev.printerName);
        settwoXonePrinter(printerres.data.twoxone.printerName);
      }
    };
    const fetchBusinessHours = async () => {
      const response = await fetch(`${vars.serverUrl}/settings/getBusinesshours`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setBusinessHours(res.data);
      } else if (res.res === 401) {
        setLoginState(false);
        setSnackBar({
          type: "error",
          title: "Server error occured",
          message: "Unauthorized",
          show: true,
          icon: "error",
        });
      }
    };
    const fetchMyAvailability = async () => {
      const response = await fetch(`${vars.serverUrl}/settings/getMyAvailability`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setMyAvailabilty(res.data);
      } else if (res.res === 401) {
        setLoginState(false);
        setSnackBar({
          type: "error",
          title: "Server error occured",
          message: "Unauthorized",
          show: true,
          icon: "error",
        });
      }
    };
    fetchMyAvailability();
    fetchPrinters();
    fetchBusinessHours();
    // A function that sets the disabled state of the buttons for the sidenav type.
    function handleDisabled() {
      return window.innerWidth > 1200 ? setDisabled(false) : setDisabled(true);
    }

    // The event listener that's calling the handleDisabled function when resizing the window.
    window.addEventListener("resize", handleDisabled);

    // Call the handleDisabled function to set the state with the initial value.
    handleDisabled();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleDisabled);
  }, []);

  const handleCloseConfigurator = () => setOpenConfigurator(dispatch, false);
  const handleTransparentSidenav = () => {
    setTransparentSidenav(dispatch, true);
    setWhiteSidenav(dispatch, false);
  };
  const handleWhiteSidenav = () => {
    setWhiteSidenav(dispatch, true);
    setTransparentSidenav(dispatch, false);
  };
  const handleDarkSidenav = () => {
    setWhiteSidenav(dispatch, false);
    setTransparentSidenav(dispatch, false);
  };
  const handleFixedNavbar = () => setFixedNavbar(dispatch, !fixedNavbar);
  const handleDarkMode = () => setDarkMode(dispatch, !darkMode);

  // sidenav type buttons styles
  const sidenavTypeButtonsStyles = ({
    functions: { pxToRem },
    palette: { white, dark, background },
    borders: { borderWidth },
  }) => ({
    height: pxToRem(39),
    background: darkMode ? background.sidenav : white.main,
    color: darkMode ? white.main : dark.main,
    border: `${borderWidth[1]} solid ${darkMode ? white.main : dark.main}`,

    "&:hover, &:focus, &:focus:not(:hover)": {
      background: darkMode ? background.sidenav : white.main,
      color: darkMode ? white.main : dark.main,
      border: `${borderWidth[1]} solid ${darkMode ? white.main : dark.main}`,
    },
  });

  const getSelectedItem = () => {
    const item = this.props.options.find((opt) => {
      if (opt.value == this.props.selectedValue) return opt;
    });
    return item || {};
  };

  const updateBusinessHours = async (day, start, end, closed) => {
    let updatedHours = [...businessHours];
    let hours = updatedHours.find((h) => h.day === day);
    //First remove old hours for the day
    //
    //Then add the new hours
    if (hours) {
      hours.hours.start = closed ? null : start;
      hours.hours.end = closed ? null : end;
      hours.closed = closed || false;
      updatedHours = updatedHours.filter((h) => h.day !== day);
      updatedHours.push(hours);
      setBusinessHours(updatedHours);
    } else {
      // If no hours exist for the day, create a new entry
      updatedHours.push({
        day: day,
        hours: {
          start: closed ? null : start,
          end: closed ? null : end,
        },
        closed: closed || false,
      });
      setBusinessHours(updatedHours);
    }
  };

  const savePrinters = async () => {
    const response = await fetch(`${vars.serverUrl}/settings/saveConfig`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eight: eightXelevenPrinter,
        two: twoXonePrinter,
        businessHours: businessHours,
      }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res == 200) {
      setSnackBar({
        type: "success",
        title: "Config saved",
        message: "Configuration settings have been successfully saved.",
        show: true,
        icon: "check_circle",
      });
      return null;
    } else if (res.res == 401) {
      setLoginState(false);
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Unauthorized",
        show: true,
        icon: "error",
      });
    }
  };

  const saveAvailability = async () => {
    const response = await fetch(`${vars.serverUrl}/settings/setMyAvailability`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        availability: myAvailability,
      }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res == 200) {
      setSnackBar({
        type: "success",
        title: "Availability saved",
        message: "Your availability has been successfully saved.",
        show: true,
        icon: "check_circle",
      });
      return null;
    } else if (res.res == 401) {
      setLoginState(false);
      setSnackBar({
        type: "error",
        title: "Server error occured",
        message: "Unauthorized",
        show: true,
        icon: "error",
      });
    }
  };

  const updateMyAvailability = async (day, checked) => {
    const newAvailability = [...myAvailability];
    if (checked) {
      // If checked, add the day to availability
      if (!newAvailability.includes(day)) {
        newAvailability.push(day);
      }
    } else {
      // If unchecked, remove the day from availability
      const index = newAvailability.indexOf(day);
      if (index > -1) {
        newAvailability.splice(index, 1);
      }
    }
    setMyAvailabilty(newAvailability);
  };

  // sidenav type active button styles
  const sidenavTypeActiveButtonStyles = ({
    functions: { pxToRem, linearGradient },
    palette: { white, gradients, background },
  }) => ({
    height: pxToRem(39),
    background: darkMode ? white.main : linearGradient(gradients.dark.main, gradients.dark.state),
    color: darkMode ? background.sidenav : white.main,

    "&:hover, &:focus, &:focus:not(:hover)": {
      background: darkMode ? white.main : linearGradient(gradients.dark.main, gradients.dark.state),
      color: darkMode ? background.sidenav : white.main,
    },
  });

  return (
    <ConfiguratorRoot variant="permanent" ownerState={{ openConfigurator }}>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={4}
        pb={0.5}
        px={3}
      >
        <MDBox>
          <MDTypography variant="h5">CRM Settings</MDTypography>
          <MDTypography variant="body2" color="text">
            Adjust dashboard settings.
          </MDTypography>
        </MDBox>

        <Icon
          sx={({ typography: { size }, palette: { dark, white } }) => ({
            fontSize: `${size.lg} !important`,
            color: darkMode ? white.main : dark.main,
            stroke: "currentColor",
            strokeWidth: "2px",
            cursor: "pointer",
            transform: "translateY(5px)",
          })}
          onClick={handleCloseConfigurator}
        >
          close
        </Icon>
      </MDBox>
      <Divider />

      <MDBox pt={0.5} pb={3} px={3}>
        <MDBox>
          <MDTypography variant="h6">Business hours</MDTypography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MDBox mb={2} mt={2}>
              <Grid container spacing={1}>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Sun</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Sunday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Sunday")?.hours.end,
                        businessHours.find((x) => x.day == "Sunday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Sunday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Sunday",
                        businessHours.find((x) => x.day == "Sunday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Sunday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Sunday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Sunday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Sunday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Mon</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Monday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Monday")?.hours.end,
                        businessHours.find((x) => x.day == "Monday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Monday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Monday",
                        businessHours.find((x) => x.day == "Monday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Monday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Monday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Monday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Monday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Tues</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Tuesday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Tuesday")?.hours.end,
                        businessHours.find((x) => x.day == "Tuesday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Tuesday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Tuesday",
                        businessHours.find((x) => x.day == "Tuesday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Tuesday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Tuesday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Tuesday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Tuesday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Wend</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Wednesday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Wednesday")?.hours.end,
                        businessHours.find((x) => x.day == "Wednesday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Wednesday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Wednesday",
                        businessHours.find((x) => x.day == "Wednesday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Wednesday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Wednesday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Wednesday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Wednesday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Thurs</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Thursday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Thursday")?.hours.end,
                        businessHours.find((x) => x.day == "Thursday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Thursday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Thursday",
                        businessHours.find((x) => x.day == "Thursday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Thursday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Thursday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Thursday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Thursday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Fri</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Friday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Friday")?.hours.end,
                        businessHours.find((x) => x.day == "Friday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Friday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Friday",
                        businessHours.find((x) => x.day == "Friday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Friday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Friday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Friday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Friday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={2}>
                  <MDTypography variant="caption">Sat</MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Saturday",
                        e.target.value,
                        businessHours.find((x) => x.day == "Saturday")?.hours.end,
                        businessHours.find((x) => x.day == "Saturday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Saturday")?.hours.start || "00:00"}
                  />
                </Grid>
                <Grid item xs={4}>
                  <input
                    aria-label="Time"
                    type="time"
                    label="Open"
                    onChange={(e) => {
                      updateBusinessHours(
                        "Saturday",
                        businessHours.find((x) => x.day == "Saturday")?.hours.start,
                        e.target.value,
                        businessHours.find((x) => x.day == "Saturday")?.closed
                      );
                    }}
                    value={businessHours.find((x) => x.day == "Saturday")?.hours.end || "00:00"}
                  />
                </Grid>
                <Grid item xs={2}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={businessHours.find((x) => x.day == "Saturday")?.closed || false}
                        />
                      }
                      onChange={(e) => {
                        updateBusinessHours("Saturday", null, null, e.target.checked);
                      }}
                      label="Closed"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </MDBox>
          </LocalizationProvider>
        </MDBox>
        <MDBox>
          <MDTypography variant="h6">Printers</MDTypography>

          <MDBox mb={2} mt={2}>
            <Autocomplete
              onChange={(event, newValue) => {
                seteightXelevenPrinter(newValue.label);
              }}
              disablePortal
              options={availablePrinters}
              fullWidth
              value={availablePrinters.find((v) => v.label === eightXelevenPrinter) || {}}
              renderInput={(params) => <TextField {...params} label="8 x 11 Printer" />}
            />
          </MDBox>
          <MDBox mb={2}>
            <Autocomplete
              onChange={(event, newValue) => {
                settwoXonePrinter(newValue.label);
              }}
              disablePortal
              options={availablePrinters}
              value={availablePrinters.find((v) => v.label === twoXonePrinter) || {}}
              fullWidth
              renderInput={(params) => <TextField {...params} label="2.25 x 1.25 Printer" />}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDButton
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => {
                savePrinters();
              }}
            >
              Save
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </ConfiguratorRoot>
  );
}

export default Configurator;
