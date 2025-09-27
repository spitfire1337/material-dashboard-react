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

export default function data(globalFunc, setShowLoad, getParts) {
  let redirect = useNavigate();
  const [inventoryOrig, setInventoryOrig] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [lastUpdated, setlastUpdated] = useState(null);
  const [searchTerm, setsearchTerm] = useState(null);
  const [showModal, setshowModal] = useState(false);
  const [stock, setCurrentStock] = useState(0);
  const [itemid, setItemId] = useState(null);
  const [squareItem, setsquareItem] = useState(0);
  const [showPartsModal, setShowPartsModal] = useState(false);

  const fetchData = async (globalFunc) => {
    const response = await fetch(`${vars.serverUrl}/api/inmotionProducts`, {
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
      // eslint-disable-next-line prettier/prettier
      if (
        item.variant.itemVariationData.name
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return true;
      if (item.itemData.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      return false;
    });
    setInventory(filtered);
  };

  const ShowStockUpdate = (Stock, id) => {
    setCurrentStock(Stock);
    setItemId(id);
    setshowModal(true);
  };

  const showSquareUpdate = (id) => {
    getParts();
    setItemId(id);
  };

  const UpdateStock = async () => {
    setshowModal(false);
    const response = await fetch(`${vars.serverUrl}/api/inmotionStoreStock`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: itemid,
        stock: stock,
      }),
    });
    const json = await response.json();
    if (json.res == 200) {
      globalFunc.setSuccessSBText("Stock updated");
      globalFunc.setSuccessSB(true);
      reRender();
    } else {
      globalFunc.setErrorSBText("Server error occured");
      globalFunc.setErrorSB(true);
    }
  };

  const UpdateSquareItem = async () => {
    setShowPartsModal(false);
    const response = await fetch(`${vars.serverUrl}/api/inmotionSquareItem`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: itemid,
        square: squareItem,
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

  const enableFunc = async (status, id) => {
    const response = await fetch(`${vars.serverUrl}/api/inmotionEnable`, {
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
    columns: [
      { Header: "", accessor: "photo" },
      { Header: "InMotion Item", accessor: "item", align: "left" },
      { Header: "Available", accessor: "available", align: "left" },
      { Header: "In Store stock", accessor: "storestock", align: "left" },
      { Header: "Associated Square item", accessor: "squareitem", align: "left" },
      { Header: "Square Inventory", accessor: "squareinventory", align: "left" },
      { Header: "Enabled", accessor: "enabled", align: "left" },
    ],

    rows:
      inventory.length > 0
        ? inventory.map((item) => {
            return {
              photo:
                item.images.length > 0 ? (
                  <img src={item.images[0].src} style={{ height: "75px", width: "75px" }} />
                ) : (
                  ""
                ),
              enabled: <EnableButton enabled={item.enabled} id={item._id} />,
              item: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.title} - {item.variant}
                </MDTypography>
              ),
              available: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.available ? "Yes" : "No"}
                </MDTypography>
              ),
              storestock: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.instoreInventory}{" "}
                  <Button onClick={() => ShowStockUpdate(item.instoreInventory, item._id)}>
                    Edit
                  </Button>
                </MDTypography>
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
                  <Button onClick={() => showSquareUpdate(item._id)}>Edit</Button>
                </MDTypography>
              ),
              squareinventory: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {item.inventory.length > 0 ? item.inventory[0].quantity : ""}{" "}
                </MDTypography>
              ),
            };
          })
        : [],
    updated: lastUpdated,
    itemid: itemid,
    showModal: showModal,
    setshowModal: setshowModal,
    stock: stock,
    setCurrentStock: setCurrentStock,
    UpdateStock: UpdateStock,
    setsquareItem: setsquareItem,
    showPartsModal: showPartsModal,
    setShowPartsModal: setShowPartsModal,
    setShowLoad: setShowLoad,
    UpdateSquareItem: UpdateSquareItem,
  };
}
