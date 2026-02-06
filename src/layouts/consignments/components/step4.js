import { useState } from "react";
//Global
import { globalFuncs } from "../../../context/global";

import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { FormControl, Select, MenuItem, InputLabel, TextField, Divider, Grid } from "@mui/material";
import vars from "../../../config";
const step4 = ({ globalFunc, newConsignmentData, updateConsignmentData, nextRepairStep }) => {
  const { setSnackBar } = globalFuncs();
  const [mileage, setMileage] = useState("0");
  const [serialNumber, setSerialNumber] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [condition, setCondition] = useState("");
  const [value, setValue] = useState({ editorState: EditorState.createEmpty() });

  const onEditorStateChange = (editorState) => {
    setValue({ editorState });
  };

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
  const updateRepair = async (pev) => {
    if (serialNumber == "") {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Serial number/Motor code is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    if (mileage == 0) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Mileage is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    if (condition == "") {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "PEV Condition is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    if (salePrice == 0) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Sale price is required",
        show: true,
        icon: "warning",
      });
      return;
    }
    const response = await fetch(`${vars.serverUrl}/square/getNextSku`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sku: 1095 }),
      credentials: "include",
    });
    const json = await response.json();
    //setCustomerID(json.data.customer.id);
    if (json.res == 200) {
      let newRepairData = { ...newConsignmentData };
      console.log("New Repair Data: ", newRepairData);
      newRepairData.PEVSerialNumber = serialNumber;
      newRepairData.itemData.variations[0].itemVariationData.name = "";
      newRepairData.itemData.variations[0].itemVariationData.priceMoney.amount = salePrice * 100;
      newRepairData.itemData.variations[0].itemVariationData.sku = Number(json.data);
      newRepairData.itemData.descriptionHtml = `Mileage: ${mileage}<br/>Condition: ${condition}<br/>Details: ${draftToHtml(
        convertToRaw(value.editorState.getCurrentContent())
      )}`;
      updateConsignmentData(newRepairData);
      nextRepairStep(5);
    } else {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Error occurred creating new consignment.",
        show: true,
        icon: "warning",
      });
    }
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
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  label="Motor Code/Serial Number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Condition</InputLabel>
                <Select
                  fullWidth
                  labelId="demo-simple-select-label"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  sx={{ padding: "0.75rem !important" }}
                >
                  <MenuItem value={""} sx={{ padding: "0.75rem !important" }}></MenuItem>
                  <MenuItem value={"Used - Needs love"} sx={{ padding: "0.75rem !important" }}>
                    Used - Needs love
                  </MenuItem>
                  <MenuItem value={"Used - Good condition"} sx={{ padding: "0.75rem !important" }}>
                    Used - Good condition
                  </MenuItem>
                  <MenuItem
                    value={"Used - Excellent condition"}
                    sx={{ padding: "0.75rem !important" }}
                  >
                    Used - Excellent condition
                  </MenuItem>
                  <MenuItem value={"New"} sx={{ padding: "0.75rem !important" }}>
                    New
                  </MenuItem>
                  <MenuItem value={"Certified Pre-Owned"} sx={{ padding: "0.75rem !important" }}>
                    Certified Pre-Owned
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  label="Mileage"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item sm={12}>
              <MDTypography variant="h6" gutterBottom>
                Other Details
              </MDTypography>
              <Editor
                editorState={value.editorState}
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"
                toolbarClassName="toolbar-class"
                onEditorStateChange={onEditorStateChange}
                toolbar={{
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                  history: { inDropdown: true },
                }}
              />
            </Grid>
            <Grid item sm={12}>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  label="Sale Price (Price displayed on web and POS)"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item sm={12}></Grid>
            <Grid item sm={12}>
              <MDButton fullWidth variant="outlined" color="primary" onClick={() => updateRepair()}>
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
