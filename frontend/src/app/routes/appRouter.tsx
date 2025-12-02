import { Navigate, createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from './DashboardLayout'
import { RequireAuth } from './RequireAuth'
import { AuthLayout } from './AuthLayout'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { TimeEntriesPage } from '@/features/time-entries/pages/TimeEntriesPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { RemindersPage } from '@/features/reminders/pages/RemindersPage'
import { IntegrationsPage } from '@/features/integrations/pages/IntegrationsPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

export const appRouter = createBrowserRouter([
	{
		path: '/',
		element: <RequireAuth />,
		children: [
			{
				element: <DashboardLayout />,
				children: [
					{ index: true, element: <DashboardPage /> },
					{ path: 'projects', element: <ProjectsPage /> },
					{ path: 'time-entries', element: <TimeEntriesPage /> },
					{ path: 'reports', element: <ReportsPage /> },
					{ path: 'reminders', element: <RemindersPage /> },
					{ path: 'integrations', element: <IntegrationsPage /> },
				],
			},
		],
	},
	{
		path: '/auth',
		element: <AuthLayout />,
		children: [
			{ path: 'login', element: <LoginPage /> },
			{ path: 'register', element: <RegisterPage /> },
		],
	},
	{ path: '*', element: <Navigate to="/" replace /> },
])
