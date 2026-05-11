"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Users, Package, LogOut, Trash2, Plus } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sims, setSims] = useState([]);
  const [activeTab, setActiveTab] = useState("sims");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSim, setNewSim] = useState({
    sim_number: "",
    network: "Viettel",
    price: "",
    category: "",
    feng_shui_element: "Kim",
    total_nodes: 5
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "admin") {
      router.push("/");
      return;
    }

    setUser(parsedUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, simsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/sims")
      ]);

      setUsers(usersRes.data.data);
      setSims(simsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleAddSim = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/sims", newSim);
      alert("Thêm sim thành công!");
      setShowAddForm(false);
      setNewSim({
        sim_number: "",
        network: "Viettel",
        price: "",
        category: "",
        feng_shui_element: "Kim",
        total_nodes: 5
      });
      fetchData();
    } catch (error) {
      alert("Lỗi khi thêm sim");
    }
  };

  const handleDeleteSim = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sim này?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/sims/${id}`);
      alert("Xóa sim thành công!");
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa sim");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-dark-lighter border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Xin chào, <span className="font-semibold">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("sims")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "sims"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Package className="w-5 h-5" />
            Quản lý Sim ({sims.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Users className="w-5 h-5" />
            Quản lý User ({users.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "sims" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Danh sách Sim</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Thêm Sim
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white dark:bg-dark-lighter rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Thêm Sim Mới</h3>
                <form onSubmit={handleAddSim} className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Số sim"
                    value={newSim.sim_number}
                    onChange={(e) => setNewSim({...newSim, sim_number: e.target.value})}
                    required
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  />
                  <select
                    value={newSim.network}
                    onChange={(e) => setNewSim({...newSim, network: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  >
                    <option>Viettel</option>
                    <option>Vinaphone</option>
                    <option>Mobifone</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Giá"
                    value={newSim.price}
                    onChange={(e) => setNewSim({...newSim, price: e.target.value})}
                    required
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Loại sim"
                    value={newSim.category}
                    onChange={(e) => setNewSim({...newSim, category: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  />
                  <select
                    value={newSim.feng_shui_element}
                    onChange={(e) => setNewSim({...newSim, feng_shui_element: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  >
                    <option>Kim</option>
                    <option>Mộc</option>
                    <option>Thủy</option>
                    <option>Hỏa</option>
                    <option>Thổ</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Điểm nút (1-10)"
                    value={newSim.total_nodes}
                    onChange={(e) => setNewSim({...newSim, total_nodes: e.target.value})}
                    min="1"
                    max="10"
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="col-span-2 bg-primary hover:bg-primary-hover text-white py-2 rounded-lg font-semibold"
                  >
                    Thêm Sim
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số Sim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhà mạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sims.map((sim) => (
                    <tr key={sim.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{sim.sim_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{sim.network}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{sim.price.toLocaleString()} đ</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{sim.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSim(sim.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Danh sách User</h2>
            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SĐT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vai trò</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{u.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
