import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MDButton from "components/MDButton";
import { useState } from "react";
export default function ConfirmActionDialog() {
  const [showConfrim, setShowConfirm] = useState(false);
  const ConfirmActionDialog = ({ title, content, action, closeState }) => {
    return (
      <Dialog open={showConfrim}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <MDButton variant="contained" color="error" onClick={() => setShowConfirm(false)}>
            No
          </MDButton>
          <MDButton variant="contained" color="success" onClick={action} autoFocus>
            Yes
          </MDButton>
        </DialogActions>
      </Dialog>
    );
  };

  return {
    setShowConfirm: setShowConfirm,
    ConfirmActionDialog: ConfirmActionDialog,
  };
}
