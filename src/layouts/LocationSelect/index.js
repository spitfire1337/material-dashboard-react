import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Cookies from "universal-cookie";

export default function FormDialog(locations) {
  const [open, setOpen] = React.useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [mylocation, setmylocation] = React.useState("");

  const handleChange = (event) => {
    setmylocation(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries(formData.entries());
          const mylocation = formJson.mylocation;
          const cookies = new Cookies(null, { path: "/" });
          cookies.set("mylocation", mylocation);
          if (mylocation !== "") {
            handleClose();
          }
        },
      }}
    >
      <DialogTitle>Choose location</DialogTitle>
      <DialogContent>
        <DialogContentText>To get started, first select a location</DialogContentText>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Location</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="mylocation"
              value={mylocation}
              label="Location"
              onChange={handleChange}
              name="mylocation"
            >
              {locations.locations.map((location) => {
                return (
                  <MenuItem value={location.id} key={location.id}>
                    {location.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
