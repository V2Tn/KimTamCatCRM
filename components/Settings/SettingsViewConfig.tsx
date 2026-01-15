import React from 'react';

interface ApiLog {
  id: string;
  method: 'GET' | 'POST' | 'LOCAL';
  url: string;
  action: string;
  status: 'pending' | 'success' | 'error';
  timestamp: string;
  details?: string;
  rawResponse?: string;
}

interface SettingsViewConfigProps {
  localReadUrl: string;
  setLocalReadUrl: (val: string) => void;
  localWriteUrl: string;
  setLocalWriteUrl: (val: string) => void;
  isSaving: boolean;
  apiLogs: ApiLog[];
  setApiLogs: (logs: ApiLog[]) => void;
}

export const SettingsViewConfig: React.FC<SettingsViewConfigProps> = ({ 
  localReadUrl, setLocalReadUrl, localWriteUrl, setLocalWriteUrl, isSaving, apiLogs, setApiLogs 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-800">Kết nối Make.com</h3>
              <p className="text-xs text-slate-400 font-medium">Hệ thống sẽ tự động lưu khi bạn nhập link</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {isSaving ? 'ĐANG LƯU...' : 'ĐÃ LƯU TỰ ĐỘNG'}
              </span>
            </div>
          </div>
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] ml-1">Webhook URL (Ghi - POST)</label>
              <input type="text" value={localWriteUrl} onChange={e => setLocalWriteUrl(e.target.value)} placeholder="Dán link webhook ghi vào đây..." className="w-full px-6 py-4 rounded-2xl border bg-slate-50 text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] ml-1">Webhook URL (Đọc - GET)</label>
              <input type="text" value={localReadUrl} onChange={e => setLocalReadUrl(e.target.value)} placeholder="Dán link webhook đọc vào đây..." className="w-full px-6 py-4 rounded-2xl border bg-slate-50 text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-mono" />
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">💡 <b>Mẹo:</b> Link Webhook được lưu an toàn trong trình duyệt của bạn. Mọi thay đổi đều được cập nhật tức thì.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Hệ thống Logs (Gỡ lỗi)</h3>
            <button onClick={() => setApiLogs([])} className="text-[9px] font-black text-slate-400 hover:text-red-500 transition-all">Xóa lịch sử</button>
          </div>
          <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl h-[550px] overflow-y-auto font-mono text-[10px] border border-slate-800 custom-scrollbar">
            {apiLogs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-700 italic opacity-50">Sẵn sàng lắng nghe hoạt động...</div>
            ) : (
              <div className="space-y-6">
                {apiLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-slate-700 pl-4 py-1 relative">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-500 font-bold">{log.timestamp}</span>
                      <span className={`font-black px-2 py-0.5 rounded text-[8px] ${log.method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' : log.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>{log.method}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : log.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{log.status}</span>
                    </div>
                    <p className="text-white font-bold mb-2 tracking-tight uppercase text-[9px]">{log.action}</p>
                    {log.details && (
                      <div className="mt-2 space-y-1">
                        <p className="text-slate-500 text-[8px] font-black uppercase">Dữ liệu liên quan:</p>
                        <div className="p-3 bg-black/40 rounded-xl text-indigo-300 text-[8px] leading-relaxed border border-white/5 overflow-x-auto"><pre>{log.details}</pre></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};