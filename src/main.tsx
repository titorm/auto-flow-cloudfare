import { enableMapSet } from 'immer';
enableMapSet();
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AppLayout } from '@/components/layouts/AppLayout';
import { WorkflowBuilderPage } from '@/pages/WorkflowBuilderPage';
import { ExecutionHistoryPage } from '@/pages/ExecutionHistoryPage';
import { Toaster } from '@/components/ui/sonner';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'builder/:workflowId',
        element: (
          <ReactFlowProvider>
            <WorkflowBuilderPage />
          </ReactFlowProvider>
        ),
      },
      {
        path: 'workflows/:workflowId/history',
        element: <ExecutionHistoryPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors />
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}