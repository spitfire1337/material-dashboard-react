// TableStateContext.js
import React, { createContext, useState, useContext } from "react";
import vars from "../config";
import { useLoginState } from "./loginContext";
import { globalFuncs } from "./global";
const TableStateContext = createContext();

export const TableStateProvider = ({ children }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoggedIn } = useLoginState();
  const [tableState, setTableState] = useState({
    page: 0,
    pageSize: 10,
    sortBy: [],
    filters: [],
    data: [],
    dataFiltered: [],
    loaded: false,
    filters: {
      status: [],
      RepairType: [
        "Tire Change",
        "Tube Change",
        "Power issue",
        "Mechanical Repair",
        "Other",
        undefined,
      ],
    },
    searchTerm: "",
  });
  const RepairRerender = async (callback) => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getRepairs`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setTableState((s) => ({ ...s, data: res.data, dataFiltered: res.data, loaded: true }));
        if (callback != undefined) {
          callback(res.data);
        }
        setShowLoad(false);
      } else if (res.res === 401) {
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "warning",
        });
        setShowLoad(false);
      }
    } else if (response.status == 401) {
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "warning",
      });
      setShowLoad(false);
    }
  };

  return (
    <TableStateContext.Provider value={{ tableState, setTableState, RepairRerender }}>
      {children}
    </TableStateContext.Provider>
  );
};

export const RepairRerender = async (callback) => {
  const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getRepairs`, {
    credentials: "include",
  });
  if (response.status == 200) {
    const res = await response.json();

    if (res.res === 200) {
      setTableState((s) => ({ ...s, data: res.data, dataFiltered: res.data, loaded: true }));
      callback(res.data);
    } else if (res.res === 401) {
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "warning",
      });
    }
  } else if (response.status == 401) {
    setLoggedIn(false);
    setSnackBar({
      type: "error",
      title: "Error",
      message: "Unauthorized, redirecting to login",
      show: true,
      icon: "warning",
    });
  }
};

export const useTableState = () => useContext(TableStateContext);
