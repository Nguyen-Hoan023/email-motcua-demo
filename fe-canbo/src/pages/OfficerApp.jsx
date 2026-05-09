//GIAO DIỆN CÁN BỘ XỬ LÝ 

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, File, X, User, Mail, Computer, KeyRound, ShieldAlert } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import { STATUS_MAP } from '../constants/statusMap';
import { getFileExtension, getDisplayFileName } from '../utils/fileUtils';
import { getAccountMeta, ACCOUNT_TYPE_ORDER } from '../constants/accountTypes';

// Hàm sinh mật khẩu ngầm 
const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join('');
};

const ACCOUNT_ICON = {
  EMAIL: Mail,
  OFFICE: Computer,
  PORTAL: User,
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
const FILE_BASE_URL = `${API_BASE_URL}/api/files`;
// Render preview file theo từng loại extension khác nhau.
const renderFilePreview = (filename) => {
  const ext = getFileExtension(filename);
  const fileUrl = `${FILE_BASE_URL}/${encodeURIComponent(filename)}`;

  // Ảnh — hiển thị trực tiếp 
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
    return (
      <div className="flex flex-col items-center w-full">
        <img
          src={fileUrl}
          alt={filename}
          className="max-w-full h-auto max-h-[55vh] object-contain rounded shadow-sm border"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // PDF — nhúng bằng <iframe>
  if (ext === 'pdf') {
    return (
      <div className="w-full h-[65vh] flex flex-col">
        <iframe
          src={fileUrl}
          title={filename}
          className="w-full flex-1 rounded border shadow-sm"
        />
        <a
          href={fileUrl}
          download={filename}
          className="mt-3 self-center bg-red-50 text-red-600 px-6 py-2 rounded font-medium border border-red-200 hover:bg-red-100 transition"
        >
          Tải xuống PDF
        </a>
      </div>
    );
  }

  // Word / Excel — không xem trước được, chỉ tải xuống
  if (['doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
    const isWord = ['doc', 'docx'].includes(ext);
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded border shadow-sm w-full max-w-xl mx-auto">
        <FileText size={72} className={isWord ? 'text-blue-600' : 'text-green-600'} />
        <h4 className="font-bold text-gray-800 text-lg mb-2 mt-4">
          {isWord ? 'Tài liệu Word' : 'Bảng tính Excel'}
        </h4>
        <p className="text-gray-500 mb-6 font-mono text-sm">{filename}</p>
        <a
          href={fileUrl}
          download={filename}
          className={`px-6 py-2 rounded font-medium border transition ${isWord
            ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
            }`}
        >
          Tải xuống để xem
        </a>
      </div>
    );
  }

  // Fallback — file không xác định
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded border shadow-sm w-full max-w-xl mx-auto">
      <File size={72} className="text-gray-400 mb-4" />
      <h4 className="font-bold text-gray-800 text-lg mb-2">Tệp tin không hỗ trợ xem trước</h4>
      <p className="text-gray-500 mb-6 font-mono text-sm">{filename}</p>
      <a
        href={fileUrl}
        download={filename}
        className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-medium border border-gray-300 hover:bg-gray-200 transition"
      >
        Tải xuống tệp gốc
      </a>
    </div>
  );
};
// Component hiển thị thông tin tài khoản sinh viên.
const AccountInfoCard = ({ account, accountType }) => {
  const Icon = ACCOUNT_ICON[accountType] || KeyRound;

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm border-gray-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800">{account.label}</div>
          <div className="text-xs text-gray-500 mt-1 break-all">{account.username}</div>
          <div className="text-xs text-gray-400 mt-1">{account.note}</div>
        </div>
      </div>
    </div>
  );
};
// Component chính của giao diện cán bộ xử lý yêu cầu.
const OfficerApp = ({ db, sysAPI }) => {
  const [activeReqId, setActiveReqId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewingFile, setViewingFile] = useState(null);

  // Các state quản lý luồng Reset chuẩn Zero-Trust
  const [selectedAccountType, setSelectedAccountType] = useState(null);
  const [isResetActivated, setIsResetActivated] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const Footer = () => (
    <footer className="absolute bottom-0 w-full bg-white py-6 text-center text-sm text-gray-500 border-t">
      Bản quyền @2023 thuộc Trường Đại học Xây dựng Hà Nội <br />
      Phát triển bởi: <span className="text-blue-600">Trung tâm CNTT &amp; CSDL</span>
    </footer>
  );
  // Cache request hiện tại để tránh tìm lại nhiều lần khi render.
  const req = useMemo(
    () => db.YeuCauDichVu.find((r) => String(r.id) === String(activeReqId)),
    [db.YeuCauDichVu, activeReqId]
  );

  // Thông tin sinh viên lấy từ dữ liệu request (backend API trả về)
  const studentProfile = useMemo(() => {
    if (!req) return null;
    return {
      mssv: req.studentId,
      hoTen: req.studentName,
      lop: req.lop || null,
      khoa: req.khoa || null,
    };
  }, [req]);

  // Reset state khi đổi yêu cầu
  useEffect(() => {
    if (!req) {
      setSelectedAccountType(null);
      setIsResetActivated(false);
      setGeneratedPassword('');
      setRejectReason('');
    }
  }, [req]);

  // 1. Chỉ chọn đối tượng, chưa reset
  const handleSelectAccount = (accountType) => {
    if (isResetActivated) return; // Nếu đã kích hoạt thì khóa không cho đổi tab khác
    setSelectedAccountType(accountType);
    setIsResetActivated(false);
    setGeneratedPassword('');
  };

  // 2. Nút kích hoạt Reset
  const handleActivateReset = () => {
    const newPwd = generateRandomPassword(12); // Tăng độ dài pass
    setGeneratedPassword(newPwd);
    setIsResetActivated(true);
  };

  // 3. Hoàn tất quy trình
  const handleComplete = async () => {
    if (!isResetActivated) return;

    const meta = getAccountMeta(selectedAccountType);
    await sysAPI.processRequest(req.id, 'COMPLETE', {
      password: generatedPassword,
      accountType: selectedAccountType,
      accountLabel: meta.label,
    });

    setActiveReqId(null);
    setSelectedAccountType(null);
    setIsResetActivated(false);
    setGeneratedPassword('');
  };
  // Hiển thị danh sách yêu cầu khi chưa chọn request xử lý.
  if (!activeReqId) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans relative">
        <AppHeader />
        <div className="max-w-6xl mx-auto mt-6 bg-white border rounded-lg shadow-sm w-full p-8 mb-24 z-10">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="font-bold text-lg uppercase text-[#1e3a8a]">
              Danh sách yêu cầu cần tiếp nhận
            </h3>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-3 border text-left">Mã YC</th>
                <th className="p-3 border text-left">Sinh viên</th>
                <th className="p-3 border text-left">Nội dung</th>
                <th className="p-3 border text-center">Trạng thái</th>
                <th className="p-3 border text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {db.YeuCauDichVu.map((item) => (
                <tr key={String(item.id)} className="text-sm border-b hover:bg-gray-50">
                  <td className="p-3 border font-mono font-bold text-blue-600">{item.maYeuCau}</td>
                  <td className="p-3 border font-bold">
                    {item.studentName}
                    <span className="block text-xs font-normal text-gray-500">MSSV: {item.studentId}</span>
                  </td>
                  <td className="p-3 border">{item.serviceName}</td>
                  <td className="p-3 border text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_MAP[item.status].badge}`}>
                      {STATUS_MAP[item.status].label}
                    </span>
                  </td>
                  <td className="p-3 border text-center">
                    <button
                      onClick={() => setActiveReqId(item.id)}
                      className="bg-[#2f3c8a] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-800"
                    >
                      Xử lý ngay
                    </button>
                  </td>
                </tr>
              ))}
              {db.YeuCauDichVu.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Footer />
      </div>
    );
  }
  // Hiển thị thông báo nếu không tìm thấy request.
  if (!req) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans relative">
        <AppHeader />
        <div className="max-w-4xl mx-auto mt-6 bg-white border rounded-lg shadow-sm p-8 w-full">
          <p className="text-gray-600">Không tìm thấy yêu cầu.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const accounts = studentProfile?.accounts || {
    EMAIL: {
      label: 'Email Sinh Viên',
      username: `${req.studentId}@st.huce.edu.vn`,
      note: 'Tài khoản email nội bộ của sinh viên.',
    },
    OFFICE: {
      label: 'Microsoft Office',
      username: `${req.studentId}@st.huce.edu.vn`,
      note: 'Tài khoản Office 365 của sinh viên.',
    },
    PORTAL: {
      label: 'Cổng sinh viên',
      username: req.studentId,
      note: 'Tài khoản cổng sinh viên dùng MSSV làm đăng nhập.',
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans relative">
      <AppHeader />
      <div className="max-w-5xl mx-auto mt-6 bg-white border rounded-lg shadow-sm mb-24 overflow-hidden w-full z-10">
        <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
          <button
            onClick={() => setActiveReqId(null)}
            className="font-bold text-gray-700 flex items-center gap-1 hover:text-blue-800"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
          <span className={`px-3 py-1 rounded text-xs font-bold ${STATUS_MAP[req.status].badge}`}>
            {STATUS_MAP[req.status].label}
          </span>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Sinh viên</span>
              <strong className="text-base text-[#1e3a8a] uppercase">
                {req.studentName} ({req.studentId})
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Dịch vụ yêu cầu</span>
              <strong className="text-base">{req.serviceName}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 block mb-2">Minh chứng SV đính kèm</span>
              {req.attachedFiles && req.attachedFiles.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {req.attachedFiles.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => setViewingFile(f)}
                      className="text-blue-600 font-medium hover:underline flex items-center gap-1 transition bg-white px-3 py-1.5 rounded border border-blue-200 shadow-sm hover:bg-blue-50"
                    >
                      <FileText size={16} /> <span className="max-w-[200px] truncate">{getDisplayFileName(f)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <span className="italic text-gray-400">Không có tệp đính kèm</span>
              )}
            </div>
          </div>

          <section className="border rounded-xl p-5 bg-white shadow-sm">
            <h4 className="text-[#1e3a8a] font-bold text-base uppercase mb-4">
              Thông tin sinh viên
            </h4>

            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Họ và tên</div>
                <div className="text-base font-bold text-gray-900">
                  {studentProfile?.hoTen || req.studentName || '---'}
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">MSSV</div>
                <div className="text-base font-bold text-gray-900">
                  {studentProfile?.mssv || req.studentId || '---'}
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Lớp</div>
                <div className="text-base font-bold text-gray-900">{studentProfile?.lop || '---'}</div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Khoa / Bộ môn</div>
                <div className="text-base font-bold text-gray-900">{studentProfile?.khoa || '---'}</div>
              </div>
            </div>

            <h4 className="text-[#1e3a8a] font-bold text-base uppercase mb-4">
              Tài khoản sinh viên
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {ACCOUNT_TYPE_ORDER.map((accountType) => (
                <AccountInfoCard
                  key={accountType}
                  accountType={accountType}
                  account={accounts[accountType]}
                />
              ))}
            </div>
          </section>

          {(req.status === 1 || req.status === 2 || req.status === 6) && (
            <div className="grid grid-cols-2 gap-6 border-t pt-6">
              <div className="bg-white border rounded p-6 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#1e3a8a] mb-2 uppercase">
                    Thông tin Hợp lệ
                  </h4>
                  <p className="text-xs text-gray-500 mb-4 h-8">
                    Hồ sơ đầy đủ và chính xác, tiến hành xử lý kỹ thuật để reset mật khẩu ngay.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await sysAPI.processRequest(req.id, 'ACCEPT');
                  }}
                  className="w-full bg-[#2f3c8a] text-white px-4 py-3 rounded font-bold hover:bg-blue-900 transition uppercase text-sm shadow-sm"
                >
                  Xác nhận
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-6 shadow-sm">
                <h4 className="font-bold text-red-700 mb-2 text-center uppercase">Thiếu thông tin</h4>
                <p className="text-xs text-gray-500 mb-3 text-center">
                  Yêu cầu sinh viên bổ sung thêm minh chứng hoặc chỉnh sửa thông tin.
                </p>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do cần bổ sung "
                  className="w-full p-2.5 text-sm border border-red-200 rounded mb-3 outline-none focus:border-red-500 bg-white"
                />
                <button
                  onClick={async () => {
                    if (!rejectReason.trim()) {
                      alert('Vui lòng nhập lý do cần bổ sung!');
                      return;
                    }
                    await sysAPI.processRequest(req.id, 'REJECT', { reason: rejectReason });
                    setActiveReqId(null);
                  }}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition uppercase text-sm"
                >
                  Yêu cầu bổ sung
                </button>
              </div>
            </div>
          )}

          {req.status === 3 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <KeyRound size={20} className="text-[#1e3a8a]" />
                <h4 className="font-bold text-lg text-[#1e3a8a]">3. Chọn loại tài khoản cần reset</h4>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {ACCOUNT_TYPE_ORDER.map((accountType) => {
                  const meta = getAccountMeta(accountType);
                  const account = accounts[accountType];
                  const isSelected = selectedAccountType === accountType;

                  // Xác định loại tài khoản đúng dựa trên tên dịch vụ
                  let isExpected = false;
                  if (req.serviceName?.includes('Email') && accountType === 'EMAIL') isExpected = true;
                  else if (req.serviceName?.includes('Microsoft') && accountType === 'OFFICE') isExpected = true;
                  else if (req.serviceName?.includes('cổng thông tin') && accountType === 'PORTAL') isExpected = true;

                  // Nếu là loại sai, làm mờ đi và không cho click
                  const isDisabled = isResetActivated || !isExpected;

                  return (
                    <button
                      key={accountType}
                      onClick={() => handleSelectAccount(accountType)}
                      disabled={isDisabled}
                      className={`text-left rounded-xl border p-4 transition relative ${isSelected
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                        : isDisabled
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-gray-50 hover:bg-white border-blue-200'
                        }`}
                    >
                      {!isExpected && (
                        <div className="absolute top-2 right-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Không khớp</div>
                      )}
                      {isExpected && (
                        <div className="absolute top-2 right-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Cần xử lý</div>
                      )}
                      <div className="font-bold text-gray-800">{meta.label}</div>
                      <div className="text-xs text-gray-500 mt-1 break-all">{account?.username}</div>
                      <div className="text-xs text-gray-400 mt-2">{meta.description}</div>
                    </button>
                  );
                })}
              </div>

              {selectedAccountType && !isResetActivated && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-yellow-800">Xác nhận thao tác</h5>
                    <p className="text-sm text-yellow-700">Tài khoản chuẩn bị reset: <strong>{getAccountMeta(selectedAccountType).label}</strong></p>
                  </div>
                  <button
                    onClick={handleActivateReset}
                    className="bg-yellow-600 text-white px-6 py-2 rounded font-bold hover:bg-yellow-700 transition shadow-sm"
                  >
                    KÍCH HOẠT RESET
                  </button>
                </div>
              )}

              {isResetActivated && (
                <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="text-green-600 mt-1" size={24} />
                    <div>
                      <h5 className="font-bold text-green-800">
                        Đã kích hoạt Reset thành công tài khoản {getAccountMeta(selectedAccountType).label}.
                      </h5>
                      <p className="text-sm text-green-700 mt-2 leading-relaxed">
                        Hệ thống đã kích hoạt mật khẩu mới.
                        <br />Hãy nhấm "Hoàn tất quy trình", kết thúc quy trình.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 border-t pt-6">
                <button
                  onClick={handleComplete}
                  className="bg-[#10b981] text-white px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-green-600 shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
                  disabled={!isResetActivated}
                >
                  <CheckCircle size={20} /> HOÀN TẤT QUY TRÌNH
                </button>
              </div>
            </div>
          )}

          {req.status > 3 && (
            <div className="text-center py-8 text-gray-500 font-bold">
              Quy trình xử lý cho yêu cầu này đã kết thúc.
            </div>
          )}
        </div>
      </div>

      {viewingFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-[#1e3a8a] flex items-center gap-2">
                <FileText size={18} /> Chi tiết minh chứng: {getDisplayFileName(viewingFile)}
              </h3>
              <button
                onClick={() => setViewingFile(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto bg-gray-100 flex flex-col items-center justify-center">
              {renderFilePreview(viewingFile)}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OfficerApp;