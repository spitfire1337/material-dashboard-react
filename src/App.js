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

// Vars
import vars from "./vars";
// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import { MyLocation } from "@mui/icons-material";

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

  const cookies = new Cookies(null, { path: "/" });
  // Cache for the rtl
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

  // Open sidenav when mouse enter on mini sidenav
  const checkLogin = async () => {
    if (!isLoggedin) {
      const response = await fetch(`${vars.server}/auth/authCheck`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 401) {
        setLoading(false);
        setLoggedIn(false);
      } else {
        setLoading(false);
        setLoggedIn(true);
      }
    }
  };

  const checkSquare = async () => {
    if (isLoggedin) {
      const response = await fetch(`${vars.server}/square/checkconfig`, {
        credentials: "include",
      });
      const res = await response.json();
      console.log("Square res", res);
      if (res.res === 401) {
        setLoading(false);
        setSquare(false);
      } else {
        setLoading(false);
        setSquare(true);
      }
    }
  };

  const getInitData = async () => {
    if (isLoggedin) {
      const response = await fetch(`${vars.server}/square/getSquare?action=getInitData`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setCustomers(res.customers);
        setLocations(res.locations);
        setLoading(false);
        console.log(res);
      }
      if (location !== undefined) {
        const response = await fetch(`${vars.server}/square/getSquare?action=getSales`, {
          credentials: "include",
        });
        const res = await response.json();
        if (res.res === 200) {
          setSaless(res.sales);
          setLoading(false);
          console.log(res);
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
      console.log("Use effect getInitData");
      setLocation(cookies.get("mylocation"));
      console.log(cookies.get("mylocation")); // Pacman
      getInitData();
    }
  }, [isLoggedin, isSquare, location]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
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

  if (loading) {
    return null;
  } else if (!isLoggedin) {
    return (
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <SignIn />
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
                brandName="Material Dashboard 2"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            {getRoutes(routes)}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
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
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        {/* {location == null && <LocationSelect locations={locations.locations} />} */}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    );
  }
}
