// src/routes/UserRoutes.js

import DefaultLayout from "../layout/DefaultLayout";

// Import Pages
import HomePage from "../pages/Public/HomePage";

import Login from "../pages/Public/Login";
import Register from "../pages/Public/Register";
import PatientProfile from "../pages/Patient/PatientProfile";
import BookingHistory from "../pages/Patient/BookingHistory";
import ForgotPassword from "../pages/Public/ForgotPassword";
import AboutUs from "../pages/Public/AboutUs";
import Doctor from "../pages/Public/Doctor";
import Feedback from "../pages/Public/Feedback";
import PricePage from "../pages/Public/Price";
import Services from "../pages/Public/Service";
import WhyUs from "../pages/Public/WhyUs";
import Booking from "../pages/Public/Booking";

export const UserRoutes = [
  {
    path: "/",
    element: HomePage,
    layout: DefaultLayout,
    isPrivate: false,
  },
  {
    path: "/booking",
    element: Booking,
    layout: DefaultLayout,
    isPrivate: false,
  },

  {
    path: "/account/login",
    element: Login,
    layout: null,
    isPrivate: false,
  },
  {
    path: "/account/register",
    element: Register,
    layout: null,
    isPrivate: false,
  },
  {
    path: "/account/forgot-password",
    element: ForgotPassword,
    layout: null,
    isPrivate: false,
  },

  {
    path: "/patient/profile",
    element: PatientProfile,
    layout: DefaultLayout,
    isPrivate: true,
    roles: [3],
  },
  {
    path: "/patient/history",
    element: BookingHistory,
    layout: DefaultLayout,
    isPrivate: true,
    roles: [3],
  },
  {
    path: "/about",
    element: AboutUs,
    layout: DefaultLayout,
    isPrivate: false,
  },
  {
    path: "/doctors",
    element: Doctor,
    layout: DefaultLayout,
    isPrivate: false,
  },
  {
    path: "/prices",
    element: PricePage,
    layout: DefaultLayout,
    isPrivate: false,
  },
  {
    path: "/service",
    element: Services,
    layout: DefaultLayout,
    isPrivate: false,
  },
  {
    path: "/feedback",
    element: Feedback,
    layout: DefaultLayout,
    isPrivate: false,
  },
  {
    path: "/whyus",
    element: WhyUs,
    layout: DefaultLayout,
    isPrivate: false,
  },
];
