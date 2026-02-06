// TableStateContext.js
import React, { createContext, useState, useContext } from "react";
import vars from "../config";

const TableStateContext = createContext();

export const TableStateProvider = ({ children }) => {
  const [tableState, setTableState] = useState({
    page: 0,
    pageSize: 10,
    sortBy: [],
    filters: [],
    data: [],
    dataFiltered: [],
    loaded: false,
  });
  const RepairRerender = async (callback) => {
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

export const useTableState = () => useContext(TableStateContext);
