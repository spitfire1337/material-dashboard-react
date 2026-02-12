import { useState } from "react";

import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { FormControl, Divider, Grid } from "@mui/material";
import { globalFuncs } from "context/global";
import vars from "../../../config";

const step6 = ({ newConsignmentData, reRender, setNewRepair }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const submitConsignment = async (pev) => {
    setNewRepair(false);
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/square/createConsignment`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: newConsignmentData }),
        credentials: "include",
      });
      const json = await response.json();
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        //nextRepairStep(7);
        setShowLoad(false);
        reRender();
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Consignment saved",
          show: true,
          icon: "check",
        });
      } else {
        setShowLoad(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error occurred saving consignment.",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      setShowLoad(false);
      console.error(e);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Error occurred saving consignment.",
        show: true,
        icon: "warning",
      });
    }
  };

  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Consignment finalization
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <MDButton
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => submitConsignment()}
              >
                Print paperwork & Complete intake
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step6;
