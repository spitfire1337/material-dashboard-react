import { useState } from "react";
//Global
import { globalFuncs } from "../../../context/global";

import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FormControl, Select, MenuItem, InputLabel, TextField, Divider, Grid } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import NodeRSA from "node-rsa";
import vars from "../../../config";
const step4 = ({ newConsignmentData, updateConsignmentData, nextRepairStep }) => {
  const { setSnackBar } = globalFuncs();
  const [idNumber, setIdNumber] = useState("");
  const [issuer, setIssuer] = useState("");
  const [expirationDate, setExpirationDate] = useState(null);
  const [idType, setIdType] = useState("");
  const usStates = [
    { name: "Alabama", abbreviation: "AL" },
    { name: "Alaska", abbreviation: "AK" },
    { name: "Arizona", abbreviation: "AZ" },
    { name: "Arkansas", abbreviation: "AR" },
    { name: "California", abbreviation: "CA" },
    { name: "Colorado", abbreviation: "CO" },
    { name: "Connecticut", abbreviation: "CT" },
    { name: "Delaware", abbreviation: "DE" },
    { name: "Florida", abbreviation: "FL" },
    { name: "Georgia", abbreviation: "GA" },
    { name: "Hawaii", abbreviation: "HI" },
    { name: "Idaho", abbreviation: "ID" },
    { name: "Illinois", abbreviation: "IL" },
    { name: "Indiana", abbreviation: "IN" },
    { name: "Iowa", abbreviation: "IA" },
    { name: "Kansas", abbreviation: "KS" },
    { name: "Kentucky", abbreviation: "KY" },
    { name: "Louisiana", abbreviation: "LA" },
    { name: "Maine", abbreviation: "ME" },
    { name: "Maryland", abbreviation: "MD" },
    { name: "Massachusetts", abbreviation: "MA" },
    { name: "Michigan", abbreviation: "MI" },
    { name: "Minnesota", abbreviation: "MN" },
    { name: "Mississippi", abbreviation: "MS" },
    { name: "Missouri", abbreviation: "MO" },
    { name: "Montana", abbreviation: "MT" },
    { name: "Nebraska", abbreviation: "NE" },
    { name: "Nevada", abbreviation: "NV" },
    { name: "New Hampshire", abbreviation: "NH" },
    { name: "New Jersey", abbreviation: "NJ" },
    { name: "New Mexico", abbreviation: "NM" },
    { name: "New York", abbreviation: "NY" },
    { name: "North Carolina", abbreviation: "NC" },
    { name: "North Dakota", abbreviation: "ND" },
    { name: "Ohio", abbreviation: "OH" },
    { name: "Oklahoma", abbreviation: "OK" },
    { name: "Oregon", abbreviation: "OR" },
    { name: "Pennsylvania", abbreviation: "PA" },
    { name: "Rhode Island", abbreviation: "RI" },
    { name: "South Carolina", abbreviation: "SC" },
    { name: "South Dakota", abbreviation: "SD" },
    { name: "Tennessee", abbreviation: "TN" },
    { name: "Texas", abbreviation: "TX" },
    { name: "Utah", abbreviation: "UT" },
    { name: "Vermont", abbreviation: "VT" },
    { name: "Virginia", abbreviation: "VA" },
    { name: "Washington", abbreviation: "WA" },
    { name: "West Virginia", abbreviation: "WV" },
    { name: "Wisconsin", abbreviation: "WI" },
    { name: "Wyoming", abbreviation: "WY" },
  ];
  const encryptId = async (data) => {
    const key = new NodeRSA(vars.publicKey);
    key.setOptions({ encryptionScheme: "pkcs1" }); // Ensure compatibility
    return key.encrypt(data, "base64"); // Encrypted data in base64
  };
  const handleNext = async () => {
    if (idNumber == "") {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Customer ID is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    if (issuer == "") {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "ID issuer is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    if (expirationDate == null) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Experation date is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    let encryptedId = await encryptId(idNumber);
    let consignmentData = { ...newConsignmentData };
    consignmentData.idNumber = encryptedId;
    updateConsignmentData({
      ...newConsignmentData,
      customerID: {
        type: idType,
        id: encryptedId,
        issuer: issuer,
        expiration: expirationDate,
      },
    });

    nextRepairStep(3);
  };
  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Customer Identification
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Type</InputLabel>
                <Select
                  fullWidth
                  labelId="demo-simple-select-label"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  sx={{ padding: "0.75rem !important" }}
                >
                  <MenuItem value="STATE_ID" sx={{ padding: "0.75rem !important" }}>
                    ID Card
                  </MenuItem>
                  <MenuItem value="DRIVER_LICENSE" sx={{ padding: "0.75rem !important" }}>
                    Driver License
                  </MenuItem>
                  <MenuItem value="PASSPORT" sx={{ padding: "0.75rem !important" }}>
                    Passport
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={12}>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  label="ID #"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item sm={6}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Issuer</InputLabel>
                <Select
                  fullWidth
                  labelId="demo-simple-select-label"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  sx={{ padding: "0.75rem !important" }}
                >
                  {usStates.map((state) => (
                    <MenuItem
                      key={state}
                      value={state.abbreviation}
                      sx={{ padding: "0.75rem !important" }}
                    >
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={6}>
              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Expiration Date"
                    value={expirationDate}
                    onChange={(newValue) => setExpirationDate(newValue)}
                  />
                </LocalizationProvider>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <MDButton fullWidth variant="outlined" color="primary" onClick={() => handleNext()}>
                Next
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step4;
