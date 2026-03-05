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

import React, { useState, useEffect } from "react";
import { globalFuncs } from "../../../context/global";
// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import { Badge } from "@mui/material";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  ClickAwayListener,
  Divider,
  ListItemIcon,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import NewRepairButton from "components/NewRepairButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import { useSocket } from "context/socket";
import { useStats } from "context/stats";

const WhatsAppIcon = ({ style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    style={style}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.381a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function DashboardNavbar({ absolute, light, isMini }) {
  const { setShowVideoFeed } = globalFuncs();
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);
  const { stats } = useStats();
  const socket = useSocket();
  const redirect = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        setLoading(true);
        setShowResults(true);
        if (socket) {
          socket.emit("globalSearch", { query: searchTerm }, (response) => {
            setLoading(false);
            let data = response;
            if (response && response.res === 200) {
              data = response.data;
            }

            if (data) {
              const processed = [];
              if (data.customers)
                data.customers.forEach((c) => processed.push({ type: "Customer", data: c }));
              if (data.repairs)
                data.repairs.forEach((r) => processed.push({ type: "Repair", data: r }));
              if (data.inventory)
                data.inventory.forEach((i) => processed.push({ type: "Inventory", data: i }));
              if (data.orders)
                data.orders.forEach((o) => processed.push({ type: "Order", data: o }));
              if (data.consignments)
                data.consignments.forEach((c) => processed.push({ type: "Consignment", data: c }));
              if (data.messages)
                data.messages.forEach((m) => processed.push({ type: "Message", data: m }));
              setSearchResults(processed);
            } else {
              setSearchResults([]);
            }
          });
        }
      } else {
        setSearchResults([]);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, socket]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      setLoading(true);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = (item) => {
    setShowResults(false);
    setSearchTerm("");
    switch (item.type) {
      case "Customer":
        redirect(`/customer/${item.data._id}`);
        break;
      case "Repair":
        redirect(`/repairdetails/${item.data._id}`);
        break;
      case "Message":
        const conversationId = item.data.SmsStatus === "received" ? item.data.From : item.data.To;
        redirect("/messages", { state: { conversationId } });
        break;
      case "Inventory":
        redirect("/inventory");
        break;
      case "Order":
        redirect(`/orders/${item.data.id}`);
        break;
      case "Consignment":
        redirect("/consignments");
        break;
      default:
        break;
    }
  };

  const getResultLabel = (item) => {
    const { type, data } = item;
    switch (type) {
      case "Customer":
        return `${data.given_name || ""} ${data.family_name || ""}`;
      case "Repair":
        return `Repair #${data.repairID} - ${data.pevData?.Model || "Unknown"}`;
      case "Message":
        return `Message from ${
          data.customerData
            ? `${data.customerData.given_name || ""} ${data.customerData.family_name || ""}`
            : data.ProfileName || data.From
        }`;
      case "Inventory": {
        const item = data.itemData?.itemData;
        if (!item) return "Inventory Item";
        const variation = item.variations?.find((v) => v.id === data.catalog_object_id);
        const variationName = variation?.itemVariationData?.name;
        if (variationName && variationName.toLowerCase() !== "regular" && variationName !== "") {
          return `${item.name} - ${variationName}`;
        }
        return item.name;
      }
      case "Order":
        return `Order ${data.reference_id || data.id}`;
      case "Consignment":
        return `Consignment: ${data.itemData?.name}`;
      default:
        return type;
    }
  };

  const getResultSecondary = (item) => {
    const { type, data } = item;
    switch (type) {
      case "Customer":
        return data.phone_number;
      case "Repair":
        return `${data.customerData?.given_name || ""} ${data.customerData?.family_name || ""}`;
      case "Message":
        return data.Body;
      case "Inventory": {
        const itemData = data.itemData?.itemData;
        const variation = itemData?.variations?.find((v) => v.id === data.catalog_object_id);
        const sku = variation?.itemVariationData?.sku;
        return `SKU: ${sku || "N/A"} | Qty: ${data.quantity || 0}`;
      }
      case "Order":
        return `$${(data.total_money?.amount / 100).toFixed(2)}`;
      case "Consignment":
        return `${data.customerData?.given_name || ""} ${data.customerData?.family_name || ""}`;
      default:
        return "";
    }
  };

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem icon={<Icon>podcasts</Icon>} title="Manage Podcast sessions" />
      <NotificationItem icon={<Icon>shopping_cart</Icon>} title="Payment successfully completed" />
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox color={light ? "white" : "inherit"}>
              {/* <Link to="/authentication/sign-in/basic">
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link> */}
              <NewRepairButton size="icon" />
              <Link to="/messages">
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Badge badgeContent={stats.unreadSMS} color="error">
                    <Icon sx={iconsStyle}>message</Icon>
                  </Badge>
                </IconButton>
              </Link>
              <IconButton
                size="small"
                disableRipple
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
              >
                <Icon sx={iconsStyle} fontSize="medium">
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
            </MDBox>
            <MDBox pl={1} position="relative" sx={{ width: "350px" }}>
              <ClickAwayListener onClickAway={() => setShowResults(false)}>
                <MDBox>
                  <MDInput
                    label="Search here"
                    value={searchTerm}
                    fullWidth
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchTerm) setShowResults(true);
                    }}
                  />
                  {showResults && (searchTerm || loading) && (
                    <Paper
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        mt: 1,
                        maxHeight: "400px",
                        overflow: "auto",
                      }}
                    >
                      {loading ? (
                        <MDBox p={2} display="flex" justifyContent="center">
                          <CircularProgress size={20} />
                        </MDBox>
                      ) : (
                        <List dense sx={{ py: 0 }}>
                          {searchResults.length > 0 ? (
                            searchResults.map((result, index) => {
                              const showHeader =
                                index === 0 || searchResults[index - 1].type !== result.type;

                              return (
                                <React.Fragment key={index}>
                                  {showHeader && (
                                    <MDBox
                                      pt={1}
                                      pb={0.5}
                                      px={2}
                                      sx={({ palette: { grey } }) => ({
                                        backgroundColor: grey[200],
                                      })}
                                    >
                                      <MDTypography
                                        variant="caption"
                                        fontWeight="bold"
                                        color="text"
                                        textTransform="uppercase"
                                      >
                                        {result.type === "Inventory"
                                          ? "Inventory"
                                          : `${result.type}s`}
                                      </MDTypography>
                                    </MDBox>
                                  )}
                                  <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleResultClick(result)}>
                                      {result.type === "Message" && (
                                        <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                                          {result.data.To?.startsWith("whatsapp:") ||
                                          result.data.From?.startsWith("whatsapp:") ? (
                                            <WhatsAppIcon
                                              style={{
                                                width: "20px",
                                                height: "20px",
                                                fill: "#25D366",
                                              }}
                                            />
                                          ) : (
                                            <Icon fontSize="small">sms</Icon>
                                          )}
                                        </ListItemIcon>
                                      )}
                                      <ListItemText
                                        primary={getResultLabel(result)}
                                        secondary={getResultSecondary(result)}
                                        primaryTypographyProps={{
                                          variant: "button",
                                          fontWeight: "medium",
                                        }}
                                        secondaryTypographyProps={{
                                          variant: "caption",
                                          noWrap: true,
                                        }}
                                      />
                                    </ListItemButton>
                                  </ListItem>
                                  {index < searchResults.length - 1 &&
                                    searchResults[index + 1].type === result.type && (
                                      <Divider component="li" />
                                    )}
                                </React.Fragment>
                              );
                            })
                          ) : (
                            <MDBox p={2}>
                              <MDTypography variant="button">No results found</MDTypography>
                            </MDBox>
                          )}
                        </List>
                      )}
                    </Paper>
                  )}
                </MDBox>
              </ClickAwayListener>
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
