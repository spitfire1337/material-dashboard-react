/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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
import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import vars from "../../../config";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import moment from "moment";
import Button from "@mui/material/Button";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  NativeSelect,
  Select,
  TextField,
} from "@mui/material";
import { Update } from "@mui/icons-material";

export default function data(globalFunc, setShowLoad, getParts) {
  let redirect = useNavigate();
  const [inventoryOrig, setInventoryOrig] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [lastUpdated, setlastUpdated] = useState(null);
  const [searchTerm, setsearchTerm] = useState(null);
  const [showModal, setshowModal] = useState(false);
  const [stock, setCurrentStock] = useState(0);
  const [itemid, setItemId] = useState(null);
  const [showResModal, setShowResModal] = useState(false);
  const [squareItem, setsquareItem] = useState(0);
  const [showPartsModal, setShowPartsModal] = useState(false);

  const fetchData = async (globalFunc) => {
    const response = await fetch(`${vars.serverUrl}/api/tags`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();
      setShowLoad(false);
      if (res.res === 200) {
        setInventoryOrig(res.data);
        setInventory(res.data);
        setlastUpdated(res.lastUpdate);
      } else if (res.res === 401) {
        globalFunc.setLoggedIn(false);
        globalFunc.setErrorSBText("Unauthorized, redirecting to login");
        globalFunc.setErrorSB(true);
      }
    } else if (response.status == 401) {
      globalFunc.setLoggedIn(false);
      globalFunc.setErrorSBText("Unauthorized, redirecting to login");
      globalFunc.setErrorSB(true);
    }
  };
  useEffect(() => {
    setShowLoad(true);
    fetchData(globalFunc);
  }, []);

  const reRender = () => {
    setShowLoad(true);
    fetchData(globalFunc);
  };
  useEffect(() => {
    doSearch();
  }, [searchTerm, inventoryOrig]);

  const doSearch = () => {
    let filterData = [...inventory];
    if (searchTerm == "" || searchTerm == null) {
      setInventory(inventoryOrig);
      return;
    }
    let filtered = filterData.filter((item) => {
      if (searchTerm == "" || searchTerm == null) {
        return true;
      }
      return false;
    });
    setInventory(filtered);
  };

  const showSquareUpdate = (id) => {
    getParts();
    setItemId(id);
  };

  // const setRes =(h, w) =>{

  // }

  const UpdateSquareItem = async () => {
    setShowPartsModal(false);
    const response = await fetch(`${vars.serverUrl}/api/etagSquareItem`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: itemid,
        square: squareItem,
        needsUpdate: true,
      }),
    });
    const json = await response.json();
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Associated Square item updated");
      globalFunc.setSuccessSB(true);
      reRender();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  const UpdateResolution = async (screenSize) => {
    setShowResModal(false);
    const response = await fetch(`${vars.serverUrl}/api/etagResolution`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: itemid,
        screenSize: screenSize,
      }),
    });
    const json = await response.json();
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Resolution updated");
      globalFunc.setSuccessSB(true);
      reRender();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  const ResolutionBadge = ({ screenSize, resW, id }) => {
    return (
      <div>
        {screenSize} in
        <Button
          onClick={() => {
            setShowResModal(id);
            setItemId(id);
          }}
        >
          Edit
        </Button>
      </div>
    );
  };

  const enableFunc = async (status, id) => {
    const response = await fetch(`${vars.serverUrl}/api/etagEnable`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: id,
        status: status,
      }),
    });
    const json = await response.json();
    setShowLoad(false);
    if (json.res == 200) {
      if (!status) {
        globalFunc.setSuccessSBText("Item disabled");
      } else {
        globalFunc.setSuccessSBText("Item enabled");
      }
      globalFunc.setSuccessSB(true);
      reRender();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  const EnableButton = ({ enabled, id }) => {
    if (!enabled) {
      return (
        <MDButton variant="contained" color="success" onClick={() => enableFunc(true, id)}>
          Enable
        </MDButton>
      );
    } else {
      return (
        <MDButton variant="contained" color="error" onClick={() => enableFunc(false, id)}>
          Disable
        </MDButton>
      );
    }
  };
  return {
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    showResModal: showResModal,
    setShowResModal: setShowResModal,
    UpdateResolution: UpdateResolution,
    columns: [
      { Header: "Tag Alias", accessor: "alias", align: "left" },
      { Header: "Tag Mac", accessor: "mac", align: "left" },
      { Header: "Resolution", accessor: "resolution", align: "left" },
      { Header: "Battery", accessor: "battery", align: "left" },
      { Header: "Associated Square item", accessor: "squareitem", align: "left" },
      { Header: "Pending update", accessor: "update", align: "left" },
      { Header: "Update ready", accessor: "updateReady", align: "left" },
    ],

    rows:
      inventory.length > 0
        ? inventory.map((item) => {
            return {
              alias: item.alias,
              mac: item.mac,
              enabled: <EnableButton enabled={item.enabled} id={item._id} />,
              battery: `${item.batteryMv / 1000}v (${(
                ((700 - (3300 - item.batteryMv)) / 700) *
                100
              ).toFixed(2)}%)`,
              resolution: <ResolutionBadge screenSize={item.screenSize} id={item._id} />,
              update: item.needsUpdate ? (
                <MDBadge badgeContent="Yes" color="warning" variant="gradient" size="sm" />
              ) : (
                <MDBadge badgeContent="No" color="success" variant="gradient" size="sm" />
              ),
              updateReady: item.updateReady ? (
                <MDBadge badgeContent="Yes" color="success" variant="gradient" size="sm" />
              ) : (
                <MDBadge badgeContent="No" color="warning" variant="gradient" size="sm" />
              ),
              squareitem: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.squareItem.length > 0
                    ? `${item.squareItem[0].itemData.name} - ${
                        item.squareItem[0].itemData.variations.filter(
                          (x) => x.id == item.squareId
                        )[0].itemVariationData.name
                      }`
                    : ""}{" "}
                  <Button onClick={() => showSquareUpdate(item._id)} disabled={!item.screenSize}>
                    Edit
                  </Button>
                </MDTypography>
              ),
            };
          })
        : [],
    updated: lastUpdated,
    itemid: itemid,
    showModal: showModal,
    setshowModal: setshowModal,
    setsquareItem: setsquareItem,
    showPartsModal: showPartsModal,
    setShowPartsModal: setShowPartsModal,
    setShowLoad: setShowLoad,
    UpdateSquareItem: UpdateSquareItem,
  };
}
