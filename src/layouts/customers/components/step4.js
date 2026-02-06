//Global
import { globalFuncs } from "../../context/global";

import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { FormControl, Divider, Grid } from "@mui/material";

import vars from "../../../config";

const step4 = ({ repairID, nextRepairStep, reRender, setNewRepair }) => {
  const { setSnackBar } = globalFuncs();
  const printRepair = async (pev) => {
    try {
      let postData = {
        id: repairID,
      };
      const response = await fetch(`${vars.serverUrl}/repairs/printDropOff`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      const json = await response.json();
      //setCustomerID(json.data.customer.id);
      if (json.res == 200) {
        reRender();
        setNewRepair(false);
        nextRepairStep(5);
        setSnackBar({
          type: "success",
          title: "Success",
          message: "Sent to printer",
          show: true,
          icon: "check",
        });
      } else {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error occurred saving repair progress.",
          show: true,
          icon: "warning",
        });
      }
    } catch (e) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Error occurred saving repair progress.",
        show: true,
        icon: "warning",
      });
      // TODO: Add error notification
    }
  };

  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Repair information
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Divider fullWidth></Divider>
          <Grid container spacing={1} marginTop={1}>
            <Grid item sm={12}>
              <MDButton fullWidth variant="outlined" color="primary" onClick={() => printRepair()}>
                Print paperwork & Complete intake
              </MDButton>
            </Grid>
          </Grid>
        </FormControl>
      </MDTypography>
    </>
  );
};
export default step4;
