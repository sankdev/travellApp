import axios from 'axios';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AgencyDashboard from './components/agency/AgencyDashboard';
import AgencyLayout from './components/agency/AgencyLayout';
import ClassComponent from './components/agency/Class';
import Compaign from './components/agency/Compaign';
import Company from './components/agency/CompanyCreation';
import CreationAgency from './components/agency/CreationAgency';
import Destination from './components/agency/Destination';
import ImageCreation from './components/agency/ImageCreation';
import VolCRUD from './components/agency/VolCRUD';
import PrivateRoute from './components/auth/PrivateRoute';
import RoleBasedRedirect from './components/auth/RoleBasedRedirect';
import CreateCustomer from './components/customer/CreateCustomer';
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerInvoices from './components/customer/CustomerInvoices';
import CustomerLayout from './components/customer/CustomerLayout';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerReservations from './components/customer/CustomerReservations';
import CreateReservation from './components/customer/reservation/CreateReservation';
import ReservationDetail from './components/customer/reservation/ReservationDetail';
import ReservationList from './components/customer/reservation/ReservationList';
import ForgotPassword from './components/users/ForgotPassword';
import ResetPassword from './components/users/ResetPassword';
import UserLogin from './components/users/UserLogin';
import UserProfile from './components/users/UserProfile';
import UserRegister from './components/users/UserRegister';
import ReservationByAgency from './components/agency/ReservationByAgencie';
import ReservationDetailByAgency from './components/agency/ReservationDetail';
//import ConfirmReservation from './components/agency/confirmReservations';
import ReservationCard from './components/agency/ReservationCard';
import InvoicePayment from './components/customer/InvoicesPayment';
import ModePayment from './components/agency/ModePayment';
import InvoiceDetails from './components/customer/InvoicesDetails';
import InvoiceDetailsAgency from './components/agency/invoicesDetailsAgency';
import GetInvoicesAgency from './components/agency/getInvoicesAgency'; // Updated import
import ListPayment from './components/agency/ListPayment'
// Set the base URL for axios
axios.defaults.baseURL = "http://localhost:5000";

function App() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/register" element={<UserRegister />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Redirection basée sur le rôle après connexion */}
      <Route path="/redirect" element={<RoleBasedRedirect />} />

      {/* Routes protégées pour les clients */}
      <Route
        path="/customer/*"
        element={
          <PrivateRoute allowedRoles={['customer']}>
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
        <Route path="invoicesDetail/:invoiceId" element={<InvoiceDetails />} /> {/* Add this line */}
      </Route>

      {/* Routes protégées pour les agences */}
      <Route
        path="/agency/*"
        element={
          <PrivateRoute allowedRoles={['agency']}>
            <AgencyLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<AgencyDashboard />} />
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
        <Route path="payment-modes" element={<ModePayment />} /> {/* Add this line */}
        <Route path='invoices' element={<GetInvoicesAgency/>}/> // Updated route
        <Route path='invoicesDetailAgency/:invoiceId' element={<InvoiceDetailsAgency/>}/> // Fixed route to use the correct component
        <Route path='List-Payment' element={<ListPayment/>}/>
      </Route>

      {/* Route par défaut */}
      <Route path="/" element={<RoleBasedRedirect />} />
    </Routes>
  );
}

export default App;
