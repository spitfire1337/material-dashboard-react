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

import { useState, useEffect, useMemo } from "react";
import "material-icons/iconfont/material-icons.css";
// Vars
import vars from "./config";
// react-router components
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

import LocationSelect from "./layouts/LocationSelect";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import SignIn from "layouts/authentication/sign-in";
import Square from "layouts/authentication/square_setup";
import Cookies from "universal-cookie";
// Images
import brandWhite from "assets/images/logos/Logo-Dark.png";
import brandDark from "assets/images/logos/Logo-Light.png";
import { MyLocation } from "@mui/icons-material";
import MDSnackbar from "components/MDSnackbar";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Modal, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import "react-barcode-scanner/polyfill";
import MDButton from "components/MDButton";
import Loading from "components/loading";
import "./scanner.css";
import "./assets/style.css";
import MDTypography from "components/MDTypography";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
  maxWidth: "75vh",
};
const style2 = {
  height: "75vh",
  p: 4,
  borderRadius: "25px",
};
//import { DEFAULT_CONSTRAINTS } from "react-zxing/lib/";
export function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  } else {
    begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1) {
      end = dc.length;
    }
  }
  // because unescape has been deprecated, replaced with decodeURI
  //return unescape(dc.substring(begin + prefix.length, end));
  return decodeURI(dc.substring(begin + prefix.length, end));
}

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const [isLoggedin, setLoggedIn] = useState(false);
  const [isSquare, setSquare] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [locations, setLocations] = useState({ locations: [] });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const [barcodeResult, setbarcodeResult] = useState("");
  const [barcodeScanned, setbarcodeScanned] = useState(false);
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const cookies = new Cookies(null, { path: "/" });
  // Cache for the rtl
  const [successSB, setSuccessSB] = useState(false);
  const [successSBText, setSuccessSBText] = useState("");
  const [errorSB, setErrorSB] = useState(false);
  const [errorSBText, setErrorSBText] = useState("");
  const [user, setUser] = useState({});
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNew, setWhatsNew] = useState("");
  const closeSuccessSB = () => setSuccessSB(false);
  const closeErrorSB = () => setErrorSB(false);
  let redirect = useNavigate();
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);
  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const doSearch = (e, val) => {
    e.preventDefault();
    console.log("Search val", e);
  };

  // Open sidenav when mouse enter on mini sidenav
  const checkLogin = async () => {
    if (!isLoggedin) {
      const response = await fetch(`${vars.serverUrl}/auth/authCheck`, {
        method: "GET",
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 401) {
        setLoading(false);
        setLoggedIn(false);
      } else {
        setUser(res.user);
        setLoading(false);
        setLoggedIn(true);
      }
    }
  };

  const renderSuccessSB = (
    <MDSnackbar
      color="success"
      icon="check"
      title="Success"
      content={successSBText}
      open={successSB}
      onClose={closeSuccessSB}
      close={closeSuccessSB}
      bgWhite
    />
  );

  const renderErrorSB = (
    <MDSnackbar
      color="error"
      icon="warning"
      title="Error"
      content={errorSBText}
      open={errorSB}
      onClose={closeErrorSB}
      close={closeErrorSB}
      bgWhite
    />
  );

  const renderWhatsNew = (
    <Dialog open={showWhatsNew}>
      <DialogTitle>Whats New!</DialogTitle>
      <DialogContent
        sx={{
          paddingTop: "2px",
          marginLeft: "10px",
          marginRight: "10px",
          paddingBottom: "5px",
          maxWidth: "75vh",
          minWidth: "50vh",
          minHeight: "30vh",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <MDTypography variant="body2" color="text">
          {parse(whatsNew)}
        </MDTypography>
      </DialogContent>
      <DialogActions>
        <MDButton color="success" onClick={() => setShowWhatsNew(false)} autoFocus>
          Close
        </MDButton>
      </DialogActions>
    </Dialog>
  );
  let globalFunc = {
    setLoggedIn: setLoggedIn,
    setSuccessSB: setSuccessSB,
    setSuccessSBText: setSuccessSBText,
    setErrorSB: setErrorSB,
    setErrorSBText: setErrorSBText,
    user: user,
    setShowVideoFeed: setShowVideoFeed,
  };

  const checkSquare = async () => {
    if (isLoggedin) {
      const response = await fetch(`${vars.serverUrl}/square/checkconfig`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 401) {
        setLoading(false);
        setSquare(false);
      } else {
        setLoading(false);
        setSquare(true);
      }
    }
  };

  const getWhatsnew = async () => {
    if (isLoggedin) {
      const response = await fetch(`${vars.serverUrl}/api/whatsNew`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        if (res.new) {
          setWhatsNew(res.data);
          setShowWhatsNew(true);
        }
      }
    }
  };

  const getInitData = async () => {
    if (isLoggedin) {
      const response = await fetch(`${vars.serverUrl}/square/getSquare?action=getInitData`, {
        credentials: "same-origin",
      });
      const res = await response.json();
      if (res.res === 200) {
        setCustomers(res.customers);
        setLocations(res.locations);
        setLoading(false);
      }
      if (location !== undefined) {
        const response = await fetch(`${vars.serverUrl}/square/getSquare?action=getSales`, {
          credentials: "include",
        });
        const res = await response.json();
        if (res.res === 200) {
          setSaless(res.sales);
          setLoading(false);
        }
      }
    } else {
      setLoading(false);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    if (!isLoggedin) {
      checkLogin();
    } else if (!isSquare) {
      checkSquare();
    } else {
      setLocation(cookies.get("mylocation"));
      getWhatsnew();
      getInitData();
    }
  }, [isLoggedin, isSquare, location]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    checkLogin();
    getWhatsnew();
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const barcodeCapture = (barcode) => {
    //setbarcodeResult(barcode);
    let barcodeType = barcode.split("-").length > 0 ? barcode.split("-")[0] : null;
    let barcodeValue = barcode.split("-").length > 0 ? barcode.split("-")[1] : null;
    if (barcodeType == "repair") {
      setShowVideoFeed(false);
      return redirect(`/repairs/${barcodeValue}`, { replace: true });
    } else {
      setErrorSBText("Invalid barcode, please try again");
      setErrorSB(true);
      return null;
    }
    //null
  };
  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  const MyScanner = () => {
    return (
      <Modal
        open={showVideoFeed}
        onClose={() => {
          setShowVideoFeed(false);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <MDBox sx={style}>
          <Scanner
            classNames={{
              container: "scanner",
              video: "video",
            }}
            onScan={(result) => {
              barcodeCapture(result[0].rawValue);
            }}
          />
          {/* <BarcodeScanner
            width="100%"
            height="75%"
            options={{ formats: ["code_128"] }}
            onCapture={(barcode) => {
              barcodeCapture(barcode);
            }}
          /> */}
          <MDButton
            sx={{ marginTop: "2px" }}
            fullWidth
            color="secondary"
            onClick={() => {
              setShowVideoFeed(false);
            }}
          >
            Close
          </MDButton>
        </MDBox>
      </Modal>
    );
  };

  if (loading) {
    return (
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <Loading />
        {renderSuccessSB}
        {renderErrorSB}
      </ThemeProvider>
    );
  } else if (!isLoggedin) {
    return (
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <SignIn />
        {renderSuccessSB}
        {renderErrorSB}
      </ThemeProvider>
    );
  } else if (!isSquare) {
    return (
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <Square />
      </ThemeProvider>
    );
  } else {
    return direction === "rtl" ? (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
          <CssBaseline />
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="PEV Connection, LLC"
                routes={routes(globalFunc)}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
                doSearch={doSearch}
              />
              <Configurator
                globalFunc={globalFunc}
                // setSuccessSB={setSuccessSB}
                // setSuccessSBText={setSuccessSBText}
                // closeSuccessSB={closeSuccessSB}
              />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {getRoutes(routes(globalFunc))}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          {renderSuccessSB}
          {renderErrorSB}
          {renderWhatsNew}
        </ThemeProvider>
      </CacheProvider>
    ) : (
      <ThemeProvider theme={darkMode ? themeDark : theme}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="PEV Connection, LLC"
              routes={routes(globalFunc)}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              doSearch={doSearch}
            />
            <Configurator
              globalFunc={globalFunc}
              // setSuccessSB={setSuccessSB}
              // setSuccessSBText={setSuccessSBText}
              // closeSuccessSB={closeSuccessSB}
            />
            {renderSuccessSB}
            {renderErrorSB}
            {renderWhatsNew}
            {configsButton}
          </>
        )}
        {layout === "vr" && (
          <Configurator
            globalFunc={globalFunc}
            // setSuccessSB={setSuccessSB}
            // setSuccessSBText={setSuccessSBText}
            // closeSuccessSB={closeSuccessSB}
          />
        )}
        {showVideoFeed && <MyScanner />}
        {/* {location == null && <LocationSelect locations={locations.locations} />} */}
        <Routes>
          {getRoutes(routes(globalFunc))}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    );
  }
}
