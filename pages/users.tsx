import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import {
  Menu,
  Users,
  Search,
  Plus,
  X,
  Shield,
  GraduationCap,
  UserCheck,
  Mail,
  MoreVertical,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "Admin" | "Faculty" | "Student";
  status?: "active" | "inactive";
  joinedDate: string;
};

const UsersPage = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Only Admin can access this page
  if (user?.role !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@gmail.com",
      role: "Admin",
      status: "active",
      joinedDate: "2024-01-01",
    },
  ]);

  // fetch users on mount
  useEffect(() => {
    fetch("/api/users", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) setUsers(data.users);
      })
      .catch(() => {
        // keep static users on failure
      });
  }, []);

  // Add User modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Student",
    status: "active",
    password: "",
    joinedDate: new Date().toISOString(),
    confirmPassword: "",
  });

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewUser({
      name: "",
      email: "",
      role: "Student",
      status: "active",
      joinedDate: new Date().toISOString(),
      password: "",
      confirmPassword: "",
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // simple client-side validation for password
    if (!newUser.password || newUser.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // map frontend roles to backend enum values
    const roleMap: Record<string, string> = {
      Admin: "admin",
      Faculty: "user",
      Student: "guest",
    };

    const payload = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role.toLowerCase(),
      password: newUser.password,
      joinedDate: new Date().toISOString(),
    } as any;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUsers((prev) => [data.user, ...prev]);
        closeAddModal();
      } else {
        console.error("Failed to add user", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (u: User) => {
    setEditUser(u);
    setShowEditModal(true);
    setOpenActionId(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    const id = (editUser as any)._id || editUser.id;
    if (!id) return;

    const payload = {
      id,
      name: editUser.name,
      email: editUser.email,
      role: editUser.role.toLowerCase(),
      Status: editUser.status ?? "active",
    } as any;

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUsers((prev) =>
          prev.map((u) => (((u as any)._id || u.id) === id ? data.user : u)),
        );
        closeEditModal();
      } else {
        console.error("Failed to update user", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (u: User) => {
    const id = (u as any)._id || u.id;
    if (!id) return;
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((x) => ((x as any)._id || x.id) !== id));
      } else {
        console.error("Failed to delete user", data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    // This is where you would fetch users from an API
    // For now, we are using static data defined above
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Shield className="text-red-500" size={20} />;
      case "Faculty":
        return <UserCheck className="text-blue-500" size={20} />;
      case "Student":
        return <GraduationCap className="text-green-500" size={20} />;
      default:
        return <Users className="text-gray-500" size={20} />;
    }
  };

  return (
    <>
      <Head>
        <title>Users Management | LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 
  transform transition-transform duration-300 
  lg:relative lg:translate-x-0 
  bg-white dark:bg-gray-900
  h-screen overflow-y-auto overflow-x-hidden
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-orange-500">Users</span>
            <div className="w-8" />
          </div>

          <TabBar />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  User Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage all system users, roles, and permissions
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
                Add User
              </button>
            </div>

            {showAddModal && (
              <div className="mb-6">
                <form
                  onSubmit={handleAddUser}
                  className="bg-white dark:bg-gray-900 rounded-lg border p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Add New User
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      required
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="Full name"
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    />
                    <input
                      required
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Email"
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as
                            | "Admin"
                            | "Faculty"
                            | "Student",
                        })
                      }
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    >
                      <option>Student</option>
                      <option>Faculty</option>
                      <option>Admin</option>
                    </select>
                    <input
                      required
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Password"
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input
                      required
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm password"
                      className="px-3 py-2 rounded border dark:bg-gray-800"
                    />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </label>
                      <select
                        value={newUser.status}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            status: e.target.value as "active" | "inactive",
                          })
                        }
                        className="px-3 py-2 rounded border dark:bg-gray-800"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-orange-500 text-white"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showEditModal && editUser && (
              <div className="mb-6">
                <form
                  onSubmit={handleUpdateUser}
                  className="bg-white dark:bg-gray-900 rounded-lg border p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Edit User
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      required
                      value={editUser.name}
                      onChange={(e) =>
                        setEditUser({
                          ...(editUser as User),
                          name: e.target.value,
                        })
                      }
                      placeholder="Full name"
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    />
                    <input
                      required
                      type="email"
                      value={editUser.email}
                      onChange={(e) =>
                        setEditUser({
                          ...(editUser as User),
                          email: e.target.value,
                        })
                      }
                      placeholder="Email"
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    />
                    <select
                      value={editUser.role}
                      onChange={(e) =>
                        setEditUser({
                          ...(editUser as User),
                          role: e.target.value as
                            | "Admin"
                            | "Faculty"
                            | "Student",
                        })
                      }
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    >
                      <option>Student</option>
                      <option>Faculty</option>
                      <option>Admin</option>
                    </select>
                    <select
                      value={editUser.status ?? "active"}
                      onChange={(e) =>
                        setEditUser({
                          ...(editUser as User),
                          status: e.target.value as "active" | "inactive",
                        })
                      }
                      className="col-span-1 md:col-span-1 px-3 py-2 rounded border dark:bg-gray-800"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-orange-500 text-white"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mb-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Users className="text-orange-500" size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {u.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail size={12} />
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(u.role)}
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {u.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              u.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(u.joinedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => {
                                const id = (u as any)._id || u.id || "";
                                setOpenActionId(
                                  openActionId === id ? null : id,
                                );
                              }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openActionId === ((u as any)._id || u.id) && (
                              <div className="absolute flex   right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UsersPage;
