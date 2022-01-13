/* eslint-disable import/first */
import React from "react";
import { CRUD_MODELS, ROUTES } from "../constants";
import { useAuth0 } from "@auth0/auth0-react";

import async from "../components/Async";

import {
  BookOpen,
  Database,
  Grid,
  Home,
  List,
  Monitor,
  Users,
  Map,
  Share2,
} from "react-feather";
//testinggg

import AuthGuard from "../components/AuthGuard";
import DeveloperGuard from "../components/DeveloperGuard";
import DeveloperVisibilityFilter from "../components/DeveloperVisibilityFilter";
import AdminGuard from "../components/AdminGuard";
import AdminVisibilityFilter from "../components/AdminVisibilityFilter";

import Blank from "../pages/pages/Blank";
import Changelog from "../pages/docs/Changelog";
import Landing from "../pages/presentation/Landing";
import ProtectedPage from "../pages/protected/ProtectedPage";
import Introduction from "../pages/docs/Introduction";
import Support from "../pages/docs/Support";
import { All, EXAMPLE_COMPONENTS } from "../pages/components/All";
import { DocumentationProvider } from "../pages/docs/DocumentationProvider";
import * as inflector from "inflected";
import { dasherize, underscore } from "inflected";
import GettingStarted from "../pages/docs/GettingStarted";
import { CrudProvider } from "../CrudProvider";
import CRUD from "../pages/docs/CRUD";
import Deploy from "../pages/docs/Deploy";

// TODO MAYBE LAZY IMPORT
import MobileMap from "../components/map/MobileMap";
import StaffGageReadings from "../pages/dashboards/data entry/StaffGageReadings";
const Account = async(() => import("../pages/pages/Account"));
const Profile = async(() => import("../pages/pages/Profile"));

const CrudIndexPage = async(() => import("../components/crud/CrudIndexPage"));
const CrudViewPage = async(() => import("../components/crud/CrudViewPage"));

const getSidebarMenu = (list) => {
  return list.map((item) => {
    const slug = inflector.dasherize(inflector.underscore(item.name));
    return {
      id: item.sidebarName ?? inflector.titleize(item.name),
      path: `/models/${slug}`,
      model: inflector.singularize(item.name),
      icon: item.icon || <Database />,
      component: CrudIndexPage,
      config: require(`../pages/models/${item.name}Config`),
      provider: CrudProvider,
      children: item.children,
      header: item.header,
      guard: item.guard,
      visibilityFilter: item.visibilityFilter,
    };
  });
};

const getCrudRoutes = (list) => {
  return list.map((item) => {
    const config = require(`../pages/models/${item.name}Config`);
    const slug = inflector.dasherize(inflector.underscore(item.name));

    return {
      id: inflector.titleize(item.name),
      path: `/models/${slug}`,
      model: inflector.singularize(item.name),
      component: CrudIndexPage,
      provider: CrudProvider,
      config,
      crud: [
        {
          path: `/models/${slug}/:id`,
          name: `View ${inflector.titleize(inflector.singularize(item.name))}`,
          component: CrudViewPage,
          provider: CrudProvider,
          model: inflector.singularize(item.name),
          config,
        },
        {
          path: `/models/${slug}/add`,
          name: `Add ${inflector.titleize(inflector.singularize(item.name))}`,
          component: CrudViewPage,
          provider: CrudProvider,
          model: inflector.singularize(item.name),
          config,
        },
      ],
    };
  });
};

const crudSidebarMenu = [...getSidebarMenu(CRUD_MODELS)];
const modelCrudRoutes = [...getCrudRoutes(CRUD_MODELS)];

const publicMapRoutes = {
  header: "Mobile Access",
  id: "Map",
  icon: <Map />,
  path: ROUTES.MOBILE_MAP,
  name: "Map",
  component: MobileMap,
  guard: AdminGuard,
  visibilityFilter: AdminVisibilityFilter,
};

const dataEntryRoutes = {
  header: "Data Access",
  id: "Data Entry",
  icon: <Share2 />,
  children: [
    {
      path: "/data-access/staff-gage-readings",
      name: "Staff Gage Readings",
      component: StaffGageReadings,
      guard: AdminGuard,
    },
  ],
  guard: AdminGuard,
  visibilityFilter: AdminVisibilityFilter,
};

const accountRoutes = {
  id: "Account",
  path: "/account",
  name: "Account",
  header: "Pages",
  icon: <Users />,
  component: Account,
  children: [
    {
      path: ROUTES.USER_PROFILE,
      name: "Profile",
      component: Profile,
    },
    {
      path: "/auth/logout",
      name: "Logout",
      component: function Logout() {
        const { logout } = useAuth0();
        logout();
      },
    },
  ],
  guard: AuthGuard,
};

