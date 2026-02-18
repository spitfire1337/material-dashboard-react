import { globalFuncs } from "../../context/global";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import { Grid, Icon } from "@mui/material";
import vars from "../../config";

const Step4 = ({ repairID, nextRepairStep, reRender, setNewRepair, disablePrint }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();

  const printRepair = async () => {
    setShowLoad(true);
    try {
      const response = await fetch(`${vars.serverUrl}/repairs/printDropOff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repairID }),
        credentials: "include",
      });
      const json = await response.json();
      if (json.res == 200) {
        setSnackBar({ type: "success", message: "Sent to printer", show: true, icon: "check" });
        handleComplete();
      } else {
        setSnackBar({ type: "error", message: "Error printing", show: true, icon: "warning" });
      }
    } catch (e) {
      setSnackBar({ type: "error", message: "Server error", show: true, icon: "warning" });
    }
    setShowLoad(false);
  };

  const handleComplete = () => {
    if (reRender) reRender();
    if (setNewRepair) setNewRepair(false);
    nextRepairStep(5);
  };

  return (
    <MDBox mt={3}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MDTypography variant="body2">
            The repair has been successfully created. What would you like to do next?
          </MDTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <MDButton
            fullWidth
            variant="gradient"
            color="info"
            onClick={printRepair}
            disabled={disablePrint}
          >
            <Icon>print</Icon>&nbsp;Print Paperwork & Finish
          </MDButton>
        </Grid>
        <Grid item xs={12} md={6}>
          <MDButton fullWidth variant="outlined" color="info" onClick={handleComplete}>
            Finish (No Print)
          </MDButton>
        </Grid>
      </Grid>
    </MDBox>
  );
};
export default Step4;
