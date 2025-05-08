import { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  NativeSelect,
  Select,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
function getStyles(name, filterVal, theme) {
  return {
    fontWeight: filterVal.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

import MDButton from "components/MDButton";
function FilterDialog({ showFilter, filter, resetFilter, setShowFiler, repairs }) {
  const theme = useTheme();
  const [filterVal, setfilterVal] = useState([]);
  const [filteKey, setfilterKey] = useState();
  const [pevBrands, setPevBrands] = useState([]);
  const [statuses, setstatuses] = useState([0, 1, 2, 3, 4, 5]);
  const [repairTypes, setrepairTypes] = useState([
    "Tire Change",
    "Tube Change",
    "Power issue",
    "Mechanical Repair",
    "Other",
  ]);
  const [filterData, setfilterData] = useState({
    status: [0, 1, 2, 3, 4, 5],
    RepairType: ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"],
  });
  const defaultFilters = {
    status: [0, 1, 2, 3, 4, 5],
    RepairType: ["Tire Change", "Tube Change", "Power issue", "Mechanical Repair", "Other"],
  };
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setstatuses(typeof value === "string" ? value.split(",") : value);
    setfilterData(
      // On autofill we get a stringified value.
      { status: typeof value === "string" ? value.split(",") : value }
    );
  };

  const handleChange2 = (event) => {
    const {
      target: { value },
    } = event;
    console.log("Selected:", value);
    setrepairTypes(typeof value === "string" ? value.split(",") : value);
    setfilterData(
      // On autofill we get a stringified value.
      { RepairType: typeof value === "string" ? value.split(",") : value }
    );
  };
  useEffect(() => {
    console.log("Selected filters:", filterData);
  }, [filterData]);
  useEffect(() => {
    var unique = repairs.filter(
      (item, idx) => repairs.findIndex((x) => x.pev._id == item.pev._id) == idx
    );
    let brands = [];
    unique.map((brand) => {
      brands.push({ id: brand._id, label: brand.name });
    });
    setPevBrands(brands);
  }, [repairs]);
  return (
    <Dialog open={showFilter}>
      <DialogTitle>Filter Repairs</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Status</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={statuses}
            label="Status"
            multiple
            input={<OutlinedInput label="Status" />}
            MenuProps={MenuProps}
            onChange={handleChange}
            //     (e) => {
            //   setfilterVal(e.target.value);
            //   setfilterKey("status");
            //   setfilterData({ status: [e.target.value] });
            // }}
          >
            <MenuItem value={0}>Created</MenuItem>
            <MenuItem value={1}>Not started</MenuItem>
            <MenuItem value={2}>In Progress</MenuItem>
            <MenuItem value={3}>Paused</MenuItem>
            <MenuItem value={4}>Repair Complete</MenuItem>
            <MenuItem value={5}>Invoice Created</MenuItem>
            <MenuItem value={6}>Complete</MenuItem>
          </Select>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={repairTypes}
            label="Repair Type"
            multiple
            input={<OutlinedInput label="Repair Type" />}
            MenuProps={MenuProps}
            onChange={handleChange2}
          >
            <MenuItem value="Tire Change">Tire Change</MenuItem>
            <MenuItem value="Tube Change">Tube Change</MenuItem>
            <MenuItem value="Power issue">Power issue</MenuItem>
            <MenuItem value="Mechanical Repair">Mechanical Repair</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <MDButton
          onClick={() => {
            resetFilter();
            setfilterData(defaultFilters);
            // setrepairTypes(defaultFilters.repairTypes);
            // setstatuses(defaultFilters.status);
            setShowFiler(false);
          }}
        >
          Reset filters
        </MDButton>
        <MDButton onClick={() => setShowFiler(false)}>Cancel</MDButton>
        <MDButton
          onClick={() => {
            filter(filterData);
            setShowFiler(false);
          }}
        >
          Filter
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default FilterDialog;
