import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField } from "@mui/material";
import MDButton from "components/MDButton";

const EditCustomerDetails = ({ open, onClose, customer, onSave }) => {
  const [formData, setFormData] = useState({
    given_name: "",
    family_name: "",
    email_address: "",
    phone_number: "",
    address: {
      address_line_1: "",
      address_line_2: "",
      locality: "",
      administrative_district_level_1: "",
      postal_code: "",
    },
  });

  useEffect(() => {
    if (open && customer) {
      setFormData({
        given_name: customer.given_name || "",
        family_name: customer.family_name || "",
        email_address: customer.email_address || "",
        phone_number: customer.phone_number || "",
        address: {
          address_line_1: customer.address?.address_line_1 || "",
          address_line_2: customer.address?.address_line_2 || "",
          locality: customer.address?.locality || "",
          administrative_district_level_1: customer.address?.administrative_district_level_1 || "",
          postal_code: customer.address?.postal_code || "",
        },
      });
    }
  }, [open, customer]);

  const handleSave = () => {
    onSave({ ...formData, id: customer.id || customer._id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Customer Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <TextField
              label="First Name"
              fullWidth
              value={formData.given_name}
              onChange={(e) => setFormData({ ...formData, given_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Last Name"
              fullWidth
              value={formData.family_name}
              onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              fullWidth
              value={formData.email_address}
              onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address Line 1"
              fullWidth
              value={formData.address?.address_line_1 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, address_line_1: e.target.value },
                })
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address Line 2"
              fullWidth
              value={formData.address?.address_line_2 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, address_line_2: e.target.value },
                })
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="City"
              fullWidth
              value={formData.address?.locality || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, locality: e.target.value },
                })
              }
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="State"
              fullWidth
              value={formData.address?.administrative_district_level_1 || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    administrative_district_level_1: e.target.value,
                  },
                })
              }
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              label="Zip Code"
              fullWidth
              value={formData.address?.postal_code || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, postal_code: e.target.value },
                })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Cancel
        </MDButton>
        <MDButton onClick={handleSave} color="success">
          Save
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustomerDetails;
