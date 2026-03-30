// Save as: src/app/admin/users/page.tsx (NEW FILE + NEW FOLDER)
'use client'
import { useState, useEffect } from 'react'
import {
  Plus, X, Save, Trash2, Edit2, Shield, Eye, EyeOff,
  Check, Users, Mail, Key, ToggleLeft, ToggleRight, Crown,
  ShieldCheck, PenLine, BookOpen, Clock
} from 'lucide-react'

// ── Role definitions ──────────────────────────────────────────────
const ROLES = {
  owner: {
    label:       'Owner',
    color:       'bg-[#1a1a1a] text-white',
    icon:        Crown,
    description: 'Full access to everything including admin user management',
  },
  manager: {
    label:       'Manager',
    color:       'bg-purple-100 text-purple-700',
    icon:        ShieldCheck,
    description: 'Full store access. Cannot manage admin users or settings',
  },
  editor: {
    label:       'Editor',
    color:       'bg-blue-100 text-blue-700',
    icon:        PenLine,
    description: 'Can manage orders and products. Cannot access analytics or discounts',
  },
  viewer: {
    label:       'Viewer',
    color:       'bg-gray-100 text-gray-600',
    icon:        BookOpen,
    description: 'Read-only access. Cannot edit anything',
  },
}

// ── All available permissions ──────────────────────────────────────
const ALL_PERMISSIONS = [
  { group: 'Orders',    key: 'orders.view',      label: 'View orders' },
  { group: 'Orders',    key: 'orders.edit',      label: 'Update order status' },
  { group: 'Orders',    key: 'orders.fulfill',   label: 'Fulfill & ship orders' },
  { group: 'Returns',   key: 'returns.view',     label: 'View returns' },
  { group: 'Returns',   key: 'returns.edit',     label: 'Approve / reject returns' },
  { group: 'Products',  key: 'products.view',    label: 'View products' },
  { group: 'Products',  key: 'products.create',  label: 'Create products' },
  { group: 'Products',  key: 'products.edit',    label: 'Edit products' },
  { group: 'Products',  key: 'products.delete',  label: 'Delete products' },
  { group: 'Inventory', key: 'inventory.view',   label: 'View inventory' },
  { group: 'Inventory', key: 'inventory.edit',   label: 'Update inventory' },
  { group: 'Customers', key: 'customers.view',   label: 'View customers' },
  { group: 'Discounts', key: 'discounts.view',   label: 'View discounts' },
  { group: 'Discounts', key: 'discounts.edit',   label: 'Create / edit discounts' },
  { group: 'Analytics', key: 'analytics.view',   label: 'View analytics' },
  { group: 'Settings',  key: 'settings.view',    label: 'View settings' },
  { group: 'Settings',  key: 'settings.edit',    label: 'Edit settings' },
  { group: 'Admin',     key: 'users.manage',     label: 'Manage admin users' },
]

// Default permissions per role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner:   ['all'],
  manager: ['orders.view','orders.edit','orders.fulfill','returns.view','returns.edit','products.view','products.create','products.edit','products.delete','inventory.view','inventory.edit','customers.view','discounts.view','discounts.edit','analytics.view'],
  editor:  ['orders.view','orders.edit','orders.fulfill','returns.view','products.view','products.create','products.edit','inventory.view','inventory.edit'],
  viewer:  ['orders.view','products.view','customers.view','analytics.view','inventory.view'],
}

