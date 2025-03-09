import axios from 'axios';
import React from 'react';
import { Route, Router, Routes } from 'react-router-dom';
import AgencyDashboard from './components/agency/AgencyDashboard';
import AgencyLayout from './components/agency/AgencyLayout';
import ClassComponent from './components/agency/Class';
import ClassAgency from './components/agency/ClassAgency';
import Compaign from './components/agency/Compaign';
import Company from './components/agency/CompanyCreation';
import CreationAgency from './components/agency/CreationAgency';
import Destination from './components/agency/Destination';
import FlightAgency from './components/agency/FlightAgency';
import GetInvoicesAgency from './components/agency/getInvoicesAgency';
import ImageCreation from './components/agency/ImageCreation';
import InvoiceDetailsAgency from './components/agency/invoicesDetailsAgency';
import ListPayment from './components/agency/ListPayment';
import ModePayment from './components/agency/ModePayment';
import PricingRuleCRUD from './components/agency/PricingRuleCRUD';
import ReservationByAgency from './components/agency/ReservationByAgencie';
import ReservationCard from './components/agency/ReservationCard';
import ReservationDetailByAgency from './components/agency/ReservationDetail';
import VolCRUD from './components/agency/VolCRUD';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';
import CreateCustomer from './components/customer/CreateCustomer';
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerInvoices from './components/customer/CustomerInvoices';
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerReservations from './components/customer/CustomerReservations';
import InvoiceDetails from './components/customer/InvoicesDetails';
import InvoicePayment from './components/customer/InvoicesPayment';
import CreateReservation from './components/customer/reservation/CreateReservation';
import ReservationCampaign from './components/customer/reservation/ReservationCampaign';
import ReservationDetail from './components/customer/reservation/ReservationDetail';
import ReservationList from './components/customer/reservation/ReservationList';
import FlightDetails from './components/pages/flightDetail';
import { LandingPage } from './components/pages/pagesMain';
import ForgotPassword from './components/users/ForgotPassword';
import ResetPassword from './components/users/ResetPassword';
import UserLogin from './components/users/UserLogin';
import UserProfile from './components/users/UserProfile';
import UserRegister from './components/users/UserRegister';
import InvoicePaymentByAgency from'./components/agency/InvoicePaymentByAgency';
import AdminLayout from './components/users/Dashboard/Layout/AdminLayout';
import { UserManagement } from './components/pages/UserManagement';
import { RoleManagement } from './components/pages/RoleManagement';
import { Dashboard } from './components/pages/Dashboard';
import PermissionManagement from './components/pages/PermissionManagement';
import RolePermissionPage from './components/pages/RolePermissionPage';
axios.defaults.baseURL = "http://localhost:5000";

function App() {
  return (
    
    <Routes>
      {/* Routes publiques */}
      <Route path="/register" element={<UserRegister />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path='/flights/:flightId' element={<FlightDetails/>}/>
      {/* Redirection basée sur le rôle après connexion */}
      <Route path="/redirect" element={<RoleBasedRedirect />} />

      {/* Routes protégées pour les clients */}
      <Route
        path="/customer/*"
        element={
          <PrivateRoute allowedRoles={['customer','admin']}>
            <CustomerLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="reservations" element={<CustomerReservations />} />
        <Route path="reservations/new" element={<CreateReservation />} />
        <Route path="reservations/create" element={<CreateReservation />} />
        <Route path="reservations/:id" element={<ReservationDetail />} />
        <Route path="reservations/list" element={<ReservationList />} />
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="create" element={<CreateCustomer />} />
        <Route path="invoices/:invoiceId/pay" element={<InvoicePayment />} />
        <Route path="invoicesDetail/:invoiceId" element={<InvoiceDetails />} />
        <Route path="reservations/campaign"  element={<ReservationCampaign />} />
         
      </Route>

      {/* Routes protégées pour les agences */}
      <Route
        path="/agency/*"
        element={
          <PrivateRoute allowedRoles={['agency','admin']}>
            <AgencyLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard/*" element={<AgencyDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="create" element={<CreationAgency />} />
        <Route path="company" element={<Company />} />
        <Route path="class" element={<ClassComponent />} />
        <Route path="compaign" element={<Compaign />} />
        <Route path="destination" element={<Destination />} />
        <Route path="image" element={<ImageCreation />} />
        <Route path="vol" element={<VolCRUD />} />
        <Route path="reservations" element={<ReservationByAgency />} />
       
        <Route path="reservationCard" element={<ReservationCard />} />
        <Route path="reservations/:id" element={<ReservationDetailByAgency />} />
        <Route path="payment-modes" element={<ModePayment />} />
        <Route path='invoices' element={<GetInvoicesAgency/>}/>
        <Route path='invoicesDetailAgency/:invoiceId' element={<InvoiceDetailsAgency/>}/>
        <Route path='List-Payment' element={<ListPayment/>}/>
        <Route path='Agency-flight' element={<FlightAgency/>}/>
        <Route path='Agency-Class' element={<ClassAgency/>}/>
        <Route path='Agency-PricingRules' element={<PricingRuleCRUD/>}/>
        <Route path='invoices/:invoiceId/pay' element={<InvoicePaymentByAgency/>}/>

    
      </Route>
   {/* Routes pour l'Admin */}
   <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="permissions" element={<PermissionManagement />} />
          <Route path="role-permissions" element={<RolePermissionPage />} />
          <Route path="analytics" element={<div className="p-4">Analytics Page (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Route>
      {/* Route par défaut */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
    
  );
}

export default App;
