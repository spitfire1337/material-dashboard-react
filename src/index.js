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
import "./context/wdyr";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TableStateProvider } from "context/tableState";
import { LoginStateProvider } from "context/loginContext";
import { GlobalProvider } from "context/global";
import App from "App";
import { registerLicense } from "@syncfusion/ej2-base";
import { AddToHomeScreen } from "react-pwa-add-to-homescreen";
// Material Dashboard 2 React Context Provider
import { MaterialUIControllerProvider } from "context";
registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NNaF1cXGNCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWXlfcnVTRGleUEdzXUtWYUA="
);
const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <GlobalProvider>
        <LoginStateProvider>
          <TableStateProvider>
            <AddToHomeScreen />
            <App />
          </TableStateProvider>
        </LoginStateProvider>
      </GlobalProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
