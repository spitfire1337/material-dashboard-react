import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Card, Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";

function PrinterSetup() {
  const socket = useSocket();
  const { setSnackBar } = globalFuncs();
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [printerConfigs, setPrinterConfigs] = useState({
    0: "", // Full size paper printing
    1: "", // Intake printing
    2: "", // Repair start printing
  });

  const roles = [
    { value: 0, label: "Full Size Paper" },
    { value: 1, label: "Intake Label" },
    { value: 2, label: "Repair Start Label" },
  ];

  useEffect(() => {
    if (socket) {
      socket.emit("getAvailablePrinters", {}, (res) => {
        if (res) {
          if (res.data && Array.isArray(res.data)) {
            setAvailablePrinters(res.data);
          }
          if (res.currentConfigs && Array.isArray(res.currentConfigs)) {
            const newConfigs = { 0: "", 1: "", 2: "" };
            res.currentConfigs.forEach((conf) => {
              if (
                conf.usedfor !== undefined &&
                (conf.usedfor === 0 || conf.usedfor === 1 || conf.usedfor === 2)
              ) {
                newConfigs[conf.usedfor] = conf.printerName;
              }
            });
            setPrinterConfigs(newConfigs);
          }
        }
      });
    }
  }, [socket]);

  const handleConfigChange = (usedfor, printerName) => {
    setPrinterConfigs((prev) => ({ ...prev, [usedfor]: printerName }));
  };

  const handleSave = () => {
    if (socket) {
      const configPayload = Object.keys(printerConfigs).map((key) => ({
        usedfor: parseInt(key, 10),
        printerName: printerConfigs[key],
      }));

      socket.emit("updatePrinterConfig", configPayload, (res) => {
        if (res && (res.success || res.res === 200)) {
          setSnackBar({
            type: "success",
            title: "Success",
            message: "Printer settings saved successfully.",
            show: true,
          });
        } else {
          setSnackBar({
            type: "error",
            title: "Error",
            message: "Failed to save printer settings.",
            show: true,
          });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5" gutterBottom>
                  Printer Setup
                </MDTypography>
                <MDBox mt={3}>
                  <Grid container spacing={3}>
                    {roles.map((role) => (
                      <Grid item xs={12} md={4} key={role.value}>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`printer-select-label-${role.value}`}>
                            {role.label}
                          </InputLabel>
                          <Select
                            labelId={`printer-select-label-${role.value}`}
                            id={`printer-select-${role.value}`}
                            value={printerConfigs[role.value]}
                            label={role.label}
                            onChange={(e) => handleConfigChange(role.value, e.target.value)}
                            sx={{ height: "45px" }}
                          >
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {availablePrinters.map((printer, index) => {
                              const pName = typeof printer === "string" ? printer : printer.name;
                              return (
                                <MenuItem key={index} value={pName}>
                                  {pName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                </MDBox>
                <MDBox mt={4} display="flex" justifyContent="flex-end">
                  <MDButton variant="gradient" color="info" onClick={handleSave}>
                    Save Settings
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PrinterSetup;
