import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  FormControl,
  FormControlLabel,
} from "@mui/material";
import { Icon } from "@mui/material";
import MDButton from "components/MDButton";
const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
  color: () => {
    let colorValue = dark.main;

    // if (transparentNavbar) {
    //   colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
    // }

    return colorValue;
  },
});
const PartsOrder = () => {
  const [partsOrder, setPartsOrder] = useState([
    {
      id: 0,
      vendor: "",
      part: "",
      cost: 0,
      price: 0,
      tracking: "",
    },
  ]);
  const [partsCount, setPartsCount] = useState(0);
  const [partsOrderOpen, togglePartsOrderOpen] = useState(false);
  const addPartsOrder = () => {
    let newPartsCount = partsCount + 1;
    setPartsCount(newPartsCount);
    let details = {
      id: newPartsCount,
      vendor: "",
      part: "",
      cost: 0,
      price: 0,
      tracking: "",
    };
    let oldParts = [...partsOrder];
    oldParts.push(details);
    setPartsOrder(oldParts);
  };
  const partsOrderDialog = (
    <Dialog open={partsOrderOpen}>
      <DialogTitle>Enter parts on order</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} marginTop={1}>
          {partsOrder.map((part, i) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <>
                <Grid item key={part.id} sm={11}>
                  <FormControl fullWidth>
                    <TextField
                      label="Part"
                      value={part.part}
                      onChange={(e) => {
                        let oldPart = [...partsOrder];
                        oldPart[i].part = e.currentTarget.value;
                        setPartsOrder(oldPart);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item key={part.id} sm={1}>
                  <IconButton
                    size="small"
                    disableRipple
                    color="red"
                    style={i === partsOrder.length - 1 ? { visibility: "hidden" } : {}}
                    onClick={() => {
                      let oldPart = [...partsOrder];
                      oldPart.splice(i, 1);
                      setPartsOrder(oldPart);
                    }}
                  >
                    <Icon sx={iconsStyle}>clear</Icon>
                  </IconButton>
                </Grid>
              </>
            );
          })}
          <Grid item sm={12}>
            <MDButton variant="outlined" color="secondary" onClick={() => addPartsOrder()}>
              Add part
            </MDButton>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton color="error" fullWidth onClick={() => togglePartsOrderOpen(false)}>
          Cancel
        </MDButton>
        <MDButton
          color="success"
          fullWidth
          onClick={() => {
            togglePartsOrderOpen(false);
          }}
        >
          Submit
        </MDButton>
      </DialogActions>
    </Dialog>
  );

  return {
    partsOrderDialog,
    togglePartsOrderOpen,
  };
};

PartsOrder.whyDidYouRender = true;
export default PartsOrder;
