import NotFoundPage from "../pages/Public/NotFoundPage";

import { UserRoutes } from "./UserRoutes";
import { DoctorRoutes } from "./doctorRoutes";
import { AdminRoutes } from "./adminRoutes";

const allRoutes = [
  ...UserRoutes,
  ...DoctorRoutes,
  ...AdminRoutes,

  {
    path: "*",
    element: NotFoundPage,
    layout: null,
    isPrivate: false,
  },
];

export default allRoutes;