// Group permissions by category
const permissionGroups = ALL_PERMISSIONS.reduce((acc, perm) => {
  if (!acc[perm.group]) acc[perm.group] = []
  acc[perm.group].push(perm)
  return acc
}, {} as Record<string, typeof ALL_PERMISSIONS>)

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'add' | 'edit' | null>(null)
  const [editing,  setEditing]  = useState<any>(null)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name:        '',
    email:       '',
    password:    '',
    role:        'editor' as keyof typeof ROLES,
    permissions: ROLE_PERMISSIONS['editor'],
    isActive:    true,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const d   = await res.json()
      setUsers(d.users ?? [])
    } catch { setUsers([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // When role changes, auto-set permissions
  const handleRoleChange = (role: keyof typeof ROLES) => {
    setForm(p => ({
      ...p,
      role,
      permissions: ROLE_PERMISSIONS[role] ?? [],
    }))
  }

  const togglePermission = (key: string) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(key)
        ? p.permissions.filter(pk => pk !== key)
        : [...p.permissions, key],
    }))
  }

  const openAdd = () => {
    setForm({ name: '', email: '', password: '', role: 'editor', permissions: ROLE_PERMISSIONS['editor'], isActive: true })
    setError('')
    setShowPass(false)
    setModal('add')
  }

  const openEdit = (user: any) => {
    setEditing(user)
    setForm({
      name:        user.name,
      email:       user.email,
      password:    '',
      role:        user.role,
      permissions: user.permissions ?? ROLE_PERMISSIONS[user.role] ?? [],
      isActive:    user.isActive,
    })
    setError('')
    setShowPass(false)
    setModal('edit')
  }

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return }
    if (modal === 'add' && !form.password)        { setError('Password is required'); return }
    if (form.password && form.password.length < 8){ setError('Password must be at least 8 characters'); return }

    setSaving(true); setError('')

    try {
      const method  = modal === 'add' ? 'POST' : 'PATCH'
      const payload = modal === 'add'
        ? { name: form.name, email: form.email, password: form.password, role: form.role, permissions: form.permissions }
        : { id: editing.id, name: form.name, role: form.role, permissions: form.permissions, isActive: form.isActive, ...(form.password ? { newPassword: form.password } : {}) }

      const res  = await fetch('/api/admin/users', {
        method, headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save'); setSaving(false); return }

      await load()
      setModal(null)
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)
  }

  const deleteUser = async (id: string) => {
    await fetch('/api/admin/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ id }),
    })
    setDeleteConfirm(null)
    await load()
  }

  const toggleActive = async (user: any) => {
    await fetch('/api/admin/users', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ id: user.id, isActive: !user.isActive }),
    })
    await load()
  }

  const fmtDate = (d: string) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never'

  // ── INPUT STYLES ──────────────────────────────────────────────
  const inp = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#1a1a1a] transition-colors bg-white"
  const lbl = "block text-[11px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5"

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Admin Users</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Manage who has access to the admin panel</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800 transition-colors">
          <Plus size={14} /> Add Admin User
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(ROLES).map(([key, role]) => (
          <div key={key} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${role.color}`}>
                {role.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Owner row (from .env) */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">Owner Account (from .env.local)</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[13px] font-bold shrink-0">
            O
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1a1a1a]">Owner</p>
            <p className="text-[12px] text-gray-400">{process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'Configured in .env.local'}</p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1a1a1a] text-white">OWNER</span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">ACTIVE</span>
          <div className="text-[11px] text-gray-400 text-right shrink-0">
            <p>Full access</p>
            <p>All permissions</p>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[13px] text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-3" />
            <p className="text-[14px] text-gray-400 mb-1">No admin users yet</p>
            <p className="text-[12px] text-gray-300 mb-4">Add team members to help manage your store</p>
            <button onClick={openAdd}
              className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-medium rounded-lg border-none cursor-pointer hover:bg-gray-800">
              Add First User
            </button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Role', 'Permissions', 'Last Login', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-500 tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => {
                const role = ROLES[user.role as keyof typeof ROLES] ?? ROLES.viewer
                return (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[12px] font-bold text-[#1a1a1a] shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#1a1a1a]">{user.name}</p>
                          <p className="text-[11px] text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${role.color}`}>
                        {role.label}
                      </span>
                    </td>

                    {/* Permissions count */}
                    <td className="px-4 py-3">
                      {user.permissions?.includes('all') ? (
                        <span className="text-[12px] text-[#4a6741] font-medium">All permissions</span>
                      ) : (
                        <span className="text-[12px] text-gray-500">{user.permissions?.length ?? 0} permissions</span>
                      )}
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                        <Clock size={11} strokeWidth={1.5} />
                        {fmtDate(user.lastLogin)}
                      </div>
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(user)}
                        className="flex items-center gap-1.5 text-[12px] cursor-pointer bg-transparent border-none">
                        {user.isActive
                          ? <><ToggleRight size={20} className="text-[#4a6741]" /><span className="text-[#4a6741] font-medium">Active</span></>
                          : <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-400">Inactive</span></>
                        }
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(user)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1a1a1a] bg-transparent border-none cursor-pointer transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm(user.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 bg-transparent border-none cursor-pointer transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-[16px] font-semibold text-[#1a1a1a]">
                  {modal === 'add' ? 'Add Admin User' : `Edit — ${editing?.name}`}
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {modal === 'add' ? 'Create a new admin account with role-based access' : 'Update this user\'s role, permissions, and access'}
                </p>
              </div>
              <button onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[12px]">
                  {error}
                </div>
              )}

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="John Smith" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Email Address</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    disabled={modal === 'edit'}
                    placeholder="john@example.com"
                    className={`${inp} ${modal === 'edit' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={lbl}>
                  {modal === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <div className="relative">
                  <Key size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder={modal === 'add' ? 'Min. 8 characters' : 'Leave blank to keep current'}
                    className={`${inp} pl-9 pr-10`}
                  />
                  <button onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className={lbl}>Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(ROLES).filter(([key]) => key !== 'owner').map(([key, role]) => (
                    <button key={key}
                      onClick={() => handleRoleChange(key as keyof typeof ROLES)}
                      className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 cursor-pointer text-left transition-all bg-white
                        ${form.role === key ? 'border-[#1a1a1a]' : 'border-gray-200 hover:border-gray-400'}`}>
                      <div className="flex items-center gap-1.5">
                        <role.icon size={13} strokeWidth={1.5} className={form.role === key ? 'text-[#1a1a1a]' : 'text-gray-400'} />
                        <span className={`text-[12px] font-semibold ${form.role === key ? 'text-[#1a1a1a]' : 'text-gray-600'}`}>
                          {role.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions — grouped */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={lbl + ' mb-0'}>Permissions</label>
                  <div className="flex gap-2">
                    <button onClick={() => setForm(p => ({ ...p, permissions: ALL_PERMISSIONS.map(p => p.key) }))}
                      className="text-[11px] text-[#1a1a1a] underline hover:no-underline bg-transparent border-none cursor-pointer">
                      Select all
                    </button>
                    <span className="text-gray-300">·</span>
                    <button onClick={() => setForm(p => ({ ...p, permissions: [] }))}
                      className="text-[11px] text-gray-500 underline hover:no-underline bg-transparent border-none cursor-pointer">
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {Object.entries(permissionGroups).map(([group, perms], groupIdx) => (
                    <div key={group} className={`${groupIdx > 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="px-4 py-2 bg-gray-50">
                        <p className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">{group}</p>
                      </div>
                      <div className="px-4 py-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {perms.map(perm => (
                          <label key={perm.key} className="flex items-center gap-2.5 cursor-pointer py-0.5">
                            <div
                              onClick={() => togglePermission(perm.key)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors
                                ${form.permissions.includes(perm.key)
                                  ? 'bg-[#1a1a1a] border-[#1a1a1a]'
                                  : 'border-gray-300 bg-white hover:border-gray-500'}`}>
                              {form.permissions.includes(perm.key) && (
                                <Check size={10} strokeWidth={3} className="text-white" />
                              )}
                            </div>
                            <span className="text-[12px] text-gray-700">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {form.permissions.length} of {ALL_PERMISSIONS.length} permissions selected
                </p>
              </div>

              {/* Status toggle for edit */}
              {modal === 'edit' && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[13px] font-medium text-[#1a1a1a]">Account Status</p>
                    <p className="text-[12px] text-gray-500">Inactive users cannot log in to the admin panel</p>
                  </div>
                  <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                    className="flex items-center gap-2 bg-transparent border-none cursor-pointer">
                    {form.isActive
                      ? <><ToggleRight size={28} className="text-[#4a6741]" /><span className="text-[13px] text-[#4a6741] font-medium">Active</span></>
                      : <><ToggleLeft size={28} className="text-gray-400" /><span className="text-[13px] text-gray-400">Inactive</span></>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-300 text-[13px] text-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 bg-white transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 bg-[#1a1a1a] text-white text-[13px] font-medium rounded-xl border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                <Save size={14} />
                {saving ? 'Saving...' : modal === 'add' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] text-center mb-1">Delete Admin User</h2>
            <p className="text-[13px] text-gray-500 text-center mb-5">
              This user will immediately lose access to the admin panel. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 text-[13px] text-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 bg-white">
                Cancel
              </button>
              <button onClick={() => deleteUser(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white text-[13px] font-medium rounded-xl border-none cursor-pointer hover:bg-red-700">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}