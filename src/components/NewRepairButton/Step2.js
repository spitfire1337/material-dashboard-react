import { useState, useEffect } from "react";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import {
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
  Grid,
  NativeSelect,
  createFilterOptions,
} from "@mui/material";
import vars from "../../config";

const filter = createFilterOptions();

const Step2 = ({ repairData, updateRepairData, setrepairID, nextRepairStep }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const [pevs, setPevs] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [pevDetails, setPevDetails] = useState({
    Brand: { name: "" },
    Model: "",
    PevType: "",
    Voltage: "",
    Motor: "",
    BatterySize: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setShowLoad(true);
      const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getPEVS`, {
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 200) {
        setPevs(res.data);
        const uniqueBrands = [
          ...new Set(res.data.map((p) => p.Brand?.name).filter((n) => n)),
        ].sort();
        setBrands(uniqueBrands);
      }
      setShowLoad(false);
    };
    fetchData();
  }, []);

  const handleBrandChange = (event, newValue) => {
    const brandName = typeof newValue === "string" ? newValue : newValue?.inputValue || newValue;
    setSelectedBrand(brandName);
    setPevDetails((prev) => ({
      ...prev,
      Brand: { name: brandName || "" },
      Model: "",
      _id: null,
      PevType: "",
    }));
    setSelectedModel(null);
  };

  const handleModelChange = (event, newValue) => {
    if (typeof newValue === "string" || (newValue && newValue.inputValue)) {
      const modelName = newValue.inputValue || newValue;
      setSelectedModel(modelName);
      setPevDetails((prev) => ({
        ...prev,
        Model: modelName,
        _id: null,
        PevType: prev._id ? "" : prev.PevType,
      }));
    } else {
      setSelectedModel(newValue);
      if (newValue) {
        setPevDetails(newValue);
      } else {
        setPevDetails((prev) => ({ ...prev, Model: "", _id: null, PevType: "" }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!pevDetails.Brand.name || !pevDetails.Model) {
      setSnackBar({
        type: "error",
        message: "Brand and Model are required",
        show: true,
        icon: "warning",
      });
      return;
    }

    if (!pevDetails._id && !pevDetails.PevType) {
      setSnackBar({
        type: "error",
        message: "PEV Type is required for new models",
        show: true,
        icon: "warning",
      });
      return;
    }

    setShowLoad(true);
    try {
      let pevId = pevDetails._id;
      if (!pevId) {
        const brandRes = await fetch(`${vars.serverUrl}/repairs/createBrand`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: pevDetails.Brand.name }),
          credentials: "include",
        });
        const brandJson = await brandRes.json();
        if (brandJson.res !== 200) throw new Error("Failed to create/fetch brand");
        const brandId = brandJson.data._id || brandJson.data;

        const pevData = { ...pevDetails };
        delete pevData._id;

        const pevRes = await fetch(`${vars.serverUrl}/repairs/createPEV`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...pevData, Brand: { _id: brandId } }),
          credentials: "include",
        });
        const pevJson = await pevRes.json();
        if (pevJson.res !== 200) throw new Error("Failed to create PEV");
        pevId = pevJson.data._id;
      }

      const repairRes = await fetch(`${vars.serverUrl}/repairs/createRepair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...repairData, pev: pevId }),
        credentials: "include",
      });
      const repairJson = await repairRes.json();

      if (repairJson.res === 200) {
        setrepairID(repairJson.data._id);
        nextRepairStep(3);
      } else {
        throw new Error("Failed to create repair");
      }
    } catch (e) {
      console.error(e);
      setSnackBar({
        type: "error",
        message: e.message || "Server error",
        show: true,
        icon: "error",
      });
    }
    setShowLoad(false);
  };

  const filteredModels = pevs.filter(
    (p) => !selectedBrand || p.Brand?.name === (selectedBrand.inputValue || selectedBrand)
  );

  return (
    <MDBox mt={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            freeSolo
            options={brands}
            value={selectedBrand}
            onChange={handleBrandChange}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue !== "")
                filtered.push({
                  inputValue: params.inputValue,
                  label: `Add "${params.inputValue}"`,
                });
              return filtered;
            }}
            renderInput={(params) => <TextField {...params} label="Brand" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            freeSolo
            disabled={!selectedBrand}
            options={filteredModels}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.Model || "")}
            value={selectedModel}
            onChange={handleModelChange}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue !== "")
                filtered.push({
                  inputValue: params.inputValue,
                  Model: `Add "${params.inputValue}"`,
                });
              return filtered;
            }}
            renderInput={(params) => <TextField {...params} label="Model" fullWidth />}
          />
        </Grid>
        {!pevDetails._id && pevDetails.Model && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel variant="standard" htmlFor="uncontrolled-native">
                PEV Type
              </InputLabel>
              <NativeSelect
                value={pevDetails.PevType}
                onChange={(e) => setPevDetails({ ...pevDetails, PevType: e.target.value })}
                inputProps={{
                  name: "pevType",
                  id: "uncontrolled-native",
                }}
              >
                <option value="" disabled></option>
                <option value="EUC">EUC</option>
                <option value="Scooter">Scooter</option>
                <option value="OneWheel">OneWheel</option>
                <option value="Ebike">Ebike</option>
                <option value="Emoto">Emoto</option>
                <option value="Eskate">Eskate</option>
              </NativeSelect>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12}>
          <MDButton variant="gradient" color="info" fullWidth onClick={handleSubmit}>
            Next
          </MDButton>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default Step2;
