import { useState, useEffect } from "react";
// global
import { globalFuncs } from "../../../context/global";
import { useLoginState } from "context/loginContext";

import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Divider,
  Grid,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

import vars from "../../../config";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "25px",
};
const filter = createFilterOptions();

const step1 = ({ nextRepairStep }) => {
  const { setSnackBar } = globalFuncs();
  const { setLoggedIn } = useLoginState();
  const [customersSelection, setCustomersSelection] = useState([]);
  const [showCustForm, setShowCustForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    return [
      values,
      (newValue) => {
        setValues({
          ...values,
          ...newValue,
        });
      },
      () => setValues({}),
    ];
  };
  let [selectedcustomer, setSelectedCustomer, emptyCustomer] = useForm({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getCustomers`, {
        credentials: "include",
      });
      if (response.status == 200) {
        const res = await response.json();
        if (res.res === 200) {
          const useableCustomers = res.data.filter(
            (cust) => cust.email_address != undefined || cust.phone_number != undefined
          );
          setCustomers(useableCustomers);
          let custList = [];
          useableCustomers.map((cust) => {
            custList.push({
              label: `${cust.given_name != undefined ? `${cust.given_name} ` : ""}
                ${cust.family_name != undefined ? `${cust.family_name}` : ""}
             ${cust.email_address != undefined ? ` | ${cust.email_address}` : ""} ${
                cust.phone_number != undefined ? ` | ${cust.phone_number}` : ""
              }`,
              id: cust.id,
            });
          });
          setCustomersSelection(custList);
          emptyCustomer();
          setShowCustForm(false);
        } else if (res.res === 401) {
          setLoggedIn(false);
          setSnackBar({
            type: "error",
            title: "Error",
            message: "Unauthorized, redirecting to login",
            show: true,
            icon: "warning",
          });
        }
      } else if (response.status == 401) {
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "warning",
        });
      }
    };
    fetchData();
  }, []);

  const validateEmail = (email) => {
    try {
      return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    } catch {
      return false;
    }
  };

  const chooseCustomer = (cust) => {
    selectedcustomer = {};
    if (cust == null) {
      emptyCustomer();
      setShowCustForm(false);
    } else if (cust.id == 0) {
      //NEW CUSTOMER
      selectedcustomer.phone_number = "";
      selectedcustomer.email_address = "";
      selectedcustomer.given_name = "";
      selectedcustomer.family_name = "";
      if (Number.isNaN(parseInt(cust.inputValue))) {
        if (validateEmail(cust.inputValue)) {
          emptyCustomer();
          selectedcustomer.email_address = cust.inputValue;
        } else {
          emptyCustomer();
          let name = cust.inputValue.split(" ");
          selectedcustomer.given_name = name[0];
          if (name.length > 1) selectedcustomer.family_name = name[1];
        }
      } else {
        emptyCustomer();
        selectedcustomer.phone_number = cust.inputValue;
      }
      setSelectedCustomer(selectedcustomer);
      setShowCustForm(true);
    } else {
      let custData = customers.filter((mycust) => mycust.id == cust.id)[0];
      setSelectedCustomer(custData);
      setShowCustForm(true);
    }
  };

  const updateCustomer = (value) => {
    setSelectedCustomer(value);
  };

  const PhoneisValid = (phone) => {
    const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    try {
      return regex.test(phone);
    } catch {
      return false;
    }
  };

  const submitCustomer = async (val) => {
    if (
      !validateEmail(selectedcustomer.email_address) &&
      !PhoneisValid(selectedcustomer.phone_number)
    ) {
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Please enter a valid email or phone number.",
        show: true,
        icon: "warning",
      });
      return null;
    }
    if (selectedcustomer.id == undefined || selectedcustomer.id == 0) {
      //New Customer
      try {
        const response = await fetch(`${vars.serverUrl}/square/createCustomer`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedcustomer),
          credentials: "include",
        });
        const json = await response.json();
        //setCustomerID(json.data.customer.id);
        if (json.res == 200) {
          nextRepairStep(val, json.data._id);
          return null;
        } else if (json.res == 401) {
          setLoggedIn(false);
        }
      } catch (e) {
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Error creating customer.",
          show: true,
          icon: "warning",
        });
        // TODO: Add error notification
      }
    } else {
      //Existing customer, let's update square of any changes
      try {
        const response = await fetch(`${vars.serverUrl}/square/updateCustomer`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedcustomer),
          credentials: "include",
        });
        const json = await response.json();
        //setCustomerID(json.data.customer.id);
        nextRepairStep(val, json.data._id);
        return null;
      } catch (e) {
        // TODO: Add error notification
      }
    }
  };
  return (
    <>
      <MDTypography id="modal-modal-title" variant="h6" component="h2">
        Customer details
      </MDTypography>
      <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
        <FormControl fullWidth>
          <Autocomplete
            onChange={(event, newValue) => {
              chooseCustomer(newValue);
            }}
            disablePortal
            options={customersSelection}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue !== "") {
                filtered.unshift({
                  inputValue: params.inputValue,
                  label: `Add "${params.inputValue}"`,
                  id: 0,
                });
              }
              return filtered;
            }}
            fullWidth
            renderInput={(params) => <TextField {...params} label="Customer" />}
          />
        </FormControl>
        {showCustForm == true ? (
          <FormControl fullWidth>
            <Divider fullWidth></Divider>
            <Grid container spacing={1} marginTop={1}>
              <Grid item md={6} sm={12}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={
                    selectedcustomer.given_name != undefined ? selectedcustomer.given_name : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.given_name = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item md={6} sm={12}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={
                    selectedcustomer.family_name != undefined ? selectedcustomer.family_name : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.family_name = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  label="Email address"
                  fullWidth
                  value={
                    selectedcustomer.email_address != undefined
                      ? selectedcustomer.email_address
                      : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.email_address = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  label="Phone number"
                  fullWidth
                  value={
                    selectedcustomer.phone_number != undefined ? selectedcustomer.phone_number : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.phone_number = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                  type="tel"
                  onInput={(e) => {
                    e.target.value = e.target.value.slice(0, 14);
                    let digits = e.target.value.replace(/\D/g, "").substring(0, 10);
                    let formatted = e.target.value;
                    if (digits.length > 6) {
                      formatted = `(${digits.substring(0, 3)}) ${digits.substring(
                        3,
                        6
                      )}-${digits.substring(6)}`;
                    } else if (digits.length > 3) {
                      formatted = `(${digits.substring(0, 3)}) ${digits.substring(3)}`;
                    } else if (digits.length > 0) {
                      formatted = `(${digits}`;
                    }
                    e.target.value = formatted;
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  label="Address line 1"
                  fullWidth
                  value={
                    selectedcustomer.address != undefined
                      ? selectedcustomer.address.address_line_1
                      : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.address == undefined ? (selectedcustomer.address = {}) : null;
                    selectedcustomer.address.address_line_1 = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  label="Address line 2"
                  fullWidth
                  value={
                    selectedcustomer.address != undefined &&
                    selectedcustomer.address.address_line_2 != undefined
                      ? selectedcustomer.address.address_line_2
                      : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.address == undefined ? (selectedcustomer.address = {}) : null;
                    selectedcustomer.address.address_line_2 = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12} md={6}>
                <TextField
                  label="City"
                  fullWidth
                  value={
                    selectedcustomer.address != undefined ? selectedcustomer.address.locality : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.address == undefined ? (selectedcustomer.address = {}) : null;
                    selectedcustomer.address.locality = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12} md={3}>
                <TextField
                  label="State"
                  fullWidth
                  value={
                    selectedcustomer.address != undefined
                      ? selectedcustomer.address.administrative_district_level_1
                      : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.address == undefined ? (selectedcustomer.address = {}) : null;
                    selectedcustomer.address.administrative_district_level_1 = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12} md={3}>
                <TextField
                  label="Zip"
                  fullWidth
                  value={
                    selectedcustomer.address != undefined
                      ? selectedcustomer.address.postal_code
                      : ""
                  }
                  onChange={(e) => {
                    selectedcustomer.address == undefined ? (selectedcustomer.address = {}) : null;
                    selectedcustomer.address.postal_code = e.target.value;
                    updateCustomer(selectedcustomer);
                  }}
                />
              </Grid>
              <Grid item sm={12}>
                <MDButton
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => submitCustomer(2)}
                >
                  Next
                </MDButton>
              </Grid>
            </Grid>
          </FormControl>
        ) : null}
      </MDTypography>
    </>
  );
};
export default step1;
