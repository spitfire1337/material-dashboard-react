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

// react-github-btn
import GitHubButton from "react-github-btn";

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import MDSnackbar from "components/MDSnackbar";
import Notification from "components/Notifications";
// @mui icons
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

// Material Dashboard 2 React components
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
  setSidenavColor,
  setDarkMode,
} from "context";

// eslint-disable-next-line react/prop-types
function Configurator({ globalFunc }) {
  const [controller, dispatch] = useMaterialUIController();
  const {
    openConfigurator,
    fixedNavbar,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [disabled, setDisabled] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [eightXelevenPrinter, seteightXelevenPrinter] = useState();
  const [twoXonePrinter, settwoXonePrinter] = useState();

  const sidenavColors = ["primary", "dark", "info", "success", "warning", "error"];

  const { showSnackBar, RenderSnackbar } = Notification();

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
    fetchPrinters();
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

  const savePrinters = async () => {
    const response = await fetch(`${vars.serverUrl}/settings/SetPrinters`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eight: eightXelevenPrinter, two: twoXonePrinter }),
      credentials: "include",
    });
    const res = await response.json();
    if (res.res == 200) {
      showSnackBar("success", "Printer config saved");
      return null;
    } else if (res.res == 401) {
      globalFunc.setLoggedIn(false);
      showSnackBar("error", "Unauthorized");
    }
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
        <RenderSnackbar />
      </MDBox>
    </ConfiguratorRoot>
  );
}

export default Configurator;
