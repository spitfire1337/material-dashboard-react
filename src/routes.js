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
import Customers from "layouts/customers";
import RepairDetails from "layouts/repairDetails";
import CustomerDetails from "layouts/customerDetails";
import WhatsNew from "layouts/whatsnew";
import Signout from "layouts/authentication/signout";
import GroupRides from "layouts/grouprides";
import WarrantyAdmin from "layouts/warranty_admin";
import Inventory from "layouts/inventory";
import Categories from "layouts/categories";
import Consignments from "layouts/consignments";
import PEVDatabase from "layouts/pevs";
import ETags from "layouts/inventoryTags";
import Checklist from "layouts/checklist";
import PartsOnOrder from "layouts/partsOnOrder";
import RepairGuides from "layouts/repairGuides";
import ActiveRepairs from "layouts/activeRepairs";
// @mui icons
import RepairReport from "layouts/reports/RepairReport";
import SalesTrends from "layouts/reports/SalesTrends";
import TechEfficiency from "layouts/reports/TechEfficiency";
import RepairTimeAnalysis from "layouts/reports/RepairTimeAnalysis";
import RevenueByDevice from "layouts/reports/RevenueByDevice";
import InventoryVelocity from "layouts/reports/InventoryVelocity";
import Icon from "@mui/material/Icon";
import icon from "assets/theme/components/icon";
const devRoutes = (stats) => {
  return [
    {
      name: "Repairs",
      key: "repairs2",
      route: "/repairdetails/:id",
      component: <RepairDetails />,
    },
    {
      name: "Repairs",
      key: "repairs3",
      route: "/repairs/:repairstatus",
      component: <ActiveRepairs />,
    },
    {
      type: "collapse",
      noCollapse: true,
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard stats={stats} />,
    },
    {
      type: "collapse",
      noCollapse: true,
      name: `Orders (${stats.openOrders})`,
      key: "orders",
      icon: <Icon fontSize="small">shopping_bag</Icon>,
      route: "/consignments",
      component: <Consignments />,
    },
    {
      type: "collapse",
      name: `Repairs`,
      key: "repairsmenu",
      icon: <Icon fontSize="small">build</Icon>,
      collapse: [
        {
          type: "collapse",
          name: `Repairs (${stats.repairs})`,
          noCollapse: true,
          key: "repairs",
          icon: <Icon fontSize="small">assignment</Icon>,
          route: "/repairs",
          component: <ActiveRepairs />,
        },
        {
          type: "collapse",
          name: `Parts on Order (${stats.partsonorder})`,
          key: "parts-on-order",
          noCollapse: true,
          icon: <Icon fontSize="small">shopping_cart</Icon>,
          route: "/parts-on-order",
          component: <PartsOnOrder />,
        },
        {
          type: "collapse",
          name: "Repair Guides",
          key: "repair-guides",
          noCollapse: true,
          icon: <Icon fontSize="small">menu_book</Icon>,
          route: "/repair-guides",
          component: <RepairGuides />,
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
      route: "/inventory",
      component: <Inventory />,
      collapse: [
        {
          type: "collapse",
          name: "Inventory",
          key: "Inventory",
          noCollapse: true,
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/inventory",
          component: <Inventory />,
        },
        {
          type: "collapse",
          name: "Categories",
          noCollapse: true,
          key: "categories",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/categories",
          component: <Categories />,
        },
        {
          type: "collapse",
          name: "eTags",
          noCollapse: true,
          key: "eTags",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/etags",
          component: <ETags />,
        },
      ],
    },
    {
      type: "collapse",
      name: "Reports",
      key: "reports",
      icon: <Icon fontSize="small">insights</Icon>,
      collapse: [
        {
          type: "collapse",
          name: "Repairs",
          key: "repairReports",
          icon: <Icon fontSize="small">build</Icon>,
          collapse: [
            {
              type: "collapse",
              name: "Repair Frequency",
              noCollapse: true,
              key: "repairReport",
              route: "/reports/repair-frequency",
              icon: <Icon fontSize="small">airwave</Icon>,
              component: <RepairReport />,
            },
            {
              type: "collapse",
              name: "Tech Efficiency",
              noCollapse: true,
              key: "techEfficiency",
              route: "/reports/tech-efficiency",
              icon: <Icon fontSize="small">engineering</Icon>,
              component: <TechEfficiency />,
            },
            {
              type: "collapse",
              name: "Repair Time Analysis",
              noCollapse: true,
              key: "repairTimeAnalysis",
              route: "/reports/repair-time-analysis",
              icon: <Icon fontSize="small">timer</Icon>,
              component: <RepairTimeAnalysis />,
            },
            {
              type: "collapse",
              name: "Repair Parts Velocity",
              noCollapse: true,
              key: "inventoryVelocity",
              route: "/reports/inventory-velocity",
              icon: <Icon fontSize="small">speed</Icon>,
              component: <InventoryVelocity />,
            },
          ],
        },
        {
          type: "collapse",
          name: "Accounting",
          key: "saleReports",
          icon: <Icon fontSize="small">sell</Icon>,
          collapse: [
            {
              type: "collapse",
              name: "Sales Trends",
              noCollapse: true,
              key: "salesTrends",
              route: "/reports/sales-trends",
              icon: <Icon fontSize="small">show_chart</Icon>,
              component: <SalesTrends />,
            },
            {
              type: "collapse",
              name: "Revenue by Device",
              noCollapse: true,
              key: "revenueByDevice",
              route: "/reports/revenue-by-device",
              icon: <Icon fontSize="small">attach_money</Icon>,
              component: <RevenueByDevice />,
            },
          ],
        },
      ],
    },

    {
      name: "Customers",
      key: "customers2",
      noCollapse: true,
      route: "/customer/:id",
      component: <CustomerDetails />,
    },
    {
      name: "Group Rides",
      noCollapse: true,
      key: "grouprides",
      route: "/grouprides",
      component: <GroupRides />,
    },
    {
      type: "collapse",
      noCollapse: true,
      name: "Consignments",
      key: "consignments",
      icon: <Icon fontSize="small">sell</Icon>,
      route: "/consignments",
      component: <Consignments />,
    },
    {
      type: "collapse",
      name: "Settings",
      key: "Settings",
      icon: <Icon fontSize="small">settings</Icon>,
      route: "/settings",
      collapse: [
        {
          type: "collapse",
          name: "Checklist Questions",
          noCollapse: true,
          key: "checklist",
          icon: <Icon fontSize="small">checklist</Icon>,
          route: "/checklist",
          component: <Checklist />,
        },
        {
          type: "collapse",
          name: "PEV Database",
          key: "pevs",
          route: "/pevDB",
          icon: <Icon fontSize="small">electric_scooter</Icon>,
          component: <PEVDatabase />,
          collapse: [
            {
              name: "PEV Database",
              noCollapse: true,
              key: "pevs",
              route: "/pevDB",
              component: <PEVDatabase />,
            },
            {
              type: "collapse",
              name: "Warranty Admin",
              noCollapse: true,
              icon: <Icon fontSize="small">app_registration</Icon>,
              key: "Admin",
              route: "/warranty_admin",
              component: <WarrantyAdmin />,
            },
          ],
        },
        {
          type: "collapse",
          noCollapse: true,
          name: "Update whats new",
          key: "whatsnew",
          icon: <Icon fontSize="small">note_add</Icon>,
          route: "/WhatsNew",
          component: <WhatsNew />,
        },
      ],
    },
    {
      type: "collapse",
      noCollapse: true,
      name: "Sign out",
      key: "signout",
      icon: <Icon fontSize="small">note_add</Icon>,
      route: "/signout",
      component: <Signout />,
    },
  ];
};

const adminRoutes = (stats) => {
  return [
    {
      type: "collapse",
      noCollapse: true,
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard stats={stats} />,
    },
    {
      type: "collapse",
      name: `Repairs`,
      key: "repairsmenu",
      icon: <Icon fontSize="small">build</Icon>,
      collapse: [
        {
          type: "collapse",
          name: `Repairs (${stats.repairs})`,
          noCollapse: true,
          key: "repairs",
          icon: <Icon fontSize="small">assignment</Icon>,
          route: "/repairs",
          component: <ActiveRepairs />,
        },
        {
          type: "collapse",
          name: `Parts on Order (${stats.partsonorder})`,
          key: "parts-on-order",
          noCollapse: true,
          icon: <Icon fontSize="small">shopping_cart</Icon>,
          route: "/parts-on-order",
          component: <PartsOnOrder />,
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
      component: <Inventory />,
      collapse: [
        {
          type: "collapse",
          name: "Inventory",
          key: "Inventory",
          noCollapse: true,
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/inventory/",
          component: <Inventory />,
        },
        {
          type: "collapse",
          noCollapse: true,
          name: "Categories",
          key: "categories",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/categories/",
          component: <Categories />,
        },
        {
          type: "collapse",
          noCollapse: true,
          name: "eTags",
          key: "eTags",
          icon: <Icon fontSize="small">inventory_2</Icon>,
          route: "/etags/",
          component: <ETags />,
        },
      ],
    },
    {
      type: "collapse",
      name: "Reports",
      key: "reports",
      icon: <Icon fontSize="small">insights</Icon>,
      collapse: [
        {
          type: "collapse",
          name: "Repairs",
          key: "repairReports",
          icon: <Icon fontSize="small">build</Icon>,
          collapse: [
            {
              type: "collapse",
              noCollapse: true,
              name: "Repair Frequency",
              key: "repairReport",
              route: "/reports/repair-frequency",
              component: <RepairReport />,
              icon: <Icon fontSize="small">vital_signs</Icon>,
            },
            {
              type: "collapse",
              noCollapse: true,
              key: "techEfficiency",
              route: "/reports/tech-efficiency",
              component: <TechEfficiency />,
              icon: <Icon fontSize="small">engineering</Icon>,
            },
            {
              type: "collapse",
              noCollapse: true,
              name: "Repair Time Analysis",
              key: "repairTimeAnalysis",
              icon: <Icon fontSize="small">timer</Icon>,
              route: "/reports/repair-time-analysis",
              component: <RepairTimeAnalysis />,
            },
          ],
        },
        {
          type: "collapse",
          name: "Accounting",
          key: "saleReports",
          icon: <Icon fontSize="small">sell</Icon>,
          collapse: [
            {
              type: "collapse",
              noCollapse: true,
              name: "Sales Trends",
              key: "salesTrends",
              route: "/reports/sales-trends",
              component: <SalesTrends />,
              icon: <Icon fontSize="small">show_chart</Icon>,
            },
          ],
        },
      ],
    },
    {
      name: "Repairs",
      key: "repairs2",
      route: "/repairdetails/:id",
      component: <RepairDetails />,
    },
    {
      name: "Customers",
      key: "customers2",
      route: "/customer/:id",
      component: <CustomerDetails />,
    },
    {
      name: "Group Rides",
      noCollapse: true,
      key: "grouprides",
      route: "/grouprides",
      component: <GroupRides />,
    },
    {
      type: "collapse",
      name: "Settings",
      key: "Settings",
      icon: <Icon fontSize="small">settings</Icon>,
      route: "/settings/",
      collapse: [
        {
          type: "collapse",
          noCollapse: true,
          name: "Checklist Questions",
          key: "checklist",
          icon: <Icon fontSize="small">checklist</Icon>,
          route: "/checklist",
          component: <Checklist />,
        },
        {
          type: "collapse",
          name: "PEV Database",
          key: "pevs",
          route: "/pevDB",
          icon: <Icon fontSize="small">electric_scooter</Icon>,
          component: <PEVDatabase />,
          collapse: [
            {
              name: "PEV Database",
              noCollapse: true,
              key: "pevs",
              route: "/pevDB",
              component: <PEVDatabase />,
            },
            {
              type: "collapse",
              noCollapse: true,
              name: "Warranty Admin",
              icon: <Icon fontSize="small">app_registration</Icon>,
              key: "Admin",
              route: "/warranty_admin",
              component: <WarrantyAdmin />,
            },
          ],
        },
      ],
    },
  ];
};

const techRoutes = (stats) => {
  return [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      noCollapse: true,
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: <Dashboard stats={stats} />,
    },
    {
      type: "collapse",
      name: `Repairs`,
      key: "repairsmenu",
      icon: <Icon fontSize="small">build</Icon>,
      collapse: [
        {
          type: "collapse",
          name: `Repairs (${stats.repairs})`,
          noCollapse: true,
          key: "repairs",
          icon: <Icon fontSize="small">assignment</Icon>,
          route: "/repairs",
          component: <ActiveRepairs />,
        },
        {
          type: "collapse",
          name: `Parts on Order (${stats.partsonorder})`,
          key: "parts-on-order",
          noCollapse: true,
          icon: <Icon fontSize="small">shopping_cart</Icon>,
          route: "/parts-on-order",
          component: <PartsOnOrder />,
        },
        {
          type: "collapse",
          name: "Repair Guides",
          key: "repair-guides",
          noCollapse: true,
          icon: <Icon fontSize="small">menu_book</Icon>,
          route: "/repair-guides",
          component: <RepairGuides />,
        },
      ],
    },
    {
      name: "Repairs",
      key: "repairs2",
      noCollapse: true,
      route: "/repairdetails/:id",
      component: <RepairDetails />,
    },
    {
      name: "Group Rides",
      noCollapse: true,
      route: "/grouprides",
      component: <GroupRides />,
    },
  ];
};
const reportRoutes = () => {
  return [
    {
      name: "Repair Frequency",
      key: "repairReport",
      route: "/reports/repair-frequency",
      component: <RepairReport />,
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
const routes = (stats, loginState) => {
  if (loginState.user.isDev) return devRoutes(stats);
  if (loginState.user.isAdmin) return adminRoutes(stats);
  if (loginState.user.isTech) return techRoutes(stats);
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
