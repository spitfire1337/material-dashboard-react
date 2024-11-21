import { useState } from "react";
import MDSnackbar from "../MDSnackbar";

export default function Notification() {
  const [showSB, setshowSnackBar] = useState({ success: false, error: false });
  const [snackbarText, setsnackbarText] = useState("");

  const closeSB = () => {
    setshowSnackBar({ success: false, error: false });
  };

  const showSnackBar = (variant, text) => {
    if (variant == "success") {
      setshowSnackBar({ success: true });
      setsnackbarText(text);
    }
    if (variant == "error") {
      setshowSnackBar({ error: true });
      setsnackbarText(text);
    }
  };

  const RenderSnackbar = () => {
    return (
      <>
        <MDSnackbar
          color="success"
          icon="check"
          title="Success"
          content={snackbarText}
          open={showSB.success}
          onClose={closeSB}
          close={closeSB}
          bgWhite
        />
        <MDSnackbar
          color="error"
          icon="warning"
          title="Error"
          content={snackbarText}
          open={showSB.error}
          onClose={closeSB}
          close={closeSB}
          bgWhite
        />
      </>
    );
  };

  return {
    RenderSnackbar: RenderSnackbar,
    showSnackBar: showSnackBar,
  };
}
