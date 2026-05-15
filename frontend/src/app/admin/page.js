"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Users, Package, Trash2, Plus, ShoppingCart, Sparkles, Search, MessageSquare } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [sims, setSims] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [fengshuiHistory, setFengshuiHistory] = useState([]);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("sims");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSim, setNewSim] = useState({
    sim_number: "",
    network: "Viettel",
    price: "",
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
      const [usersRes, simsRes, purchasesRes, fengshuiRes, recommendationRes, messagesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/sims"),
        axios.get("http://localhost:5000/api/admin/purchases"),
        axios.get("http://localhost:5000/api/admin/fengshui-history"),
        axios.get("http://localhost:5000/api/admin/recommendation-history"),
        axios.get("http://localhost:5000/api/admin/messages")
      ]);

      setUsers(usersRes.data.data);
      setSims(simsRes.data.data);
      setPurchases(purchasesRes.data.data);
      setFengshuiHistory(fengshuiRes.data.data);
      setRecommendationHistory(recommendationRes.data.data);
      setMessages(messagesRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddSim = async (e) => {
    e.preventDefault();
    try {
      // Tự động tạo category
      const simData = {
        ...newSim,
        category: "Sim số đẹp"
      };
      
      await axios.post("http://localhost:5000/api/admin/sims", simData);
      alert("Thêm sim thành công!");
      setShowAddForm(false);
      setNewSim({
        sim_number: "",
        network: "Viettel",
        price: "",
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
            <span className="text-gray-600 dark:text-gray-400">
              Xin chào, <span className="font-semibold">{user.name}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("sims")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Users className="w-5 h-5" />
            Quản lý User ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "purchases"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Lịch sử mua sim ({purchases.length})
          </button>
          <button
            onClick={() => setActiveTab("fengshui")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "fengshui"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Lịch sử phong thủy ({fengshuiHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "recommendations"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <Search className="w-5 h-5" />
            Lịch sử phân tích ({recommendationHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === "messages"
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-lighter text-gray-700 dark:text-gray-300"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Tin nhắn liên hệ ({messages.filter(m => m.status === 'Chưa đọc').length})
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
                    placeholder="Giá (VNĐ)"
                    value={newSim.price}
                    onChange={(e) => setNewSim({...newSim, price: e.target.value})}
                    required
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  />
                  <select
                    value={newSim.feng_shui_element}
                    onChange={(e) => setNewSim({...newSim, feng_shui_element: e.target.value})}
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white"
                  >
                    <option value="Kim">Mệnh Kim</option>
                    <option value="Mộc">Mệnh Mộc</option>
                    <option value="Thủy">Mệnh Thủy</option>
                    <option value="Hỏa">Mệnh Hỏa</option>
                    <option value="Thổ">Mệnh Thổ</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Điểm nút (1-10)"
                    value={newSim.total_nodes}
                    onChange={(e) => setNewSim({...newSim, total_nodes: e.target.value})}
                    min="1"
                    max="10"
                    required
                    className="px-4 py-2 border rounded-lg dark:bg-dark dark:border-gray-600 dark:text-white col-span-2"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mệnh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Điểm nút</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sims.map((sim) => (
                    <tr key={sim.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{sim.sim_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{sim.network}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{Number(sim.price).toLocaleString('vi-VN')} đ</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-400 rounded-full font-semibold text-sm">
                          {sim.feng_shui_element}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
                          {sim.total_nodes}/10
                        </span>
                      </td>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{u.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử mua Sim</h2>
            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tài khoản</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số Sim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhà mạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên KH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SĐT KH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Địa chỉ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thanh toán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày mua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{purchase.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{purchase.sim_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{purchase.network}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{Number(purchase.price).toLocaleString('vi-VN')} đ</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{purchase.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{purchase.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{purchase.customer_phone}</td>
                      <td className="px-6 py-4 dark:text-white max-w-xs truncate" title={purchase.customer_address}>
                        {purchase.customer_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          purchase.payment_method === 'bank_transfer' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {purchase.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(purchase.purchase_date).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {purchases.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử mua sim
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "fengshui" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử xem Phong Thủy</h2>
            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Người xem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giờ sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Giới tính</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại lịch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mệnh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số may mắn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fengshuiHistory.map((history) => (
                    <tr key={history.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{history.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(history.birth_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">{history.birth_time || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.gender === 'male' ? 'Nam' : 'Nữ'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.calendar_type === 'solar' ? 'Dương lịch' : 'Âm lịch'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                          {history.element}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">{history.lucky_numbers}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(history.view_date).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fengshuiHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử xem phong thủy
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Lịch sử phân tích nhu cầu AI</h2>
            <div className="bg-white dark:bg-dark-lighter rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày sinh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số yêu thích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngân sách</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nhà mạng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mục đích</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kết quả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày tìm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recommendationHistory.map((history) => (
                    <tr key={history.id}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-semibold">{history.user_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.birth_date ? new Date(history.birth_date).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white font-mono">
                        {history.lucky_numbers || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.price_limit ? Number(history.price_limit).toLocaleString('vi-VN') + ' đ' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {history.expected_network || 'Tất cả'}
                      </td>
                      <td className="px-6 py-4 dark:text-white max-w-xs truncate" title={history.purpose}>
                        {history.purpose || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                          {history.result_count} sim
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(history.search_date).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recommendationHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có lịch sử phân tích nhu cầu
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Tin nhắn liên hệ từ khách hàng</h2>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`bg-white dark:bg-dark-lighter rounded-xl p-6 border-2 ${
                    msg.status === 'Chưa đọc' 
                      ? 'border-primary shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold dark:text-white">{msg.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>📞 {msg.phone}</span>
                        {msg.email && <span>✉️ {msg.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        msg.status === 'Chưa đọc'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {msg.status}
                      </span>
                      {msg.status === 'Chưa đọc' && (
                        <button
                          onClick={async () => {
                            try {
                              await axios.put(`http://localhost:5000/api/admin/messages/${msg.id}`, {
                                status: 'Đã đọc'
                              });
                              fetchData();
                            } catch (error) {
                              console.error('Error updating message:', error);
                            }
                          }}
                          className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(msg.created_at).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Chưa có tin nhắn liên hệ nào
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
