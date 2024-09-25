import { useState, useEffect, useMemo } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Modal,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete,
  TextField,
  Divider,
  Grid,
} from "@mui/material";

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

const step1 = ({ globalFunc, nextRepairStep }) => {
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
          const useableCustomers = res.data.filter((cust) => cust.email_address != undefined);
          setCustomers(useableCustomers);
          let custList = [{ label: "New Customer", id: 0 }];
          useableCustomers.map((cust) => {
            custList.push({
              label: `${cust.email_address} ${
                cust.given_name != undefined && cust.family_name != undefined
                  ? `| ${cust.given_name} ${cust.family_name}`
                  : ""
              }`,
              id: cust.id,
            });
          });
          setCustomersSelection(custList);
          emptyCustomer();
          setShowCustForm(false);
        } else if (res.res === 401) {
          globalFunc.setLoggedIn(false);
          globalFunc.setErrorSBText("Unauthorized, redirecting to login");
          globalFunc.setErrorSB(true);
        }
      } else if (response.status == 401) {
        globalFunc.setLoggedIn(false);
        globalFunc.setErrorSBText("Unauthorized, redirecting to login");
        globalFunc.setErrorSB(true);
      }
      console.log(response);
    };
    fetchData();
  }, []);

  const chooseCustomer = (cust) => {
    console.log("Chosen cust:", cust);
    selectedcustomer = {};
    if (cust == null) {
      emptyCustomer();
      console.log("New Cust data", selectedcustomer);
      setShowCustForm(false);
    } else if (cust.id == 0) {
      //NEW CUSTOMER
      console.log("New customer");
      emptyCustomer();
      console.log("New Cust data", selectedcustomer);
      setShowCustForm(true);
    } else {
      let custData = customers.filter((mycust) => mycust.id == cust.id)[0];
      setSelectedCustomer(custData);
      console.log("Selected customer", custData);
      setShowCustForm(true);
    }
  };

  const updateCustomer = (value) => {
    setSelectedCustomer(value);
    console.log("Updated customer:", selectedcustomer);
  };

  const submitCustomer = async (val) => {
    if (selectedcustomer.id == undefined || selectedcustomer.id == 0) {
      //New Customer
      try {
        console.log(selectedcustomer);
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
          console.log(json);
          nextRepairStep(val, json.data._id);
          return null;
        } else if (json.res == 401) {
          globalFunc.setLoggedIn(false);
        }
      } catch (e) {
        globalFunc.setErrorSBText("Error creating customer.");
        globalFunc.setErrorSB(true);
        console.error(e);
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
        console.log(json);
        //setCustomerID(json.data.customer.id);
        nextRepairStep(val, json.data._id);
        return null;
      } catch (e) {
        console.error(e);
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
