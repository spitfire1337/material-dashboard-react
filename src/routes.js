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

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Repairs from "layouts/repairs";
import Customers from "layouts/customers";
import RepairDetails from "layouts/repairDetails";
import CustomerDetails from "layouts/customerDetails";
import Appointments from "layouts/appointments";
import Availability from "layouts/availability";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import GroupRides from "layouts/grouprides";
import WarrantyAdmin from "layouts/warranty_admin";
import Inventory from "layouts/inventory";
import InmotionItems from "layouts/inmotionItems";
import PEVDatabase from "layouts/pevs";
// @mui icons
import Icon from "@mui/material/Icon";
const adminRoutes = (globalFunc) => {
  return [
    {
      type: "collapse",
      noCollapse: true,
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard globalFunc={globalFunc} />,
    },
    {
      type: "collapse",
      name: "Repairs",
      noCollapse: true,
      key: "repairs",
      icon: <Icon fontSize="small">assignment</Icon>,
      route: "/repairs",
      component: <Repairs globalFunc={globalFunc} />,
    },
    {
      type: "collapse",
      name: "Scheduling",
      key: "appoint",
      icon: <Icon fontSize="small">calendar_month</Icon>,
      collapse: [
        {
          type: "collapse",
          name: "Appointments",
          key: "appointment",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/appointments/",
          component: <Appointments globalFunc={globalFunc} />,
        },
        {
          type: "collapse",
          name: "My Availability",
          key: "availabilty",
          route: "/myavailability",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          component: <Availability globalFunc={globalFunc} />,
        },
      ],
    },

    {
      type: "collapse",
      name: "Customers",
      noCollapse: true,
      key: "customers",
      icon: <Icon fontSize="small">group</Icon>,
      route: "/Customers",
      component: <Customers />,
    },
    {
      type: "collapse",
      name: "Inventory",
      key: "Inventory",
      icon: <Icon fontSize="small">inventory_2</Icon>,
      route: "/inventory/",
      component: <Inventory globalFunc={globalFunc} />,
      collapse: [
        {
          type: "collapse",
          name: "Inventory",
          key: "Inventory",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/inventory/",
          component: <Inventory globalFunc={globalFunc} />,
        },
        {
          type: "collapse",
          name: "InMotion Dropship",
          key: "imdrops",
          route: "/inmotionDropShipping",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          component: <InmotionItems globalFunc={globalFunc} />,
        },
      ],
    },
    {
      name: "Repairs",
      key: "repairs2",
      route: "/repairs/:id",
      component: <RepairDetails globalFunc={globalFunc} />,
    },
    {
      name: "Customers",
      key: "customers2",
      route: "/customer/:id",
      component: <CustomerDetails globalFunc={globalFunc} />,
    },
    {
      type: "collapse",
      name: "PEV Database",
      key: "pevs",
      route: "/pevDB",
      icon: <Icon fontSize="small">electric_scooter</Icon>,
      component: <PEVDatabase globalFunc={globalFunc} />,
      collapse: [
        {
          name: "PEV Database",
          key: "pevs",
          route: "/pevDB",
          component: <PEVDatabase globalFunc={globalFunc} />,
        },
        {
          type: "collapse",
          name: "Warranty Admin",
          icon: <Icon fontSize="small">app_registration</Icon>,
          key: "Admin",
          route: "/warranty_admin",
          component: <WarrantyAdmin globalFunc={globalFunc} />,
        },
      ],
    },
    {
      name: "Group Rides",
      key: "grouprides",
      route: "/grouprides",
      component: <GroupRides />,
    },
  ];
};

const techRoutes = (globalFunc) => {
  return [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard globalFunc={globalFunc} />,
    },
    {
      type: "collapse",
      name: "Repairs",
      key: "repairs",
      icon: <Icon fontSize="small">assignment</Icon>,
      route: "/repairs",
      component: <Repairs globalFunc={globalFunc} />,
    },
    {
      name: "Repairs",
      key: "repairs2",
      route: "/repairs/:id",
      component: <RepairDetails globalFunc={globalFunc} />,
    },
    {
      name: "Group Rides",
      key: "grouprides",
      route: "/grouprides",
      component: <GroupRides />,
    },
  ];
};

const publicRoutes = () => {
  return [
    {
      name: "Group Rides",
      key: "grouprides",
      route: "/grouprides",
      component: <GroupRides />,
    },
  ];
};
const routes = (globalFunc) => {
  console.log(adminRoutes(globalFunc));
  if (globalFunc.user.isAdmin) return adminRoutes(globalFunc);
  if (globalFunc.user.isTech) return techRoutes(globalFunc);
  return publicRoutes;
  /*
      {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  }
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  }*/
};

export default routes;
