import React from 'react';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/users/Users';
import Roles from '../pages/users/Roles';
import Menus from '../pages/users/Menus';
import Settings from '../pages/Settings';
import Branch from '../pages/company/Branch';
import MenuPermission from '../pages/users/MenuPermission';
import Company from '../pages/company/Company';
import UserBranch from '../pages/users/UserBranch';
import Profile from '../pages/users/Profile';
import TestTable from '../pages/TestTable';
import ApiDoc from '../pages/ApiDoc';
import SchemaErd from '../pages/SchemaErd';

export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> }
];

export const protectedRoutes = [
  { path: '/', element: <Dashboard /> },
  { path: '/dashboard', element: <Dashboard /> },

  // Standard routes
  { path: '/users', element: <Users /> },
  { path: '/roles', element: <Roles /> },
  { path: '/menus', element: <Menus /> },
  { path: '/branches', element: <Branch /> },
  { path: '/menu-permissions', element: <MenuPermission /> },
  { path: '/company', element: <Company /> },
  { path: '/userbranch', element: <UserBranch /> },
  { path: '/profile', element: <Profile /> },
  { path: '/test-table', element: <TestTable /> },
  { path: '/api-docs', element: <ApiDoc /> },
  { path: '/database-schema', element: <SchemaErd /> },

  // Alternative path aliases to match API responses
  { path: '/user', element: <Users /> },
  { path: '/role', element: <Roles /> },
  { path: '/menu', element: <Menus /> },
  { path: '/branch', element: <Branch /> },
  { path: '/permission', element: <MenuPermission /> },
  { path: '/companies', element: <Company /> },
  { path: '/user-branch', element: <UserBranch /> },

  { path: '/settings', element: <Settings /> }
];

