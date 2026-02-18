import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Steps
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

function NewRepairButton({ reRender, size = "full" }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [repairData, setRepairData] = useState({});
  const [repairID, setRepairID] = useState(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpen = () => {
    setStep(1);
    setRepairData({});
    setRepairID(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const nextRepairStep = (nextStep, data) => {
    if (step === 1 && data) {
      setRepairData((prev) => ({ ...prev, Customer: data }));
    }
    if (nextStep === 5) {
      handleClose();
      if (reRender) reRender();
    } else {
      setStep(nextStep);
    }
  };

  const updateRepairData = (data) => {
    setRepairData((prev) => ({ ...prev, ...data }));
  };

  return (
    <>
      {size === "icon" ? (
        <Tooltip title="New Repair">
          <IconButton color="info" onClick={handleOpen}>
            <Icon>add_circle</Icon>
          </IconButton>
        </Tooltip>
      ) : (
        <MDButton variant="gradient" color="info" onClick={handleOpen}>
          <Icon>add</Icon>&nbsp;New Repair
        </MDButton>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
        aria-labelledby="new-repair-dialog-title"
        PaperProps={{
          sx: {
            minHeight: "50vh",
          },
        }}
      >
        <DialogTitle
          id="new-repair-dialog-title"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <MDTypography variant="h6" fontWeight="medium">
            New Repair
          </MDTypography>
          <IconButton onClick={handleClose} aria-label="close">
            <Icon>close</Icon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox>
            {step === 1 && <Step1 nextRepairStep={nextRepairStep} />}
            {step === 2 && (
              <Step2
                repairData={repairData}
                updateRepairData={updateRepairData}
                setrepairID={setRepairID}
                nextRepairStep={nextRepairStep}
              />
            )}
            {step === 3 && <Step3 repairID={repairID} nextRepairStep={nextRepairStep} />}
            {step === 4 && (
              <Step4
                repairID={repairID}
                nextRepairStep={nextRepairStep}
                reRender={reRender}
                setNewRepair={setOpen}
              />
            )}
          </MDBox>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NewRepairButton;
