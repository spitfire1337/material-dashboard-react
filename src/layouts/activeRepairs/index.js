import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import parse from "html-react-parser";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import {
  Card,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Icon,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import DataTable from "react-data-table-component";
import vars from "../../config";
import { globalFuncs } from "../../context/global";
import Actions from "../repairs/components/quickActions";
import NewRepairButton from "../../components/NewRepairButton";
import { useSocket } from "context/socket";

const Status = ({ repairStatus }) => {
  if (repairStatus == 0) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Created" color="success" container />
      </MDBox>
    );
  }
  if (repairStatus == 1) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Not started" color="warning" container />
      </MDBox>
    );
  }
  if (repairStatus == 2) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="In Progress" color="info" container />
      </MDBox>
    );
  }
  if (repairStatus == 3) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Paused" color="secondary" container />
      </MDBox>
    );
  }
  if (repairStatus == 4) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Repair Complete" color="success" container />
      </MDBox>
    );
  }
  if (repairStatus == 5) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Invoice Created" color="warning" container />
      </MDBox>
    );
  }
  if (repairStatus == 11) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Paused - Awaiting parts" color="secondary" container />
      </MDBox>
    );
  }
  if (repairStatus == 6) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Complete" color="success" container />
      </MDBox>
    );
  }
  if (repairStatus == 997) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Cancelled - Return to Customer" color="error" container />
      </MDBox>
    );
  }
  if (repairStatus == 998) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Cancelled" color="error" container />
      </MDBox>
    );
  }
  if (repairStatus == 999) {
    return (
      <MDBox ml={-1}>
        <MDBadge badgeContent="Unrepairable" color="error" container />
      </MDBox>
    );
  }
  return null;
};

