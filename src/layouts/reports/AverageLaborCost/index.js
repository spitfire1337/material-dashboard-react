import { useState, useEffect } from "react";
import { useSocket } from "context/socket";
import { globalFuncs } from "context/global";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { Card, Grid, TextField, Autocomplete } from "@mui/material";
import DataTable from "react-data-table-component";

const AverageLaborCost = () => {
  const socket = useSocket();
  const { setShowLoad } = globalFuncs();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    if (socket) {
      setShowLoad(true);
      socket.emit("getAverageLaborCostByModel", {}, (res) => {
        setShowLoad(false);
        if (res.res === 200) {
          setData(res.data);
          setFilteredData(res.data);

          // Extract unique brands and models for filters
          const uniqueBrands = [...new Set(res.data.map((item) => item.brand).filter(Boolean))];
          setBrands(uniqueBrands);

          const uniqueModels = [...new Set(res.data.map((item) => item.model).filter(Boolean))];
          setModels(uniqueModels);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    let filtered = data;
    if (selectedBrand) {
      filtered = filtered.filter((item) => item.brand === selectedBrand);
    }
    if (selectedModel) {
      filtered = filtered.filter((item) => item.model === selectedModel);
    }
    setFilteredData(filtered);
  }, [selectedBrand, selectedModel, data]);

  const columns = [
    {
      name: "Brand",
      selector: (row) => row.brand,
      sortable: true,
    },
    {
      name: "Model",
      selector: (row) => row.model,
      sortable: true,
    },
    {
      name: "Repair Type",
      selector: (row) => row.repairType,
      sortable: true,
    },
    {
      name: "Avg Labor Cost",
      selector: (row) => row.avgLaborCost,
      sortable: true,
      format: (row) => `$${Number(row.avgLaborCost || 0).toFixed(2)}`,
    },
    {
      name: "Repair Count",
      selector: (row) => row.count,
      sortable: true,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
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
              >
                <MDTypography variant="h6" color="white">
                  Average Labor Cost Report
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={brands}
                      value={selectedBrand}
                      onChange={(event, newValue) => {
                        setSelectedBrand(newValue);
                        setSelectedModel(null); // Reset model when brand changes
                      }}
                      renderInput={(params) => <TextField {...params} label="Filter by Brand" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={models.filter(
                        (m) =>
                          !selectedBrand ||
                          data.find((d) => d.brand === selectedBrand && d.model === m)
                      )}
                      value={selectedModel}
                      onChange={(event, newValue) => setSelectedModel(newValue)}
                      renderInput={(params) => <TextField {...params} label="Filter by Model" />}
                    />
                  </Grid>
                </Grid>
                <DataTable columns={columns} data={filteredData} pagination persistTableHead />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default AverageLaborCost;
