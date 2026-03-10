import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import colors from "assets/theme/base/colors";
import { Card, Grid, Menu, MenuItem, Icon } from "@mui/material";
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
import MDButton from "components/MDButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSocket } from "context/socket";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function RepairTimeAnalysis() {
  const socket = useSocket();
  const chartRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeData, setTimeData] = useState({});
  const { setShowLoad, setAiChatOpen, setAiLoading, setSnackBar } = globalFuncs();
  const { gradients } = colors;
  const [startDate, setStartDate] = useState(dayjs().subtract(90, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    if (socket) {
      fetchTimeData();
    }
  }, [socket]);

  const fetchTimeData = (start, end) => {
    if (!socket) return;
    setShowLoad(true);
    const s = start && start.toISOString ? start : startDate;
    const e = end && end.toISOString ? end : endDate;
    const query = {
      startDate: s ? s.toISOString() : null,
      endDate: e ? e.toISOString() : null,
    };
    socket.emit("getRepairTimeStats", query, (res) => {
      if (res.res === 200) {
        setTimeData(res);
      } else {
        console.error("Failed to fetch repair time analysis data");
      }
      setShowLoad(false);
    });
  };

  const handleAiAnalysis = () => {
    if (!socket) return;
    setAiChatOpen(true);
    setAiLoading(true);
    const query = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    socket.emit("analyzeReport", { reportType: "repairTimeStats", query: query }, (res) => {
      if (res.res !== 200) {
        setAiChatOpen(false);
        setAiLoading(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: res.message || "Error analyzing report",
          show: true,
          icon: "warning",
        });
      }
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

      doc.text("Repair Time Analysis Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`,
        14,
        22
      );

      let finalY = 30;

      const addTable = (title, headers, data) => {
        if (finalY > 250) {
          doc.addPage();
          finalY = 20;
        }
        doc.text(title, 14, finalY);
        autoTable(doc, {
          startY: finalY + 5,
          head: [headers],
          body: data,
          theme: "striped",
          headStyles: { fillColor: [50, 50, 50] },
        });
        finalY = doc.lastAutoTable.finalY + 10;
      };

      if (timeData.byDeviceType && timeData.byDeviceType.length > 0) {
        addTable(
          "By Device Type",
          [
            "Device Type",
            "Avg Turnaround (Hours)",
            "Avg Repair Dwell (Hours)",
            "Avg Pickup Dwell (Hours)",
          ],
          timeData.byDeviceType.map((item) => [
            item.deviceType,
            item.avgTurnaroundHours,
            item.avgRepairDwellHours,
            item.avgPickupDwellHours,
          ])
        );
      }

      if (timeData.byRepairType && timeData.byRepairType.length > 0) {
        addTable(
          "By Repair Type",
          [
            "Repair Type",
            "Avg Turnaround (Hours)",
            "Avg Repair Dwell (Hours)",
            "Avg Pickup Dwell (Hours)",
          ],
          timeData.byRepairType.map((item) => [
            item.repairType,
            item.avgTurnaroundHours,
            item.avgRepairDwellHours,
            item.avgPickupDwellHours,
          ])
        );
      }

      if (timeData.byBrand && timeData.byBrand.length > 0) {
        addTable(
          "By Brand",
          [
            "Brand",
            "Avg Turnaround (Hours)",
            "Avg Repair Dwell (Hours)",
            "Avg Pickup Dwell (Hours)",
          ],
          timeData.byBrand.map((item) => [
            item.brand,
            item.avgTurnaroundHours,
            item.avgRepairDwellHours,
            item.avgPickupDwellHours,
          ])
        );
      }

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 180;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (finalY + imgHeight > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          finalY = 10;
        }

        doc.addImage(imgData, "PNG", 15, finalY, imgWidth, imgHeight);
      }

      doc.save(`Repair_Time_Analysis_${dayjs().format("YYYY-MM-DD")}.pdf`);
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

      if (timeData.byDeviceType && timeData.byDeviceType.length > 0) {
        const ws = wb.addWorksheet("By Device Type");
        ws.columns = [
          { header: "Device Type", key: "deviceType", width: 25 },
          { header: "Avg Turnaround", key: "avgTurnaroundHours", width: 20 },
          { header: "Avg Repair Dwell", key: "avgRepairDwellHours", width: 20 },
          { header: "Avg Pickup Dwell", key: "avgPickupDwellHours", width: 20 },
        ];
        timeData.byDeviceType.forEach((i) => ws.addRow(i));
      }
      if (timeData.byRepairType && timeData.byRepairType.length > 0) {
        const ws = wb.addWorksheet("By Repair Type");
        ws.columns = [
          { header: "Repair Type", key: "repairType", width: 25 },
          { header: "Avg Turnaround", key: "avgTurnaroundHours", width: 20 },
          { header: "Avg Repair Dwell", key: "avgRepairDwellHours", width: 20 },
          { header: "Avg Pickup Dwell", key: "avgPickupDwellHours", width: 20 },
        ];
        timeData.byRepairType.forEach((i) => ws.addRow(i));
      }
      if (timeData.byBrand && timeData.byBrand.length > 0) {
        const ws = wb.addWorksheet("By Brand");
        ws.columns = [
          { header: "Brand", key: "brand", width: 25 },
          { header: "Avg Turnaround", key: "avgTurnaroundHours", width: 20 },
          { header: "Avg Repair Dwell", key: "avgRepairDwellHours", width: 20 },
          { header: "Avg Pickup Dwell", key: "avgPickupDwellHours", width: 20 },
        ];
        timeData.byBrand.forEach((i) => ws.addRow(i));
      }

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const wsCharts = wb.addWorksheet("Charts");
        const imageId = wb.addImage({ base64: imgData, extension: "png" });
        wsCharts.addImage(imageId, { tl: { col: 0, row: 0 }, ext: { width: 800, height: 600 } });
      }

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Repair_Time_Analysis_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" gutterBottom>
                  Filters
                </MDTypography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <MDButton variant="contained" color="info" onClick={() => fetchTimeData()}>
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
                          fetchTimeData(start, end);
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
                          fetchTimeData(start, end);
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
                          fetchTimeData(start, end);
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
                          fetchTimeData(start, end);
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
                          fetchTimeData(start, end);
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
                          fetchTimeData(start, end);
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
                    <Grid item xs={12} md={2}>
                      <MDButton variant="gradient" color="info" onClick={handleAiAnalysis}>
                        <Icon>auto_awesome</Icon>&nbsp;AI Analysis
                      </MDButton>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        <MDBox ref={chartRef}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Repair Time Analysis (By Device Type)</MDTypography>
                  {timeData.byDeviceType && timeData.byDeviceType.length > 0 ? (
                    <Chart data={timeData.byDeviceType}>
                      <ArgumentAxis />
                      <ValueAxis />
                      <BarSeries
                        valueField="avgTurnaroundHours"
                        argumentField="deviceType"
                        name="Avg Turnaround"
                      />
                      <BarSeries
                        valueField="avgRepairDwellHours"
                        argumentField="deviceType"
                        name="Avg Repair Dwell"
                      />
                      <BarSeries
                        valueField="avgPickupDwellHours"
                        argumentField="deviceType"
                        name="Avg Pickup Dwell"
                      />
                      <Title text="Average Repair Time Stats (Hours)" />
                      <Animation />
                      <Legend />
                      <EventTracker />
                      <Tooltip
                        contentComponent={(props) => {
                          const item = timeData.byDeviceType[props.targetItem.point];
                          return (
                            <MDBox p={2} bgcolor="white" border="1px solid #ccc">
                              <MDTypography variant="button" fontWeight="bold">
                                {item.deviceType}
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Turnaround: {item.avgTurnaroundHours} hrs
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Repair Dwell: {item.avgRepairDwellHours} hrs
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Pickup Dwell: {item.avgPickupDwellHours} hrs
                              </MDTypography>
                            </MDBox>
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
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Repair Time Analysis (By Repair Type)</MDTypography>
                  {timeData.byRepairType && timeData.byRepairType.length > 0 ? (
                    <Chart data={timeData.byRepairType}>
                      <ArgumentAxis />
                      <ValueAxis />
                      <BarSeries
                        valueField="avgTurnaroundHours"
                        argumentField="repairType"
                        name="Avg Turnaround"
                      />
                      <BarSeries
                        valueField="avgRepairDwellHours"
                        argumentField="repairType"
                        name="Avg Repair Dwell"
                      />
                      <BarSeries
                        valueField="avgPickupDwellHours"
                        argumentField="repairType"
                        name="Avg Pickup Dwell"
                      />
                      <Title text="Average Repair Time Stats (Hours)" />
                      <Animation />
                      <Legend />
                      <EventTracker />
                      <Tooltip
                        contentComponent={(props) => {
                          const item = timeData.byRepairType[props.targetItem.point];
                          return (
                            <MDBox p={2} bgcolor="white" border="1px solid #ccc">
                              <MDTypography variant="button" fontWeight="bold">
                                {item.repairType}
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Turnaround: {item.avgTurnaroundHours} hrs
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Repair Dwell: {item.avgRepairDwellHours} hrs
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Pickup Dwell: {item.avgPickupDwellHours} hrs
                              </MDTypography>
                            </MDBox>
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
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6">Repair Time Analysis (By Brand)</MDTypography>
                  {timeData.byBrand && timeData.byBrand.length > 0 ? (
                    <Chart data={timeData.byBrand.slice(0, 20)}>
                      <ArgumentAxis />
                      <ValueAxis />
                      <BarSeries
                        valueField="avgTurnaroundHours"
                        argumentField="brand"
                        name="Avg Turnaround"
                      />
                      <BarSeries
                        valueField="avgRepairDwellHours"
                        argumentField="brand"
                        name="Avg Repair Dwell"
                      />
                      <BarSeries
                        valueField="avgPickupDwellHours"
                        argumentField="brand"
                        name="Avg Pickup Dwell"
                      />
                      <Title text="Average Repair Time Stats (Hours)" />
                      <Animation />
                      <Legend />
                      <EventTracker />
                      <Tooltip
                        contentComponent={(props) => {
                          const item = timeData.byBrand[props.targetItem.point];
                          return (
                            <MDBox p={2} bgcolor="white" border="1px solid #ccc">
                              <MDTypography variant="button" fontWeight="bold">
                                {item.brand}
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Turnaround: {item.avgTurnaroundHours} hrs
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Repair Dwell: {item.avgRepairDwellHours} hrs
                              </MDTypography>
                              <MDTypography variant="body2">
                                Avg Pickup Dwell: {item.avgPickupDwellHours} hrs
                              </MDTypography>
                            </MDBox>
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RepairTimeAnalysis;
