import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, FormControl, InputLabel, Select, MenuItem, Menu } from "@mui/material";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  Title,
  Legend,
  Tooltip,
} from "@devexpress/dx-react-chart-material-ui";
import { Animation, EventTracker, BarSeries } from "@devexpress/dx-react-chart";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import { useSocket } from "context/socket";
import MDButton from "components/MDButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function InventoryVelocity() {
  const socket = useSocket();
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const { setShowLoad } = globalFuncs();
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [repairType, setRepairType] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const repairTypes = ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"];
  const deviceTypes = ["EUC", "Scooter", "OneWheel", "Ebike", "Emoto", "Eskate"];

  useEffect(() => {
    if (socket) {
      fetchInventoryData();
    }
  }, [socket]);

  const fetchInventoryData = (start, end) => {
    if (!socket) return;
    setShowLoad(true);
    const s = start && start.toISOString ? start : startDate;
    const e = end && end.toISOString ? end : endDate;
    const query = {
      startDate: s ? s.toISOString() : null,
      endDate: e ? e.toISOString() : null,
      repairType,
      deviceType,
    };
    socket.emit("getPartsVelocity", query, (res) => {
      if (res.res === 200) {
        setInventoryData(res.data);
      } else {
        console.error("Failed to fetch inventory velocity data");
      }
      setShowLoad(false);
    });
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToPDF = async () => {
    handleExportClose();
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const html2canvas = (await import("html2canvas")).default;
      const doc = new jsPDF();

      doc.text("Inventory Velocity Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`,
        14,
        22
      );

      const tableColumn = ["Part Name", "Quantity Used"];
      const tableRows = inventoryData.map((item) => [item.partName, item.totalQuantity]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
      });

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let finalY =
          doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY + 10 : 30;

        if (finalY + imgHeight > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          finalY = 10;
        }

        doc.addImage(imgData, "PNG", 15, finalY, imgWidth, imgHeight);
      }

      doc.save(`Inventory_Velocity_${dayjs().format("YYYY-MM-DD")}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };

  const exportToExcel = async () => {
    handleExportClose();
    try {
      const ExcelJS = (await import("exceljs")).default;
      const fileSaver = await import("file-saver");
      const saveAs = fileSaver.saveAs || fileSaver.default;
      const html2canvas = (await import("html2canvas")).default;

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Inventory Velocity");

      ws.columns = [
        { header: "Part Name", key: "partName", width: 40 },
        { header: "Quantity Used", key: "totalQuantity", width: 20 },
      ];

      inventoryData.forEach((item) => {
        ws.addRow({ partName: item.partName, totalQuantity: item.totalQuantity });
      });

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const imageId = wb.addImage({ base64: imgData, extension: "png" });
        ws.addImage(imageId, {
          tl: { col: 0, row: inventoryData.length + 2 },
          ext: { width: 800, height: 450 },
        });
      }

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Inventory_Velocity_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Filters
                </MDTypography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Repair Type</InputLabel>
                        <Select
                          value={repairType}
                          label="Repair Type"
                          onChange={(e) => setRepairType(e.target.value)}
                          sx={{ height: "44px" }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {repairTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>Device Type</InputLabel>
                        <Select
                          value={deviceType}
                          label="Device Type"
                          onChange={(e) => setDeviceType(e.target.value)}
                          sx={{ height: "44px" }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {deviceTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <MDButton
                        variant="contained"
                        color="info"
                        onClick={() => fetchInventoryData()}
                      >
                        Apply Filters
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(30, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchInventoryData(start, end);
                        }}
                      >
                        Last 30 Days
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(60, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchInventoryData(start, end);
                        }}
                      >
                        Last 60 Days
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(90, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchInventoryData(start, end);
                        }}
                      >
                        Last 90 Days
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(6, "month");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchInventoryData(start, end);
                        }}
                      >
                        Last 6 Months
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(1, "year");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchInventoryData(start, end);
                        }}
                      >
                        Last Year
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(2, "year");
                          const end = dayjs().subtract(1, "year");
                          setStartDate(start);
                          setEndDate(end);
                          fetchInventoryData(start, end);
                        }}
                      >
                        Previous Year
                      </MDButton>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton variant="contained" color="secondary" onClick={handleExportClick}>
                        Export
                      </MDButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleExportClose}
                      >
                        <MenuItem onClick={exportToPDF}>Export to PDF</MenuItem>
                        <MenuItem onClick={exportToExcel}>Export to Excel</MenuItem>
                      </Menu>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} ref={chartRef}>
                <MDTypography variant="h6">Repair Item Velocity (Top Items Used)</MDTypography>
                {inventoryData.length > 0 ? (
                  <Chart data={inventoryData}>
                    <ArgumentAxis showLabels={false} />
                    <ValueAxis />
                    <BarSeries
                      valueField="totalQuantity"
                      argumentField="partName"
                      name="Quantity Used"
                    />
                    <Title text="Most Used Repair Items" />
                    <Animation />
                    <EventTracker />
                    <Tooltip
                      contentComponent={(props) => {
                        const item = inventoryData[props.targetItem.point];
                        return (
                          <Tooltip.Content {...props} text={`${item.partName}: ${props.text}`} />
                        );
                      }}
                    />
                  </Chart>
                ) : (
                  <MDTypography>No data available</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default InventoryVelocity;
