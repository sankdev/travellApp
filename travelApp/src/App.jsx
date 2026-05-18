import axios from 'axios';
import React from 'react';
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import AgencyDashboard from './components/agency/AgencyDashboard';
import AgencyLayout from './components/agency/AgencyLayout';
import ClassComponent from './components/agency/Class';
import PropositionVol from './components/agency/propositionVol';
import ClassAgency from './components/agency/ClassAgency';
import Compaign from './components/agency/Compaign';
import Company from './components/agency/CompanyCreation';
import CreationAgency from './components/agency/CreationAgency';
import Destination from './components/agency/Destination';
import FlightAgency from './components/agency/FlightAgency';
import GetInvoicesAgency from './components/agency/getInvoicesAgency';
import ImageCreation from './components/agency/ImageCreation';
import InvoicePaymentByAgency from './components/agency/InvoicePaymentByAgency';
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
import ProposalResponse from './components/customer/reservation/ProposalResponse';
import CreateReservation from './components/customer/reservation/CreateReservation';
import CreateReservationAuto from './components/customer/reservation/CreateReservationAuto';
import CreateCampaignReservationAuto from './components/customer/reservation/ReservationCampaignAuto';
import ReservationCampaign from './components/customer/reservation/ReservationCampaign';
import ReservationForm from './components/customer/reservation/ReservationForm';
import ReservationDetail from './components/customer/reservation/ReservationDetail';
import ReservationList from './components/customer/reservation/ReservationList';
import AssignUserToAgency from './components/pages/AssignUserToAgency';
import { Dashboard } from './components/pages/Dashboard';
import FlightDetails from './components/pages/flightDetail';
import { LandingPage } from './components/pages/pagesMain';
import PermissionManagement from './components/pages/PermissionManagement';
import  CampaignDetails from './components/pages/CampaignDetails'
import AgencyDetails from './components/pages/AgencyDetails'
import { RoleManagement } from './components/pages/RoleManagement';
import RolePermissionPage from './components/pages/RolePermissionPage';
import { UserManagement } from './components/pages/UserManagement';
import AdminLayout from './components/users/Dashboard/Layout/AdminLayout';
import ForgotPassword from './components/users/ForgotPassword';
import ResetPassword from './components/users/ResetPassword';
import UserLogin from './components/users/UserLogin';
import UserProfile from './components/users/UserProfile';
import UserRegister from './components/users/UserRegister';
import './App.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/register" element={<UserRegister />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token?" element={<ResetPassword />} />
        <Route path='/flights/:flightId' element={<FlightDetails/>}/>
       <Route path='/campaigns/:id' element={<CampaignDetails  />} />
        <Route path="/agencies/:id" element={<AgencyDetails />} />
        {/* Redirection après connexion */}
        <Route path="/redirect" element={<RoleBasedRedirect />} />
        

        {/*  Routes protégées pour les clients */}
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
  
  {/* ✅ Routes de réservation unifiées */}
  <Route path="reservations" element={<ReservationList />} /> {/* Liste principale */}
  <Route path="reservations/mes-reservations" element={<CustomerReservations />} /> {/* Mes réservations (statuts) */}
  <Route path="reservations/demande" element={<ReservationForm />} /> {/* Formulaire pro */}
  <Route path="reservations/campaign" element={<ReservationCampaign />} /> {/* Campagne */}
  <Route path="reservations/campaign/auto" element={<CreateCampaignReservationAuto />} />
  <Route path="reservations/new" element={<CreateReservation />} />
  <Route path="reservations/auto" element={<CreateReservationAuto />} />
  <Route path="reservations/create" element={<CreateReservation />} />
  <Route path="reservations/:id" element={<ReservationDetail />} /> {/* Détail avec ID dynamique */}
  
  <Route path="proposal/:proposalId" element={<ProposalResponse />} />
  <Route path="invoices" element={<CustomerInvoices />} />
  <Route path="profile" element={<CustomerProfile />} />
  <Route path="create" element={<CreateCustomer />} />
  <Route path="invoices/:invoiceId/pay" element={<InvoicePayment />} />
  <Route path="invoicesDetail/:invoiceId" element={<InvoiceDetails />} />
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
         
          
          <Route path="compaign" element={<Compaign />} />
         
          <Route path="image" element={<ImageCreation />} />
          
          <Route path="reservations" element={<ReservationByAgency />} />
          <Route path="reservationCard" element={<ReservationCard />} />
          
           <Route path="proposer/:id" element={<PropositionVol />} />  
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
           <Route path="company" element={<Company />} />
          <Route path="class" element={<ClassComponent />} />
          <Route path="destination" element={<Destination />} />

           <Route path="vol" element={<VolCRUD />} />
          <Route path="permissions" element={<PermissionManagement />} />
          <Route path="role-permissions" element={<RolePermissionPage />} />
          <Route path="user-agency" element={<AssignUserToAgency />} />
          <Route path="analytics" element={<div className="p-4">Analytics Page (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Route>

        {/* Route par défaut */}
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
