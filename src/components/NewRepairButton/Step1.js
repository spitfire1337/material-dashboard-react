/* eslint-disable react/jsx-props-no-spreading */
import { useState, useEffect } from "react";
import { globalFuncs } from "../../context/global";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import {
  TextField,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ClickAwayListener,
} from "@mui/material";
import vars from "../../config";
import { useSocket } from "context/socket";

const Step1 = ({ nextRepairStep }) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const socket = useSocket();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
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
    id: null,
  });

  useEffect(() => {
    if (socket) {
      setShowLoad(true);
      socket.emit("getCustomers", {}, (res) => {
        if (res.res === 200) {
          const uniqueCustomersMap = new Map();
          res.data.forEach((cust) => {
            if ((cust.given_name || cust.family_name) && cust.id) {
              uniqueCustomersMap.set(cust.id, cust);
            }
          });
          setCustomers(Array.from(uniqueCustomersMap.values()));
        }
        setShowLoad(false);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers([]);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = customers.filter((c) => {
      const phone = c.phone_number ? c.phone_number.replace(/\D/g, "") : "";
      const searchStr = `${c.given_name || ""} ${c.family_name || ""} ${
        c.email_address || ""
      } ${phone}`.toLowerCase();
      return searchStr.includes(lowerSearch);
    });
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setShowDropdown(true);
    setShowForm(false);
  };

  const selectCustomer = (customer) => {
    setFormData({
      given_name: customer.given_name || "",
      family_name: customer.family_name || "",
      email_address: customer.email_address || "",
      phone_number: customer.phone_number ? customer.phone_number.replace(/\D/g, "") : "",
      address: {
        address_line_1: customer.address?.address_line_1 || "",
        address_line_2: customer.address?.address_line_2 || "",
        locality: customer.address?.locality || "",
        administrative_district_level_1: customer.address?.administrative_district_level_1 || "",
        postal_code: customer.address?.postal_code || "",
      },
      id: customer.id,
    });
    setSearchText(`${customer.given_name} ${customer.family_name}`);
    setShowDropdown(false);
    setShowForm(true);
  };

  const handleAddNew = () => {
    const names = searchTerm.split(" ");
    setFormData({
      given_name: names[0] || "",
      family_name: names.slice(1).join(" ") || "",
      email_address: "",
      phone_number: "",
      address: {
        address_line_1: "",
        address_line_2: "",
        locality: "",
        administrative_district_level_1: "",
        postal_code: "",
      },
      id: null,
    });
    setShowDropdown(false);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.given_name) {
      setSnackBar({
        type: "error",
        message: "First name is required",
        show: true,
        icon: "warning",
      });
      return;
    }

    const emailValid =
      formData.email_address &&
      formData.email_address.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    const phoneDigits = formData.phone_number ? formData.phone_number.replace(/\D/g, "") : "";
    const phoneValid = phoneDigits.length >= 10;

    if (!emailValid && !phoneValid) {
      setSnackBar({
        type: "error",
        message: "Please enter a valid email address or phone number",
        show: true,
        icon: "warning",
      });
      return;
    }

    setShowLoad(true);
    if (socket) {
      const eventName = formData.id ? "updateCustomer" : "createCustomer";
      socket.emit(eventName, formData, (res) => {
        if (res.res === 200) {
          nextRepairStep(2, res.data._id || formData.id);
        } else {
          setSnackBar({
            type: "error",
            message: "Error saving customer",
            show: true,
            icon: "error",
          });
        }
        setShowLoad(false);
      });
    }
  };

  return (
    <MDBox mt={2}>
      <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
        <MDBox position="relative">
          <TextField
            label="Search or Create Customer"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchTerm) setShowDropdown(true);
            }}
            autoComplete="off"
          />
          {showDropdown && searchTerm && (
            <Paper
              sx={{
                position: "absolute",
                zIndex: 10,
                width: "100%",
                maxHeight: 200,
                overflow: "auto",
                mt: 1,
              }}
            >
              <List dense>
                {filteredCustomers.map((c) => (
                  <ListItem key={c.id} disablePadding>
                    <ListItemButton onClick={() => selectCustomer(c)}>
                      <ListItemText
                        primary={`${c.given_name} ${c.family_name}`}
                        secondary={`${c.email_address || ""} ${
                          c.phone_number ? c.phone_number.replace(/\D/g, "") : ""
                        }`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                <ListItem disablePadding>
                  <ListItemButton onClick={handleAddNew}>
                    <ListItemText primary={`Add "${searchTerm}"`} />
                  </ListItemButton>
                </ListItem>
              </List>
            </Paper>
          )}
        </MDBox>
      </ClickAwayListener>
      <MDBox mt={3}>
        {showForm && (
          <Grid container spacing={2}>
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
            <Grid item xs={12}>
              <MDButton variant="gradient" color="info" fullWidth onClick={handleSubmit}>
                Next
              </MDButton>
            </Grid>
          </Grid>
        )}
      </MDBox>
    </MDBox>
  );
};

export default Step1;
