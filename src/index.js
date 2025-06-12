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

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { registerLicense } from "@syncfusion/ej2-base";
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
      <App />
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