const landingRoutes = {
  id: "Landing Page",
  path: "/",
  header: "Docs",
  icon: <Monitor />,
  component: Landing,
  children: null,
};

const mainRoutes = {
  id: "Dashboard",
  path: "/dashboard",
  icon: <Home />,
  component: Blank,
  children: null,
  containsHome: true,
  guard: AuthGuard,
  visibilityFilter: AdminVisibilityFilter,
};

const pageRoutes = {
  id: "Pages",
  path: "/pages",
  icon: <Monitor />,
  component: Blank,
  children: [
    {
      path: "/dashboard/default",
      name: "Dashboard",
      component: Blank,
    },
    {
      path: ROUTES.PAGE_ABOUT,
      name: "About LRE Water Unified Platform",
      component: Blank,
    },
    {
      path: ROUTES.PAGE_SUPPORT,
      name: "Support",
      component: Blank,
    },
    {
      path: ROUTES.PAGE_DOCUMENTATION,
      name: "Documentation",
      component: Blank,
    },
    {
      path: ROUTES.PAGE_BLANK,
      name: "Blank",
      component: Blank,
    },
  ],
};

const documentationRoutes = {
  id: "Documentation",
  path: ROUTES.PAGE_DOCUMENTATION,
  icon: <BookOpen />,
  provider: DocumentationProvider,
  children: [
    {
      path: ROUTES.PAGE_DOCS_INTRODUCTION,
      name: "Introduction",
      component: Introduction,
    },
    {
      path: ROUTES.PAGE_DOCS_GETTING_STARTED,
      name: "Getting Started",
      component: GettingStarted,
    },
    {
      path: ROUTES.PAGE_DOCS_CRUD,
      name: "CRUD",
      component: CRUD,
    },
    {
      path: ROUTES.PAGE_DOCS_DEPLOY,
      name: "Deploy",
      component: Deploy,
    },
    {
      path: ROUTES.PAGE_DOCS_SUPPORT,
      name: "Support",
      component: Support,
    },
    {
      path: ROUTES.PAGE_CHANGELOG,
      name: "Changelog",
      component: Changelog,
    },
  ],
  component: null,
  guard: DeveloperGuard,
  visibilityFilter: DeveloperVisibilityFilter,
};

const slugify = (str) => {
  return dasherize(underscore(str));
};

const componentsRoutes = {
  id: "Components",
  path: "/components",
  header: "UI Kit",
  icon: <Grid />,
  children: [
    {
      path: "/components/all",
      name: "All",
      component: All,
    },
    ...EXAMPLE_COMPONENTS.map((x) => ({
      name: x.title,
      path: `/components/${slugify(x.title)}`,
      component: () => All({ exampleComponent: x }),
    })),
  ],
  component: null,
  guard: DeveloperGuard,
  visibilityFilter: DeveloperVisibilityFilter,
};

const changelogRoutes = {
  id: "Changelog",
  path: "/changelog",
  badge: process.env.REACT_APP_VERSION || "v1.0.0",
  icon: <List />,
  component: Changelog,
  provider: DocumentationProvider,
  children: null,
};

// This route is only visible while signed in
//it also routes to the login page
const protectedPageRoutes = {
  id: "Private",
  path: "/private",
  icon: <Monitor />,
  component: ProtectedPage,
  children: null,
  guard: AuthGuard,
};

const adminRoutes = {
  id: "Users",
  header: "Administration",
  path: "/admin/users",
  icon: <Users />,
  component: Blank,
  children: [
    {
      path: "/admin/users",
      name: "Users",
      component: Blank,
    },
    {
      path: "/admin/roles",
      name: "Roles",
      component: Blank,
    },
    {
      path: "/admin/permissions",
      name: "Permissions",
      component: Blank,
    },
  ],
  guard: DeveloperGuard,
  visibilityFilter: DeveloperVisibilityFilter,
};

// Routes using the Dashboard layout
export const dashboardLayoutRoutes = [
  pageRoutes,
  mainRoutes,
  changelogRoutes,
  accountRoutes,
  documentationRoutes,
  componentsRoutes,
  adminRoutes,
  dataEntryRoutes,
];

export const dashboardMaxContentLayoutRoutes = [
  ...crudSidebarMenu,
  ...modelCrudRoutes,
  publicMapRoutes,
];

// Routes using the Auth layout
export const authLayoutRoutes = [accountRoutes];

// Routes using the Presentation layout
export const presentationLayoutRoutes = [landingRoutes];

// Routes using the full screen map layout
export const fullscreenMapRoutes = [];

// Routes that are protected
export const protectedRoutes = [protectedPageRoutes];

// Routes visible in the sidebar
export const sidebarRoutes = [
  mainRoutes,
  ...crudSidebarMenu,
  dataEntryRoutes,
  publicMapRoutes,
  adminRoutes,
  componentsRoutes,
  documentationRoutes,
];
