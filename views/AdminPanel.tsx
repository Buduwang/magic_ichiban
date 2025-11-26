import React, { useState } from 'react';
import { Prize, PrizeTier, THEME_COLORS, Theme } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, RotateCcw, Save, X, Lock, Upload } from 'lucide-react';

interface AdminPanelProps {
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  theme: Theme;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ prizes, setPrizes, theme, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Prize>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const colors = THEME_COLORS[theme];

  // Simple auth for demo purposes
  const handleLogin = () => {
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password (try 'admin')");
    }
  };

  const handleUpdate = (id: string) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, ...editForm } as Prize : p));
    setEditingId(null);
    setEditForm({});
  };

  const startEdit = (prize: Prize) => {
    setEditingId(prize.id);
    setEditForm({ ...prize });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this prize?")) {
      setPrizes(prizes.filter(p => p.id !== id));
    }
  };

  const handleAdd = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: "New Prize",
      nameCN: "新奖品",
      tier: PrizeTier.C,
      totalQuantity: 10,
      remainingQuantity: 10,
      image: "🎁"
    };
    setPrizes([...prizes, newPrize]);
    startEdit(newPrize);
  };

  const handleResetAll = () => {
    if (confirm("Reset all quantities to full? This cannot be undone.")) {
      setPrizes(prizes.map(p => ({ ...p, remainingQuantity: p.totalQuantity })));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Limit size to prevent localStorage quota exceeded errors (approx 500KB)
        if (file.size > 500 * 1024) {
            alert("Image is too large! Please upload an image smaller than 500KB.");
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditForm(prev => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const isImage = (str?: string) => {
      return str && (str.startsWith('data:') || str.startsWith('http'));
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-gray-800">
           <div className="flex justify-center mb-4">
             <Lock className="w-12 h-12 text-gray-400" />
           </div>
           <h2 className="text-2xl font-bold text-center mb-6">Teacher Access / 教师通道</h2>
           <input 
             type="password" 
             className="w-full border-2 border-gray-300 p-3 rounded-lg mb-4 text-lg focus:border-blue-500 outline-none"
             placeholder="Password (admin)"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
           />
           <div className="flex gap-2">
             <button onClick={onClose} className="flex-1 py-3 rounded-lg font-bold bg-gray-200 hover:bg-gray-300 transition">Cancel</button>
             <button onClick={handleLogin} className="flex-1 py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition">Login</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100 text-gray-900">
      {/* Admin Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management 📦</h2>
          <p className="text-sm text-gray-500">Manage prizes and stock levels</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAdd} 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} /> Add Prize
          </button>
          <button 
            onClick={handleResetAll} 
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <RotateCcw size={18} /> Reset Stock
          </button>
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            <X size={18} /> Close
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-700">Stock Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prizes}>
                <XAxis dataKey="name" stroke="#8884d8" fontSize={12} tickFormatter={(val) => val.substring(0, 10)} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="remainingQuantity" name="Remaining" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {prizes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.remainingQuantity < 3 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 w-32 text-center">Image</th>
                <th className="p-4 font-semibold text-gray-600">Name (EN)</th>
                <th className="p-4 font-semibold text-gray-600">Name (CN)</th>
                <th className="p-4 font-semibold text-gray-600">Tier</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Stock (Rem/Tot)</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prizes.map((prize) => (
                <tr key={prize.id} className="hover:bg-gray-50 group">
                  {editingId === prize.id ? (
                    <>
                       <td className="p-4">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden relative">
                                {isImage(editForm.image) ? (
                                    <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl">{editForm.image}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 w-full justify-center">
                                <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded transition-colors" title="Upload Image">
                                    <Upload size={16} />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                                <input 
                                    className="w-16 border rounded p-1 text-center text-sm" 
                                    placeholder="Emoji"
                                    value={isImage(editForm.image) ? '' : editForm.image} 
                                    onChange={e => setEditForm({...editForm, image: e.target.value})}
                                    title="Type emoji or text here" 
                                />
                            </div>
                         </div>
                       </td>
                       <td className="p-4 align-top pt-6"><input className="w-full border rounded p-2" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                       <td className="p-4 align-top pt-6"><input className="w-full border rounded p-2" value={editForm.nameCN} onChange={e => setEditForm({...editForm, nameCN: e.target.value})} /></td>
                       <td className="p-4 align-top pt-6">
                         <select className="border rounded p-2 w-full" value={editForm.tier} onChange={e => setEditForm({...editForm, tier: e.target.value as PrizeTier})}>
                           {Object.values(PrizeTier).map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                       </td>
                       <td className="p-4 text-center align-top pt-6">
                         <div className="flex items-center justify-center gap-2">
                           <input type="number" className="w-16 border rounded p-1 text-center" value={editForm.remainingQuantity} onChange={e => setEditForm({...editForm, remainingQuantity: parseInt(e.target.value)})} />
                           <span>/</span>
                           <input type="number" className="w-16 border rounded p-1 text-center" value={editForm.totalQuantity} onChange={e => setEditForm({...editForm, totalQuantity: parseInt(e.target.value)})} />
                         </div>
                       </td>
                       <td className="p-4 text-right align-top pt-6">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdate(prize.id)} className="text-green-600 hover:bg-green-100 p-2 rounded"><Save size={20} /></button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-100 p-2 rounded"><X size={20} /></button>
                         </div>
                       </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-center">
                          <div className="w-14 h-14 mx-auto bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden text-3xl">
                            {isImage(prize.image) ? (
                                <img src={prize.image} alt={prize.name} className="w-full h-full object-cover" />
                            ) : (
                                prize.image
                            )}
                          </div>
                      </td>
                      <td className="p-4 font-medium text-lg">{prize.name}</td>
                      <td className="p-4 text-gray-600 text-lg">{prize.nameCN}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${prize.tier === 'S' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{prize.tier}</span></td>
                      <td className="p-4 text-center">
                        <span className={`font-bold text-lg ${prize.remainingQuantity === 0 ? 'text-red-500' : 'text-gray-800'}`}>{prize.remainingQuantity}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-500">{prize.totalQuantity}</span>
                      </td>
                      <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(prize)} className="text-blue-600 hover:bg-blue-100 p-2 rounded mr-2">Edit</button>
                        <button onClick={() => handleDelete(prize.id)} className="text-red-600 hover:bg-red-100 p-2 rounded"><Trash2 size={18} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;