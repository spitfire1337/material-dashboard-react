// TableStateContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import vars from "../config";
import { Dialog, DialogTitle, DialogContent, CircularProgress } from "@mui/material";
import MDSnackbar from "components/MDSnackbar";
import { title } from "process";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  //let redirect = useNavigate();
  const [snackBar, setSnackBar] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    icon: "check",
  });
  const [showLoad, setShowLoad] = useState(true);
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const RenderSb = (
    <MDSnackbar
      color={snackBar.type}
      icon={snackBar.icon}
      title={snackBar.title}
      content={snackBar.message}
      open={snackBar.show}
      onClose={() => {
        setSnackBar((s) => ({ ...s, show: false }));
      }}
      close={() => {
        setSnackBar((s) => ({ ...s, show: false }));
      }}
      bgWhite
    />
  );
  const LoadDialog = () => {
    return (
      <Dialog open={showLoad}>
        <DialogTitle>Loading</DialogTitle>
        <DialogContent sx={{ alignItems: "center", textAlign: "center" }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <GlobalContext.Provider
      value={{
        snackBar,
        setSnackBar,
        RenderSb,
        showLoad,
        setShowLoad,
        LoadDialog,
        showVideoFeed,
        setShowVideoFeed,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const globalFuncs = () => useContext(GlobalContext);
