import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./pages/RootLayout.jsx";
import { Suppliers } from "./pages/supplier/Suppliers.jsx";
import DashboardTabs from "./pages/Dashboard/DashboardTabs.jsx";
import { SupplierEdit } from "./pages/supplier/Edit.jsx";
import { AuthLayout } from "./pages/AuthLayout.jsx";
import { LoginPage } from "./pages/Auth/LoginPage.jsx";
import { AuthProvider } from "./services/AuthProvider.jsx";
import { PurchaseEdit } from "./pages/purchase/Edit.jsx";
import BillComponent from "./pages/Bills/BillComponent.jsx";
import ExpenseTracking from "./pages/Expenses/ExpenseTracking.jsx";
import { Production } from "./pages/Production/Production.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Purchases from "./pages/purchase/Purchases.jsx";
import SupplierLedger from "./pages/supplier/SupplierLedger.jsx";
import LandingPageLayout from "./pages/LandingPageLayout.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPageLayout />,
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        index: true, // ✅ Loads LoginPage at "/auth"
        element: <LoginPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "admin",
    element: <PrivateRoute><RootLayout /></PrivateRoute>, // ✅ Apply auth to the entire "admin" section
    children: [
      {
        index: true, // ✅ Loads DashboardTabs by default for "/admin"
        element: <DashboardTabs />,
      },
      {
        path: "suppliers",
        element: <Suppliers />,
      },
      {
        path: "suppliers/ledger",
        element: <SupplierLedger />,
      },
      {
        path: "production",
        element: <Production />,
      },
      {
        path: "bills",
        element: <BillComponent />,
      },
      {
        path: "expenses",
        element: <ExpenseTracking />,
      },
      {
        path: "purchases",
        element: <Purchases />,
      },
      {
        path: "supplier/edit",
        element: <SupplierEdit />,
      },
      {
        path: "purchase/edit",
        element: <PurchaseEdit />,
      },
    ],
  },
]);

function App() {
  return (
    <div className={"flex justify-center w-full"}>
      <div className={"w-full"}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
