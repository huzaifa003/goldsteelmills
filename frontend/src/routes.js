import {
  FaHome,
  FaTruck,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaSignInAlt,
} from "react-icons/fa";

export const routes = [
  {
    name: "Home",
    icon: FaHome,
    routeURL: "/admin",
  },
  {
    name: "Suppliers",
    icon: FaTruck,
    routeURL: "/admin/suppliers",
  },
  {
    name: "Purchases",
    icon: FaMoneyCheckAlt,
    routeURL: "/admin/purchases",
  },
  {
    name: 'Production',
    icon: FaShoppingCart,
    routeURL: '/admin/production'
  },
  {
    name: "Sales Invoices",
    icon: FaFileInvoiceDollar,
    routeURL: "/admin/bills",
  },
  {
    name: "Expense Tracker",
    icon: FaMoneyCheckAlt,
    routeURL: "/admin/expenses",
  },
  //admin// {
  //   name: "Supplies Tracker",
  //   icon: FaMoneyCheckAlt,
  //   routeURL: "/supplies",
  // },
  {
    name: "Logout",
    icon: FaSignInAlt,
    routeURL: "/auth/login",
  },
];
