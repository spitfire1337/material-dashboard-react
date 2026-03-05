import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, Menu, MenuItem } from "@mui/material";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSocket } from "context/socket";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import DataTable from "react-data-table-component";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  Title,
  Legend,
  Tooltip,
  BarSeries,
} from "@devexpress/dx-react-chart-material-ui";
import { Animation, EventTracker, Stack } from "@devexpress/dx-react-chart";

function TechRevenue() {
  const socket = useSocket();
  const chartRef = useRef(null);
  const [revenueData, setRevenueData] = useState([]);
  const { setShowLoad } = globalFuncs();
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    if (socket) {
      fetchRevenueData();
    }
  }, [socket]);

  const fetchRevenueData = (start, end) => {
    if (!socket) return;
    setShowLoad(true);
    const s = start && start.toISOString ? start : startDate;
    const e = end && end.toISOString ? end : endDate;
    const query = {
      startDate: s ? s.toISOString() : null,
      endDate: e ? e.toISOString() : null,
    };
    socket.emit("getTechRevenue", query, (res) => {
      if (res.res === 200) {
        setRevenueData(res.data);
      } else {
        console.error("Failed to fetch tech revenue data");
      }
      setShowLoad(false);
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

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

      doc.text("Technician Revenue Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`,
        14,
        22
      );

      const tableColumn = ["Technician", "Labor Revenue", "Parts Revenue", "Total Revenue"];
      const tableRows = revenueData.map((item) => [
        item.technician,
        formatCurrency(item.laborRevenue),
        formatCurrency(item.partsRevenue),
        formatCurrency(item.totalRevenue),
      ]);

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
        let finalY = doc.lastAutoTable.finalY + 10;

        if (finalY + imgHeight > doc.internal.pageSize.getHeight()) {
          doc.addPage();
          finalY = 10;
        }

        doc.addImage(imgData, "PNG", 15, finalY, imgWidth, imgHeight);
      }

      doc.save(`Tech_Revenue_${dayjs().format("YYYY-MM-DD")}.pdf`);
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
      const ws = wb.addWorksheet("Tech Revenue");

      ws.columns = [
        { header: "Technician", key: "technician", width: 30 },
        { header: "Labor Revenue", key: "laborRevenue", width: 20 },
        { header: "Parts Revenue", key: "partsRevenue", width: 20 },
        { header: "Total Revenue", key: "totalRevenue", width: 20 },
      ];

      revenueData.forEach((item) => {
        ws.addRow({
          technician: item.technician,
          laborRevenue: item.laborRevenue,
          partsRevenue: item.partsRevenue,
          totalRevenue: item.totalRevenue,
        });
      });

      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current);
        const imgData = canvas.toDataURL("image/png");
        const imageId = wb.addImage({ base64: imgData, extension: "png" });
        ws.addImage(imageId, {
          tl: { col: 0, row: revenueData.length + 2 },
          ext: { width: 800, height: 450 },
        });
      }

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Tech_Revenue_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const columns = [
    {
      name: "Technician",
      selector: (row) => row.technician,
      sortable: true,
    },
    {
      name: "Labor Revenue",
      selector: (row) => row.laborRevenue,
      sortable: true,
      format: (row) => formatCurrency(row.laborRevenue),
    },
    {
      name: "Parts Revenue",
      selector: (row) => row.partsRevenue,
      sortable: true,
      format: (row) => formatCurrency(row.partsRevenue),
    },
    {
      name: "Total Revenue",
      selector: (row) => row.totalRevenue,
      sortable: true,
      format: (row) => formatCurrency(row.totalRevenue),
    },
  ];

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
                      <MDButton variant="contained" color="info" onClick={() => fetchRevenueData()}>
                        Apply Filters
                      </MDButton>
                    </Grid>
                    {/* Quick Filters */}
                    <Grid item xs={12} md={2}>
                      <MDButton
                        color="info"
                        variant="outlined"
                        onClick={() => {
                          const start = dayjs().subtract(30, "day");
                          const end = dayjs();
                          setStartDate(start);
                          setEndDate(end);
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
                          fetchRevenueData(start, end);
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
              <MDBox p={3}>
                <MDTypography variant="h6">Technician Revenue</MDTypography>
                <MDBox ref={chartRef} mb={3}>
                  {revenueData.length > 0 ? (
                    <Chart data={revenueData}>
                      <ArgumentAxis />
                      <ValueAxis tickFormat={() => formatCurrency} />
                      <BarSeries
                        valueField="laborRevenue"
                        argumentField="technician"
                        name="Labor"
                      />
                      <BarSeries
                        valueField="partsRevenue"
                        argumentField="technician"
                        name="Parts"
                      />
                      <Stack />
                      <Title text="Revenue by Technician (Labor vs Parts)" />
                      <Animation />
                      <Legend />
                      <EventTracker />
                      <Tooltip
                        contentComponent={(props) => {
                          const item = revenueData[props.targetItem.point];
                          return (
                            <Tooltip.Content
                              {...props}
                              text={`${props.targetItem.series}: ${formatCurrency(props.text)}`}
                            />
                          );
                        }}
                      />
                    </Chart>
                  ) : (
                    <MDTypography>No data available</MDTypography>
                  )}
                </MDBox>
                <DataTable columns={columns} data={revenueData} pagination persistTableHead />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TechRevenue;