const ExpandedComponent = ({ data, fetchRepairs }) => {
  const repairDetails = data;
  return (
    <Grid container mt={2} padding={2} spacing={2}>
      <Grid item xs={4}>
        <Card>
          <MDBox
            mx={1}
            mt={-3}
            py={2}
            px={1}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Customer Details
            </MDTypography>
          </MDBox>
          <MDBox mx={2} py={3} px={2}>
            <MDTypography variant="subtitle2">
              {repairDetails.Customer?.given_name} {repairDetails.Customer?.family_name}
              {repairDetails.Customer?.address != undefined
                ? [<br key="1" />, repairDetails.Customer.address.address_line_1]
                : ""}
              {repairDetails.Customer?.address != undefined
                ? repairDetails.Customer.address.address_line_2 != undefined
                  ? [<br key="2" />, repairDetails.Customer.address.address_line_2]
                  : ""
                : ""}
              {repairDetails.Customer?.address != undefined
                ? [
                    <br key="3" />,
                    repairDetails.Customer.address.locality || "",
                    ", ",
                    repairDetails.Customer.address.administrative_district_level_1 || "",
                    " ",
                    repairDetails.Customer.address.postal_code || "",
                  ]
                : ""}
              {repairDetails.Customer?.email_address != undefined
                ? [<br key="4" />, repairDetails.Customer.email_address]
                : ""}
              {repairDetails.Customer?.phone_number != undefined
                ? [<br key="5" />, repairDetails.Customer.phone_number]
                : ""}
            </MDTypography>
          </MDBox>
        </Card>
      </Grid>
      <Grid item xs={5}>
        <Card>
          <MDBox
            mx={1}
            mt={-3}
            py={2}
            px={1}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <Grid container>
              <Grid item xs={6} alignItems="center">
                <MDTypography variant="h6" color="white">
                  Repair Details
                </MDTypography>
              </Grid>
              <Grid item xs={6} alignItems="center" textAlign="right">
                <Status repairStatus={repairDetails.status} />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox mx={2} py={3} px={2}>
            <MDTypography variant="body1">
              {repairDetails.pev?.Brand?.name} {repairDetails.pev?.Model}
            </MDTypography>
            <MDTypography variant="body1">Repair Type:</MDTypography>
            <MDTypography variant="body2">
              {repairDetails.RepairType?.map((type) => {
                return ` ${type}, `;
              })}
            </MDTypography>
            <MDTypography variant="body1">Details:</MDTypography>
            <MDTypography variant="body2">
              {repairDetails.Details
                ? parse(repairDetails.Details)
                : repairDetails.issue || "No details provided"}
            </MDTypography>
          </MDBox>
        </Card>
      </Grid>
      <Grid item xs={12} sm={3} mt={2}>
        <Card>
          <MDBox
            mx={1}
            mt={-3}
            py={2}
            px={1}
            variant="gradient"
            bgColor="info"
            borderRadius="lg"
            coloredShadow="info"
          >
            <MDTypography variant="h6" color="white">
              Quick Actions
            </MDTypography>
          </MDBox>
          <MDBox mx={2} py={3} px={2}>
            <Actions
              status={repairDetails.status}
              repairID={repairDetails._id}
              repairTime={repairDetails.repairTime || 0}
              reRender={fetchRepairs}
              getRepair={fetchRepairs}
              repair={repairDetails}
            />
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
};

function ActiveRepairs() {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const defaultStatusFilter = [1, 2, 3, 11, 4, 5];

  const savedState = useMemo(() => {
    try {
      const saved = sessionStorage.getItem("activeRepairsState");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }, []);

  const [repairs, setRepairs] = useState([]);
  const [searchText, setSearchText] = useState(savedState.searchText || "");
  const [repairTypeFilter, setRepairTypeFilter] = useState(savedState.repairTypeFilter || "");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState(savedState.deviceTypeFilter || "");
  const [statusFilter, setStatusFilter] = useState(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      return [parseInt(statusParam)];
    }
    return savedState.statusFilter || defaultStatusFilter;
  });
  const [currentPage, setCurrentPage] = useState(savedState.currentPage || 1);
  const navigate = useNavigate();

  const statusOptions = [
    { value: 0, label: "Created" },
    { value: 1, label: "Not Started" },
    { value: 2, label: "In Progress" },
    { value: 3, label: "Paused" },
    { value: 11, label: "Paused - Awaiting Parts" },
    { value: 4, label: "Repair Complete" },
    { value: 5, label: "Invoice Created" },
    { value: 6, label: "Complete" },
    { value: 997, label: "Cancelled - Return to Customer" },
    { value: 998, label: "Cancelled" },
    { value: 999, label: "Unrepairable" },
  ];

  const repairTypes = ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"];
  const deviceTypes = ["EUC", "Scooter", "OneWheel", "Ebike", "Emoto", "Eskate"];

  const fetchRepairs = () => {
    setShowLoad(true);
    if (socket) {
      socket.emit("getRepairs");
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("repairs", (res) => {
        setRepairs(res);
        setShowLoad(false);
      });

      socket.on("updatedRepair", (resp) => {
        setRepairs((prevRepairs) =>
          prevRepairs.map((repair) => (repair._id === resp.data._id ? resp.data : repair))
        );
      });

      socket.on("newrepairAdded", (newRepair) => {
        setRepairs((prevRepairs) => [...prevRepairs, newRepair.data]);
      });

      return () => {
        socket.off("repairs");
        socket.off("updatedRepair");
        socket.off("newrepairAdded");
      };
    }
  }, [socket]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setStatusFilter([parseInt(statusParam)]);
    }
    if (socket) fetchRepairs();
  }, [searchParams, socket]);

  useEffect(() => {
    sessionStorage.setItem(
      "activeRepairsState",
      JSON.stringify({
        searchText,
        repairTypeFilter,
        deviceTypeFilter,
        statusFilter,
        currentPage,
      })
    );
  }, [searchText, repairTypeFilter, deviceTypeFilter, statusFilter, currentPage]);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const matchesStatus =
        statusFilter.length === 0 || statusFilter.includes(parseInt(repair.status));
      const matchesRepairType =
        !repairTypeFilter || (repair.RepairType && repair.RepairType.includes(repairTypeFilter));
      const matchesDeviceType =
        !deviceTypeFilter ||
        repair.pev?.type === deviceTypeFilter ||
        repair.pev?.PevType === deviceTypeFilter;

      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        (repair.Customer?.given_name?.toLowerCase() || "").includes(searchLower) ||
        (repair.Customer?.family_name?.toLowerCase() || "").includes(searchLower) ||
        (repair.repairID?.toString() || "").includes(searchLower) ||
        (repair.pev?.Brand?.name?.toLowerCase() || "").includes(searchLower) ||
        (repair.pev?.Model?.toLowerCase() || "").includes(searchLower);

      return matchesStatus && matchesRepairType && matchesDeviceType && matchesSearch;
    });
  }, [repairs, statusFilter, repairTypeFilter, deviceTypeFilter, searchText]);

  const columns = [
    {
      name: "ID",
      selector: (row) => row.repairID,
      sortable: true,
      width: "80px",
    },
    {
      name: "Customer",
      selector: (row) => `${row.Customer?.given_name} ${row.Customer?.family_name}`,
      sortable: true,
    },
    {
      name: "Device",
      selector: (row) => `${row.pev?.Brand?.name} ${row.pev?.Model}`,
      sortable: true,
    },
    {
      name: "Device Type",
      selector: (row) => row.pev?.type || row.pev?.PevType || "",
      sortable: true,
    },
    {
      name: "Repair Type",
      selector: (row) => (row.RepairType ? row.RepairType.join(", ") : ""),
      sortable: true,
      wrap: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <Status repairStatus={row.status} />,
    },
    {
      name: "Date In",
      selector: (row) => row.createdAt,
      sortable: true,
      format: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      name: "Last Updated",
      selector: (row) => row.updatedAt,
      sortable: true,
      format: (row) => new Date(row.updatedAt).toLocaleString(),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Active Repairs
                </MDTypography>
                <NewRepairButton reRender={fetchRepairs} />
              </MDBox>
              <MDBox pt={3} px={2}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Search Customer, ID, Device"
                      variant="outlined"
                      fullWidth
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        multiple
                        value={statusFilter}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes("defaults")) {
                            setStatusFilter(defaultStatusFilter);
                          } else {
                            setStatusFilter(val);
                          }
                        }}
                        input={<OutlinedInput label="Status" />}
                        renderValue={(selected) =>
                          selected
                            .map((val) => statusOptions.find((opt) => opt.value === val)?.label)
                            .join(", ")
                        }
                        sx={{ height: "44px" }}
                      >
                        <MenuItem value="defaults">
                          <ListItemText primary="Select Defaults" />
                        </MenuItem>
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={statusFilter.indexOf(option.value) > -1} />
                            <ListItemText primary={option.label} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Repair Type</InputLabel>
                      <Select
                        value={repairTypeFilter}
                        label="Repair Type"
                        onChange={(e) => setRepairTypeFilter(e.target.value)}
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
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Device Type</InputLabel>
                      <Select
                        value={deviceTypeFilter}
                        label="Device Type"
                        onChange={(e) => setDeviceTypeFilter(e.target.value)}
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
                </Grid>
                <DataTable
                  columns={columns}
                  data={filteredRepairs}
                  pagination
                  paginationDefaultPage={currentPage}
                  onChangePage={(page) => setCurrentPage(page)}
                  expandableRows
                  expandableRowsComponent={ExpandedComponent}
                  expandableRowsComponentProps={{ fetchRepairs }}
                  onRowClicked={(row) => navigate(`/repairdetails/${row._id}`)}
                  pointerOnHover
                  highlightOnHover
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ActiveRepairs;
