import { Dialog, DialogTitle, DialogContent, CircularProgress } from "@mui/material";
import { useState } from "react";
export default function Loading() {
  const [showLoad, setShowLoad] = useState(false);
  const LoadDialog = () => {
    return (
      <Dialog open={showLoad}>
        <DialogTitle>Loading</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  };

  return {
    setShowLoad: setShowLoad,
    LoadBox: LoadDialog,
  };
}
