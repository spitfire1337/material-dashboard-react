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
//Global elements
import { globalFuncs } from "./context/global";
import { useLoginState } from "./context/loginContext";

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

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";
import SignIn from "layouts/authentication/sign-in";
import Cookies from "universal-cookie";
// Images
import brandWhite from "assets/images/logos/Logo-Dark.png";
import brandDark from "assets/images/logos/Logo-Light.png";
import MDSnackbar from "components/MDSnackbar";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Modal, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import "react-barcode-scanner/polyfill";
import MDButton from "components/MDButton";
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
  const { loginState, setLoginState, checkLogin } = useLoginState();
  const { setSnackBar, RenderSb, LoadDialog, showVideoFeed } = globalFuncs();

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
  const [isSquare, setSquare] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState({ locations: [] });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const cookies = new Cookies(null, { path: "/" });
  // Cache for the rtl
  const [successSB, setSuccessSB] = useState(false);
  const [successSBText, setSuccessSBText] = useState("");
  const [errorSB, setErrorSB] = useState(false);
  const [errorSBText, setErrorSBText] = useState("");
  const [user, setUser] = useState({});
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNew, setWhatsNew] = useState("");
  const [stats, setStats] = useState({
    repairs: 0,
    repairsPickup: 0,
    repairsPaused: 0,
    repairsParts: 0,
    openOrders: 0,
    repairChange: 0,
    sales: {
      labels: [],
      datasets: { label: "Total Sales", data: [] },
    },
    salesChange: 0,
    salesVolume: {
      labels: [],
      datasets: { label: "Total Sales", data: [] },
    },
    topSellersAll: {
      labels: [],
      datasets: { label: "Sales", data: [] },
    },
    topSellersSixty: {
      labels: [],
      datasets: { label: "Sales", data: [] },
    },
    mysales: { lastweek: 0, thisweek: 0 },
  });
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

  const getSales = async () => {
    const response = await fetch(`${vars.serverUrl}/square/getsales`, {
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 200) {
      let monthlySales = [];
      let saleMonths = [];
      let mysalesVolume = [];
      res.monthlySales.map((month) => {
        saleMonths.push(month.Month);
        mysalesVolume.push(month.totalsales);
        monthlySales.push(month.sum / 100);
      });
      let salesItemsAll = [];
      let salesItemAllVol = [];
      res.topSellersAll.map((item, i) => {
        if (item._id != "Labor" || item._id != "Gen Merch" || i < 10) {
          salesItemsAll.push(item._id);
          salesItemAllVol.push(item.sales);
        }
      });
      let salesItemsSixty = [];
      let salesItemAllSixty = [];
      res.topSellersSixty.map((item, i) => {
        if (item._id != "Labor" || item._id != "Gen Merch" || i < 10) {
          salesItemsSixty.push(item._id);
          salesItemAllSixty.push(item.sales);
        }
      });

      setStats({
        repairs: res.repairsTotal,
        repairsPickup: res.repairsPickup,
        repairsPaused: res.repairsPaused,
        repairsParts: res.repairsParts,
        openOrders: res.openOrders,
        repairChange:
          ((res.repairs.find((x) => x._id == -30).count -
            res.repairs.find((x) => x._id == -60).count) /
            res.repairs.find((x) => x._id == -60).count) *
          100,
        sales: { labels: saleMonths, datasets: { data: monthlySales } },
        salesVolume: { labels: saleMonths, datasets: { data: mysalesVolume } },
        salesChange:
          res.sales.find((x) => x._id == -7) != undefined
            ? Math.round(
                ((res.sales.find((x) => x._id == -7).sum -
                  res.sales.find((x) => x._id == -14).sum) /
                  res.sales.find((x) => x._id == -14).sum) *
                  100
              )
            : -(res.sales.find((x) => x._id == -14).sum / 100),
        topSellersAll: { labels: salesItemsAll, datasets: { data: salesItemAllVol } },
        topSellersSixty: { labels: salesItemsSixty, datasets: { data: salesItemAllSixty } },
        mysales:
          res.sales.find((x) => x._id == -7) != undefined
            ? res.sales.find((x) => x._id == -7).sum
            : 0,
      });
    } else if (res.res === 401) {
      setLoginState((s) => ({ ...s, loggedin: false }));
      setSnackBar({
        type: "error",
        title: "Session expired",
        message: "Please log in again.",
        show: true,
        icon: "error",
      });
    }
  };
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

  const getWhatsnew = async () => {
    if (loginState.loggedin) {
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
    if (loginState.loggedin) {
      const response = await fetch(`${vars.serverUrl}/square/getSquare?action=getInitData`, {
        credentials: "same-origin",
      });
      const res = await response.json();
      if (res.res === 200) {
        setCustomers(res.customers);
        setLocations(res.locations);
        //setLoading(false);
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
      //setLoading(false);
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
    if (loginState.loggedin) {
      setLocation(cookies.get("mylocation"));
      getWhatsnew();
      getInitData();
      getSales();
    }
  }, [loginState.loggedin]);

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

  const myScanner = (
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
  console.log("App loginState: ", loginState);
  if (loginState.loading) {
    return (
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {/* <Loading /> */}
        <LoadDialog />
        {renderErrorSB}
      </ThemeProvider>
    );
  } else if (!loginState.loggedin) {
    return (
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <SignIn />
        {renderSuccessSB}
        {renderErrorSB}
      </ThemeProvider>
    );
  }
  // else if (!loginState.square) {
  //   return (
  //     <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
  //       <CssBaseline />
  //       <Square />
  //     </ThemeProvider>
  //   );
  // }
  else {
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
                routes={routes(stats, loginState)}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
                doSearch={doSearch}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {getRoutes(routes(stats, loginState))}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
          {RenderSb}
          <LoadDialog />
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
              routes={routes(stats, loginState)}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              doSearch={doSearch}
            />
            <Configurator />
            <LoadDialog />
            {RenderSb}
            {renderSuccessSB}
            {renderErrorSB}
            {renderWhatsNew}
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        {showVideoFeed && myScanner}
        {/* {location == null && <LocationSelect locations={locations.locations} />} */}
        <Routes>
          {getRoutes(routes(stats, loginState))}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    );
  }
}
