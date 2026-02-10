/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import { useState, React, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import vars from "../../../config";
//Global
import { globalFuncs } from "../../../context/global";
import { useLoginState } from "../../../context/loginContext";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import moment from "moment";

const data = (status = [], tableState, setTableState) => {
  const { setSnackBar, setShowLoad } = globalFuncs();
  const { setLoggedIn } = useLoginState();
  let redirect = useNavigate();
  const [repairsOrig, setrepairsOrig] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setsearchTerm] = useState(null);

  const [myFilters, setmyFilters] = useState({
    status: [],
    RepairType: [
      "Tire Change",
      "Tube Change",
      "Power issue",
      "Mechanical Repair",
      "Other",
      undefined,
    ],
  });

  const fetchData = async () => {
    setShowLoad(true);
    const response = await fetch(`${vars.serverUrl}/square/getMyData?action=getRepairs`, {
      credentials: "include",
    });
    if (response.status == 200) {
      const res = await response.json();

      if (res.res === 200) {
        setTableState((s) => ({ ...s, data: res.data, dataFiltered: res.data, loaded: true }));
        doFilter(res.data);
        setShowLoad(false);
      } else if (res.res === 401) {
        setLoggedIn(false);
        setSnackBar({
          type: "error",
          title: "Error",
          message: "Unauthorized, redirecting to login",
          show: true,
          icon: "check",
        });
        setShowLoad(false);
      }
    } else if (response.status == 401) {
      setLoggedIn(false);
      setSnackBar({
        type: "error",
        title: "Error",
        message: "Unauthorized, redirecting to login",
        show: true,
        icon: "check",
      });
      setShowLoad(false);
    }
  };
  useEffect(() => {
    if (!tableState.loaded) {
      fetchData();
    } else {
      doFilter();
    }
  }, [tableState.loaded]);
  useEffect(() => {
    doFilter();
  }, [tableState.data]);

  const reRender = () => {
    fetchData();
  };

  const doFilter = (data = null) => {
    let filterData;
    if (data == null) {
      data = tableState.data;
      // filterData = [...tableState.data];
    }
    filterData = [...data];

    let filtered = filterData.filter((item) => {
      for (var key in myFilters) {
        if (
          item[key] === undefined ||
          myFilters[key].indexOf(item[key].constructor.name == "Array" ? item[key][0] : item[key]) <
            0
        )
          return false;
      }
      return true;
    });
    setTableState((s) => ({ ...s, dataFiltered: filtered }));
  };

  // const doFilter = (data = null) => {
  //   let filterData;
  //   if (data == null || data == "") {
  //     filterData = [...repairsOrig];
  //   } else {
  //     filterData = [...data];
  //   }
  //   let filtered = filterData.filter((item) => {
  //     for (var key in myFilters) {
  //       if (
  //         item[key] === undefined ||
  //         myFilters[key].indexOf(item[key].constructor.name == "Array" ? item[key][0] : item[key]) <
  //           0
  //       )
  //         return false;
  //     }
  //     return true;
  //   });
  //   if (data == null) {
  //     doSearch(filtered);
  //   } else {
  //     setRepairs(filtered);
  //   }
  // };
  const filter = (filter) => {
    setmyFilters(filter);
  };

  useEffect(() => {
    if (tableState.loaded) {
      console.log("Search term changed:", searchTerm);
      if (searchTerm == "") {
        doFilter();
      } else {
        doSearch();
      }
    }
  }, [searchTerm, data]);

  useEffect(() => {
    if (searchTerm !== "") {
      doSearch();
    }
    doFilter();
  }, [myFilters]);

  const doSearch = () => {
    let filterData = [...tableState.data];
    if (searchTerm == "" || searchTerm == null) {
      //doFilter(repairsOrig);
      return;
    }
    let filtered = filterData.filter((item) => {
      if (searchTerm == "" || searchTerm == null) {
        return true;
      }
      // eslint-disable-next-line prettier/prettier
      if (
        item.repairID.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      if (
        item.Customer != undefined &&
        item.Customer.given_name != undefined &&
        item.Customer.given_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      if (
        item.Customer != undefined &&
        item.Customer.family_name != undefined &&
        item.Customer.family_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      if (
        item.Customer != undefined &&
        item.Customer.email_address != undefined &&
        item.Customer.email_address.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      if (
        item.Customer != undefined &&
        item.Customer.phone_number != undefined &&
        item.Customer.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return true;
      if (item.pev.Brand.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (item.pev.Model.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      if (item.receivedby.toLowerCase().includes(searchTerm.toLowerCase())) return true;

      return false;
    });
    setRepairs(filtered);
    doFilter(filtered);
  };

  const resetFilter = () => {
    setRepairs(repairsOrig);
  };
  const Customer = ({ image, name, email, id }) => (
    <MDBox
      display="flex"
      alignItems="center"
      lineHeight={1}
      sx={{ cursor: "pointer" }}
      onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
    >
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Pev = ({ title, description, id }) => (
    <MDBox
      lineHeight={1}
      textAlign="left"
      sx={{ cursor: "pointer" }}
      onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
    >
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  const Status = ({ repairStatus, id }) => {
    if (repairStatus == 0) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Created"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #FFFF00, #989845)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 1) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Not started"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #ffae00, #B38D4C)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 2) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="In Progress"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #00BEFF, #4C99B3)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 3) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Paused"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 4) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Repair Complete"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3C9041, #00FF0F)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 5) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Invoice Created"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #8E833E, #FFDE03)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 6) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Complete"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #329858, #00FF60)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 11) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Paused - Awaiting parts"
            sx={{
              "& .MuiBadge-badge": {
                color: "#000",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #3D8E8C, #00FFF9)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 997) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Cancelled - Return to customer"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #984742, #FB0F00)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 998) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Cancelled"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #984742, #FB0F00)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
    if (repairStatus == 999) {
      return (
        <MDBox
          ml={-1}
          sx={{ cursor: "pointer" }}
          onClick={() => redirect(`/repairdetails/${id}`, { replace: false })}
        >
          <MDBadge
            badgeContent="Unrepairable"
            sx={{
              "& .MuiBadge-badge": {
                color: "#fff",
                backgroundColor: "green",
                background: "linear-gradient(195deg, #9E3755, #F70048)",
              },
            }}
            size="sm"
            bg=""
          />
        </MDBox>
      );
    }
  };

  const setData = () => {
    setTableState((s) => ({
      ...s,
      columns: [
        { Header: "repair id", accessor: "id", align: "left" },
        { Header: "customer", accessor: "customer", width: "25%", align: "left" },
        { Header: "pev", accessor: "pev", align: "left" },
        { Header: "status", accessor: "status", align: "center" },
        {
          Header: "received",
          accessor: "received",
          align: "center",
          isSorted: true,
          isSortedDesc: false,
        },
        { Header: "updated", accessor: "updated", align: "center" },
      ],

      rows:
        tableState.dataFiltered.length > 0
          ? tableState.dataFiltered.map((repair) => {
              return {
                id: repair.repairID,
                customer: (
                  <Customer
                    id={repair._id}
                    name={
                      (repair.Customer != undefined && repair.Customer.given_name != undefined
                        ? repair.Customer.given_name
                        : "") +
                      " " +
                      (repair.Customer != undefined && repair.Customer.family_name != undefined
                        ? repair.Customer.family_name
                        : "")
                    }
                    email={
                      repair.Customer != undefined
                        ? repair.Customer.phone_number
                        : "" || repair.Customer != undefined
                        ? repair.Customer.email_address
                        : ""
                    }
                  />
                ),
                pev: (
                  <Pev
                    id={repair._id}
                    title={repair.pev.Brand.name}
                    description={repair.pev.Model}
                  />
                ),
                status: <Status repairStatus={repair.status} id={repair._id} />,
                received: (
                  <MDTypography
                    component="a"
                    href="#"
                    variant="caption"
                    color="text"
                    fontWeight="medium"
                    sx={{ cursor: "pointer" }}
                    onClick={() => redirect(`/repairdetails/${repair._id}`, { replace: false })}
                  >
                    {moment(repair.createdAt).format("MM/DD/yyyy hh:mm a")}
                  </MDTypography>
                ),
                updated: (
                  <MDTypography
                    component="a"
                    href={"/repairdetails/" + repair._id}
                    variant="caption"
                    color="text"
                    fontWeight="medium"
                  >
                    {moment(repair.updatedAt).format("MM/DD/yyyy hh:mm a")}
                  </MDTypography>
                ),
              };
            })
          : [],
    }));
  };
  return {
    repairs: tableState.data,
    resetFilter: resetFilter,
    doFilter: doFilter,
    reRender: reRender,
    setsearchTerm: setsearchTerm,
    searchTerm: searchTerm,
    myFilters: myFilters,
    setmyFilters: setmyFilters,
    doFilter: doFilter,
    columns: [
      // { Header: "repair id", accessor: "id", align: "left" },
      // { Header: "customer", accessor: "customer", width: "25%", align: "left" },
      // { Header: "pev", accessor: "pev", align: "left" },
      // { Header: "status", accessor: "status", align: "center" },
      // {
      //   Header: "received",
      //   accessor: "received",
      //   align: "center",
      //   isSorted: true,
      //   isSortedDesc: false,
      // },
      // { Header: "updated", accessor: "updated", align: "center" },
      { name: "repair id", selector: (row) => row.id, align: "left", sortable: true, width: "10%" },
      {
        name: "customer",
        selector: (row) => row.customer,
        width: "20%",
        align: "left",
        sortable: true,
      },
      { name: "pev", selector: (row) => row.pev, left: true, width: "140px", sortable: true },
      { name: "status", selector: (row) => row.status, center: true, sortable: true },
      {
        name: "received",
        selector: (row) => row.received,
        align: "center",
        isSorted: true,
        isSortedDesc: false,
        sortable: true,
      },
      { name: "updated", selector: (row) => row.updated, align: "center", sortable: true },
    ],

    rows:
      tableState.dataFiltered.length > 0
        ? tableState.dataFiltered.map((repair) => {
            return {
              id: repair.repairID,
              allData: repair,
              customer: (
                <Customer
                  id={repair._id}
                  name={
                    (repair.Customer != undefined && repair.Customer.given_name != undefined
                      ? repair.Customer.given_name
                      : "") +
                    " " +
                    (repair.Customer != undefined && repair.Customer.family_name != undefined
                      ? repair.Customer.family_name
                      : "")
                  }
                  email={
                    repair.Customer != undefined
                      ? repair.Customer.phone_number
                      : "" || repair.Customer != undefined
                      ? repair.Customer.email_address
                      : ""
                  }
                />
              ),
              pev: (
                <Pev id={repair._id} title={repair.pev.Brand.name} description={repair.pev.Model} />
              ),
              status: <Status repairStatus={repair.status} id={repair._id} />,
              received: (
                <MDTypography
                  component="a"
                  href="#"
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                  sx={{ cursor: "pointer" }}
                  onClick={() => redirect(`/repairdetails/${repair._id}`, { replace: false })}
                >
                  {moment(repair.createdAt).format("MM/DD/yyyy hh:mm a")}
                </MDTypography>
              ),
              updated: (
                <MDTypography
                  component="a"
                  href={"/repairdetails/" + repair._id}
                  variant="caption"
                  color="text"
                  fontWeight="medium"
                >
                  {moment(repair.updatedAt).format("MM/DD/yyyy hh:mm a")}
                </MDTypography>
              ),
            };
          })
        : [],
  };
};

data.whyDidYouRender = true;

export default data;
