import './admin.css'
import AdminShell from '../../components/admin/AdminShell'

export const metadata = { title: 'Administration — The Winner School' }

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>
}
