import './dashboard.css'
import EspaceShell from '../../components/espace/EspaceShell'

export const metadata = { title: 'Mon espace — The Winner School' }

export default function DashboardLayout({ children }) {
  return <EspaceShell>{children}</EspaceShell>
}
