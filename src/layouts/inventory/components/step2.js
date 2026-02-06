import { useState, useEffect, useMemo } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  TextField,
  Divider,
  Grid,
  FormControlLabel,
  FormGroup,
  Checkbox,
  NativeSelect,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import vars from "../../../config";
const step2 = ({ callback }) => {
  const [warrantyData, setwarrantyData] = useState({
    serialNumber: "",
    warrantyStart: dayjs(new Date()),
    warrantyLengthBattery: 0,
    warrantyLengthOther: 0,
    startonpurchase: false,
  });
  const [paramCount, setparamCount] = useState({
    serialNumber: false,
    warrantyStart: true,
    warrantyLengthBattery: false,
    warrantyLengthOther: false,
  });
  const [allowContinue, setAllowContinue] = useState(false);
  const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    return [
      values,
      (newValue) => {
        setValues({
          ...values,
          ...newValue,
        });
      },
    ];
  };
  //const [selectedcustomer, setSelectedCustomer] = useForm({});

  useEffect(() => {
    let canContinue = true;
    Object.keys(paramCount).forEach(function (key) {
      if (!paramCount[key]) canContinue = false;
    });
    setAllowContinue(canContinue);
  }, [paramCount]);
  const onChange = (value, param) => {
    let newparamCount = { ...paramCount };
    if (value !== "") {
      newparamCount[param] = true;
      setparamCount(newparamCount);
    } else {
      newparamCount[param] = false;
      setparamCount(newparamCount);
    }
    let newData = { ...warrantyData };
    newData[param] = value;
    setwarrantyData(newData);
  };

  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        PEV Details
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <MDTypography>All Fields are required</MDTypography>
            </Grid>
            <Grid item md={6} sm={12}>
              <TextField
                label="Motor Code"
                fullWidth
                value={warrantyData.motorcode}
                onChange={(e) => {
                  onChange(e.currentTarget.value, "serialNumber");
                  //setwarrantyData(newData);
                }}
              />
            </Grid>
            <Grid item md={6} sm={12}>
              <FormControl fullWidth size="small">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Warranty start date"
                    value={warrantyData.warrantyStart}
                    onChange={(date) => onChange(date, "warrantyStart")}
                  />
                </LocalizationProvider>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Starts @ purchase"
                  onChange={(e) => {
                    onChange(e.target.checked, "startonpurchase");
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item md={6} sm={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Battery Warranty</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={warrantyData.warrantyLengthBattery}
                  label="Battery Warranty"
                  onChange={(e) => onChange(e.target.value, "warrantyLengthBattery")}
                >
                  <MenuItem value={0.5}>.5 year</MenuItem>
                  <MenuItem value={1}>1 year</MenuItem>
                  <MenuItem value={1.5}>1.5 years</MenuItem>
                  <MenuItem value={2}>2 years</MenuItem>
                  <MenuItem value={3}>3 years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={6} sm={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Basic Warranty</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={warrantyData.warrantyLengthOther}
                  label="Basic Warranty"
                  onChange={(e) => onChange(e.target.value, "warrantyLengthOther")}
                >
                  <MenuItem value={1}>1 year</MenuItem>
                  <MenuItem value={1.5}>1.5 years</MenuItem>
                  <MenuItem value={2}>2 years</MenuItem>
                  <MenuItem value={3}>3 years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <MDButton
                fullWidth
                variant="outlined"
                color="primary"
                disabled={!allowContinue}
                onClick={() => callback(3, warrantyData)}
              >
                Next
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step2;
