import React, { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, Menu, MenuItem, Icon } from "@mui/material";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSocket } from "context/socket";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import DataTable from "react-data-table-component";

function CustomerLoyalty() {
  const socket = useSocket();
  const [loyaltyData, setLoyaltyData] = useState([]);
  const { setShowLoad, setAiChatOpen, setAiLoading, setSnackBar } = globalFuncs();
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "year"));
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    if (socket) {
      fetchLoyaltyData();
    }
  }, [socket]);

  const fetchLoyaltyData = (start, end) => {
    if (!socket) return;
    setShowLoad(true);
    const s = start && start.toISOString ? start : startDate;
    const e = end && end.toISOString ? end : endDate;
    const query = {
      startDate: s ? s.toISOString() : null,
      endDate: e ? e.toISOString() : null,
    };
    socket.emit("getCustomerLoyalty", query, (res) => {
      if (res.res === 200) {
        setLoyaltyData(res.data);
      } else {
        console.error("Failed to fetch customer loyalty data");
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

  const handleAiAnalysis = () => {
    if (!socket) return;
    setAiChatOpen(true);
    setAiLoading(true);
    const query = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    socket.emit("analyzeReport", { reportType: "customerLoyalty", query: query }, (res) => {
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

  const exportToPDF = async () => {
    handleExportClose();
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();

      doc.text("Customer Loyalty Report", 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.format("MM/DD/YYYY")} - ${endDate.format("MM/DD/YYYY")}`,
        14,
        22
      );

      const tableColumn = ["Name", "Email", "Phone", "Total Spent", "Visit Count", "Last Visit"];
      const tableRows = loyaltyData.map((item) => [
        item.name,
        item.email,
        item.phone,
        formatCurrency(item.totalSpent),
        item.visitCount,
        dayjs(item.lastVisit).format("MM/DD/YYYY"),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
      });

      doc.save(`Customer_Loyalty_${dayjs().format("YYYY-MM-DD")}.pdf`);
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

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Customer Loyalty");

      ws.columns = [
        { header: "Name", key: "name", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 20 },
        { header: "Total Spent", key: "totalSpent", width: 15 },
        { header: "Visit Count", key: "visitCount", width: 15 },
        { header: "Last Visit", key: "lastVisit", width: 15 },
      ];

      loyaltyData.forEach((item) => {
        ws.addRow({
          name: item.name,
          email: item.email,
          phone: item.phone,
          totalSpent: item.totalSpent,
          visitCount: item.visitCount,
          lastVisit: dayjs(item.lastVisit).format("MM/DD/YYYY"),
        });
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Customer_Loyalty_${dayjs().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: "Total Spent",
      selector: (row) => row.totalSpent,
      sortable: true,
      format: (row) => formatCurrency(row.totalSpent),
    },
    {
      name: "Visit Count",
      selector: (row) => row.visitCount,
      sortable: true,
    },
    {
      name: "Last Visit",
      selector: (row) => row.lastVisit,
      sortable: true,
      format: (row) => dayjs(row.lastVisit).format("MM/DD/YYYY"),
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
                      <MDButton variant="contained" color="info" onClick={() => fetchLoyaltyData()}>
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
                          fetchLoyaltyData(start, end);
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
                          fetchLoyaltyData(start, end);
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
                          fetchLoyaltyData(start, end);
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
                          fetchLoyaltyData(start, end);
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
                          fetchLoyaltyData(start, end);
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
                          fetchLoyaltyData(start, end);
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
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Customer Loyalty (Top Spenders)</MDTypography>
                <DataTable columns={columns} data={loyaltyData} pagination persistTableHead />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CustomerLoyalty;
