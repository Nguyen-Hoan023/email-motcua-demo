// GIAO DIỆN SINH VIÊN

import React, { useState } from 'react';
import {
  ArrowLeft, Plus,
  List, FileText, Info, X, AlertCircle, RefreshCw, ChevronRight,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import { ASSETS, SKYLINE_SVG } from '../constants/assets';
import { STATUS_MAP } from '../constants/statusMap';

const StudentApp = ({ db, user, sysAPI }) => {
  const [view, setView] = useState('REQUEST_LIST');
  const [reqType, setReqType] = useState('Tài khoản Email');
  const [files, setFiles] = useState([]);
  const [modalReqId, setModalReqId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [resubmitFiles, setResubmitFiles] = useState([]);


  // Xử lý thêm file minh chứng khi sinh viên upload — lưu File object thật.
  const handleFileChange = (e) => {
    if (e.target.files.length) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Xóa file khỏi danh sách minh chứng đã chọn.
  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };
  // Xử lý upload file bổ sung khi hồ sơ bị yêu cầu chỉnh sửa — lưu File object thật.
  const handleResubmitFileChange = (e) => {
    if (e.target.files.length) {
      const newFiles = Array.from(e.target.files);
      setResubmitFiles((prev) => [...prev, ...newFiles]);
    }
  };
  // Xóa một file khỏi danh sách bổ sung.
  const removeResubmitFile = (fileName) => {
    setResubmitFiles((prev) => prev.filter((f) => f.name !== fileName));
  };
  // Gửi yêu cầu mới lên hệ thống và hiển thị thông báo kết quả.
  const handleSubmit = async () => {
    await sysAPI.createRequest(reqType, files);
    setFiles([]);
    setView('REQUEST_LIST');
    setToastMsg('Đã gửi yêu cầu thành công!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const modalReq = modalReqId ? db.YeuCauDichVu.find((r) => String(r.id) === String(modalReqId)) : null;
  const phanHoiArr = modalReqId ? db.PhanHoiYeuCau.filter((ph) => String(ph.reqId) === String(modalReqId)) : [];
  const lastPh = phanHoiArr.length > 0 ? phanHoiArr[phanHoiArr.length - 1] : null;
  const myRequests = db.YeuCauDichVu.filter((req) => String(req.studentId) === String(user.id));

  // Chuyển chuỗi ngày giờ sang đối tượng Date để xử lý thời gian.
  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split(/[\s/:]+/);
    if (parts.length >= 5) {
      const [dd, MM, yyyy, HH, mm] = parts.map(Number);
      return new Date(yyyy, MM - 1, dd, HH, mm);
    }
    return new Date();
  };
  // Cộng thêm số ngày vào thời gian hiện tại và format lại chuỗi ngày.
  const formatWithOffset = (baseDate, addDays) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + addDays);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  let reqCreatedAt = '';
  let confirmedDateStr = '';
  let startReturnStr = '';
  let endReturnStr = '';

  if (modalReq) {
    reqCreatedAt = modalReq.createdAt;

    // Chỉ tính toán ngày hẹn trả nếu hồ sơ đã được tiếp nhận.
    if (modalReq.status >= 2) {
      const baseDate = parseDateString(modalReq.createdAt);
      const logs = db.LogYeuCau.filter((l) => String(l.reqId) === String(modalReqId));
      const processLog = logs.find((l) =>
        l.action.includes('Tiếp nhận') || l.action.includes('xử lý')
      );

      confirmedDateStr = processLog ? processLog.time : formatWithOffset(baseDate, 1);
      const confirmedDateObj = parseDateString(confirmedDateStr);
      startReturnStr = formatWithOffset(confirmedDateObj, 5);
      const startReturnDateObj = parseDateString(startReturnStr);
      endReturnStr = formatWithOffset(startReturnDateObj, 10);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      <AppHeader />
      <Toast message={toastMsg} />

      <main className="max-w-6xl mx-auto mt-6 w-full mb-32 border border-gray-200 rounded-t-lg shadow-sm">
        <div className="flex gap-6 border-b px-6 py-3 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer">
            <List size={18} /> Dịch vụ
          </div>
          <div className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <FileText size={18} /> Hóa đơn
          </div>
        </div>

        <div className="relative h-40 bg-gray-800 overflow-hidden">
          <img
            src={ASSETS.images.banners.studentBackground}
            alt="Banner"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay grayscale"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-white text-3xl font-bold uppercase tracking-wide border-b-2 border-white pb-2 px-12">
              Hệ thống đăng ký thủ tục hành chính một cửa
            </h2>
            <h3 className="text-white text-4xl font-black uppercase mt-2 opacity-80 tracking-[0.2em]">
              DỊCH VỤ
            </h3>
          </div>
        </div>

        <div className="px-10 pb-4 relative -mt-12 flex items-end gap-4">
          <div className="bg-white p-1 rounded-full shadow-md z-10">
            <img
              src={ASSETS.images.avatars.default}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-white bg-blue-50 object-cover"
            />
          </div>
          <div className="mb-2 bg-white/90 px-4 py-1.5 rounded shadow-sm">
            <p className="text-sm">
              <span className="font-bold uppercase text-[#1e3a8a]">{user.name}</span>
              <span className="text-gray-500 mx-1">MSSV: {user.id}</span>
            </p>
            <button className="bg-[#10b981] text-white px-3 py-1 rounded text-xs font-bold mt-1.5 hover:bg-green-600">
              Cập nhật hồ sơ
            </button>
          </div>
        </div>

        <div className="px-12 py-8">


          {view === 'FORM' && (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setView('REQUEST_LIST')}
                className="bg-[#2f3c8a] text-white px-4 py-2 rounded text-sm font-bold mb-8 flex items-center gap-2 hover:bg-blue-800"
              >
                <ArrowLeft size={16} /> QUAY LẠI
              </button>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-2 text-sm">
                  Nội dung yêu cầu
                </label>
                <div className="relative">
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm appearance-none"
                  >
                    <option value="Tài khoản Email">Tài khoản Email</option>
                    <option value="Tài khoản Microsoft Office">Tài khoản Microsoft Office</option>
                    <option value="Tài khoản cổng thông tin (sinhvien.huce.edu.vn)">
                      Tài khoản cổng thông tin (sinhvien.huce.edu.vn)
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronRight className="rotate-90" size={16} />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-gray-800 mb-2 text-sm">
                  Minh chứng (nếu có)
                </label>
                <div className="border border-gray-200 rounded bg-white">
                  <input
                    type="file"
                    id="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                    <label
                      htmlFor="file"
                      className="cursor-pointer bg-[#6366f1] text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 hover:bg-indigo-500"
                    >
                      <Plus size={16} /> Chọn file
                    </label>
                    {files.length > 0 && (
                      <button
                        onClick={() => setFiles([])}
                        className="text-red-500 text-sm hover:underline flex items-center gap-1"
                      >
                        <X size={14} /> Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="p-6 text-center text-sm">
                    {files.length > 0 ? (
                      <div className="flex flex-wrap gap-4 justify-center">
                        {files.map((f, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center gap-1 bg-indigo-50 p-2 rounded border border-indigo-100 relative group min-w-[80px]"
                          >
                            <button
                              onClick={() => removeFile(f.name)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hidden group-hover:block shadow"
                            >
                              <X size={12} />
                            </button>
                            <FileText size={24} className="text-indigo-500" />
                            <span
                              className="text-indigo-700 font-medium text-xs max-w-[100px] truncate"
                              title={f.name}
                            >
                              {f.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-600">Kéo thả nhiều file từ máy tính để upload.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSubmit}
                  className="bg-[#2f3c8a] text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-blue-900 transition"
                >
                  GỬI YÊU CẦU
                </button>
              </div>
            </div>
          )}

          {view === 'REQUEST_LIST' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-8">
                <div />
                <button
                  onClick={() => setView('FORM')}
                  className="bg-[#2f3c8a] text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-800 uppercase tracking-wide"
                >
                  Thêm mới
                </button>
              </div>

              <h2 className="text-[#2f3c8a] font-bold text-xl uppercase mb-2">DANH SÁCH YÊU CẦU</h2>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#2f3c8a] text-white text-sm">
                      <th className="py-3 px-4 border-r border-blue-800 w-24 text-center font-semibold">
                        #
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">NỘI DUNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((req, index) => (
                      <tr key={String(req.id)} className="border-b bg-white">
                        <td className="py-4 px-4 text-center border-r text-sm text-gray-700 align-top">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-800 mb-1">{req.serviceName}</div>
                          <div className="text-sm font-medium mb-1 flex items-center gap-1">
                            <span className="text-gray-700">Trạng thái yêu cầu:</span>
                            <span className={`font-bold ${STATUS_MAP[req.status].color}`}>
                              {STATUS_MAP[req.status].label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">Ngày tạo: {req.createdAt}</div>
                          <button
                            onClick={() => setModalReqId(req.id)}
                            className="bg-[#3b82f6] hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition"
                          >
                            <Info size={14} /> Quá trình xử lý
                          </button>
                        </td>
                      </tr>
                    ))}
                    {myRequests.length === 0 && (
                      <tr>
                        <td colSpan="2" className="py-8 text-center text-gray-500 text-sm bg-white">
                          No Available Data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {modalReq && (
        <Modal title="Chi tiết" onClose={() => setModalReqId(null)}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="text-[#1e3a8a] font-bold text-base uppercase">{modalReq.studentName}</div>
              <div className="text-gray-600 text-sm">Thời gian gửi yêu cầu: {modalReq.createdAt}</div>
            </div>
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-700">
              <span>Mã sinh viên: {modalReq.studentId}</span>
              <span className="text-gray-300">|</span>
              <span>
                Trạng thái:{' '}
                <span className={`font-bold ${STATUS_MAP[modalReq.status].color}`}>
                  {STATUS_MAP[modalReq.status].label}
                </span>
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-[#1e3a8a] font-bold text-base uppercase mb-1">NỘI DUNG</h4>
              <p className="text-gray-800 text-sm mb-8">{modalReq.serviceName}</p>

              <div className="relative border-l-2 border-gray-200 ml-2 pl-6 pb-2 space-y-6">
                {/* Step 1: Đang xử lý (Chỉ hiện khi đang thực sự xử lý hoặc đã xong) */}
                {(modalReq.status === 3 || modalReq.status === 5) && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="text-sm text-gray-800">
                      Trạng thái: <span className="font-bold text-[#10b981]">Bộ phận Một cửa đã tiếp nhận</span> =&gt; <span className="font-bold text-[#2563eb]">Đang xử lý</span>
                    </div>
                    <div className="text-xs text-gray-500 italic mt-1">{confirmedDateStr}</div>
                    <div className="border-b border-dashed border-gray-300 w-full ml-0 my-4"></div>
                  </div>
                )}

                {/* Step 2: Tiếp nhận (Chỉ hiện khi đã tiếp nhận và đang tiến triển - KHÔNG HIỆN KHI CẦN BỔ SUNG) */}
                {(modalReq.status === 2 || modalReq.status === 3 || modalReq.status === 5) && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    <div className="text-sm text-gray-800">
                      Trạng thái: <span className="font-bold text-[#f59e0b]">Đã gửi</span> =&gt; <span className="font-bold text-[#10b981]">Bộ phận Một cửa đã tiếp nhận</span>
                    </div>
                    <div className="text-sm text-gray-800 mt-1">
                      Hẹn trả từ ngày: =&gt; <span className="font-bold text-blue-700">{startReturnStr}</span>
                    </div>
                    <div className="text-sm text-gray-800 mt-1">
                      Đến ngày: =&gt; <span className="font-bold text-blue-700">{endReturnStr}</span>
                    </div>
                    <div className="text-xs text-gray-500 italic mt-1">{confirmedDateStr}</div>
                  </div>
                )}
              </div>
            </div>

            {modalReq.status === 4 && lastPh && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                  <AlertCircle size={16} /> Cán bộ yêu cầu bổ sung
                </h4>
                <p className="text-sm text-red-900 mb-4">{lastPh.content}</p>

                {/* Upload file bổ sung */}
                <div className="mb-4 bg-white p-3 rounded border border-red-100">
                  <label className="block font-bold text-gray-800 mb-2 text-xs uppercase">
                    Minh chứng bổ sung (nếu có)
                  </label>
                  <input
                    type="file"
                    id="resubmitFile"
                    multiple
                    className="hidden"
                    onChange={handleResubmitFileChange}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <label
                      htmlFor="resubmitFile"
                      className="cursor-pointer bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 hover:bg-red-200 border border-red-200"
                    >
                      <Plus size={14} /> Chọn file
                    </label>
                    {resubmitFiles.length > 0 && (
                      <button
                        onClick={() => setResubmitFiles([])}
                        className="text-red-500 text-xs hover:underline flex items-center gap-1"
                      >
                        <X size={12} /> Xóa tất cả
                      </button>
                    )}
                  </div>
                  {resubmitFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resubmitFiles.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border text-xs"
                        >
                          <FileText size={12} className="text-gray-500" />
                          <span className="max-w-[100px] truncate text-gray-700" title={f.name}>{f.name}</span>
                          <button
                            onClick={() => removeResubmitFile(f.name)}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">Chưa có file nào được chọn</div>
                  )}
                </div>

                <button
                  onClick={() => {
                    sysAPI.resubmitRequest(modalReq.id, resubmitFiles);
                    setModalReqId(null);
                    setResubmitFiles([]);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold flex justify-center items-center gap-2"
                >
                  <RefreshCw size={14} /> Đã bổ sung - Gửi lại
                </button>
              </div>
            )}

            {modalReq.status === 5 && lastPh && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-green-800 font-bold text-sm uppercase mb-2 flex items-center gap-2">
                  KẾT QUẢ
                </h4>
                {lastPh.accountLabel && (
                  <div className="mb-3 text-sm text-gray-700">
                    Loại tài khoản đã reset:{' '}
                    <span className="font-bold text-green-700">{lastPh.accountLabel}</span>
                  </div>
                )}
                <div className="bg-white border border-gray-300 rounded px-4 py-2 inline-block mb-2">
                  <span className="font-mono text-xl font-bold tracking-wider text-gray-900">
                    {lastPh.password || '---'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  * Khuyến cáo: Vui lòng đổi mật khẩu ngay sau khi đăng nhập thành công.
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t flex justify-end bg-gray-50">
            <button
              onClick={() => setModalReqId(null)}
              className="bg-[#64748b] hover:bg-slate-600 text-white px-6 py-2 rounded font-medium transition text-sm"
            >
              Đóng
            </button>
          </div>
        </Modal>
      )}

      <footer className="relative bg-white py-8 text-center text-sm text-gray-500 border-t mt-auto z-20">
        <div
          className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none"
          style={{
            backgroundImage: SKYLINE_SVG,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'contain',
            backgroundPosition: 'bottom',
          }}
        />
        <div className="relative z-10">
          Bản quyền @2023 thuộc Trường Đại học Xây dựng Hà Nội <br />
          Phát triển bởi:{' '}
          <span className="text-blue-600 font-medium cursor-pointer">Trung tâm CNTT &amp; CSDL</span>
        </div>
      </footer>
    </div>
  );
};

export default StudentApp;
