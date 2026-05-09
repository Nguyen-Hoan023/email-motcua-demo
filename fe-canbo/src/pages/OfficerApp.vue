<script setup>
import { ref, computed, watch } from 'vue';
import { ArrowLeft, FileText, CheckCircle, File as FileIcon, X, User, Mail, Computer, KeyRound, ShieldAlert } from 'lucide-vue-next';
import AppHeader from '../components/AppHeader.vue';
import { STATUS_MAP } from '../constants/statusMap';
import { getFileExtension, getDisplayFileName } from '../utils/fileUtils';
import { getAccountMeta, ACCOUNT_TYPE_ORDER } from '../constants/accountTypes';

const props = defineProps({
  db: Object,
  sysAPI: Object
});

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

const activeReqId = ref(null);
const rejectReason = ref('');
const viewingFile = ref(null);

const selectedAccountType = ref(null);
const isResetActivated = ref(false);
const generatedPassword = ref('');

const req = computed(() => {
  return props.db.YeuCauDichVu.find((r) => String(r.id) === String(activeReqId.value));
});

const studentProfile = computed(() => {
  if (!req.value) return null;
  return {
    mssv: req.value.studentId,
    hoTen: req.value.studentName,
    lop: req.value.lop || null,
    khoa: req.value.khoa || null,
  };
});

watch(req, (newReq) => {
  if (!newReq) {
    selectedAccountType.value = null;
    isResetActivated.value = false;
    generatedPassword.value = '';
    rejectReason.value = '';
  }
});

const handleSelectAccount = (accountType) => {
  if (isResetActivated.value) return;
  selectedAccountType.value = accountType;
  isResetActivated.value = false;
  generatedPassword.value = '';
};

const handleActivateReset = () => {
  const newPwd = generateRandomPassword(12);
  generatedPassword.value = newPwd;
  isResetActivated.value = true;
};

const handleComplete = async () => {
  if (!isResetActivated.value) return;

  const meta = getAccountMeta(selectedAccountType.value);
  await props.sysAPI.processRequest(req.value.id, 'COMPLETE', {
    password: generatedPassword.value,
    accountType: selectedAccountType.value,
    accountLabel: meta.label,
  });

  activeReqId.value = null;
  selectedAccountType.value = null;
  isResetActivated.value = false;
  generatedPassword.value = '';
};

const accounts = computed(() => {
  return studentProfile.value?.accounts || {
    EMAIL: {
      label: 'Email Sinh Viên',
      username: `${req.value?.studentId}@st.huce.edu.vn`,
      note: 'Tài khoản email nội bộ của sinh viên.',
    },
    OFFICE: {
      label: 'Microsoft Office',
      username: `${req.value?.studentId}@st.huce.edu.vn`,
      note: 'Tài khoản Office 365 của sinh viên.',
    },
    PORTAL: {
      label: 'Cổng sinh viên',
      username: req.value?.studentId,
      note: 'Tài khoản cổng sinh viên dùng MSSV làm đăng nhập.',
    },
  };
});

const getFileUrl = (filename) => `${FILE_BASE_URL}/${encodeURIComponent(filename)}`;
const isImage = (ext) => ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
const isPdf = (ext) => ext === 'pdf';
const isDocOrXls = (ext) => ['doc', 'docx', 'xls', 'xlsx'].includes(ext);
const isWord = (ext) => ['doc', 'docx'].includes(ext);

const getExpectedType = (serviceName, accountType) => {
  if (!serviceName) return false;
  if (serviceName.includes('Email') && accountType === 'EMAIL') return true;
  if (serviceName.includes('Microsoft') && accountType === 'OFFICE') return true;
  if (serviceName.includes('cổng thông tin') && accountType === 'PORTAL') return true;
  return false;
};
</script>

<template>
  <div v-if="!activeReqId" class="min-h-screen bg-gray-100 flex flex-col font-sans relative">
    <AppHeader />
    <div class="max-w-6xl mx-auto mt-6 bg-white border rounded-lg shadow-sm w-full p-8 mb-24 z-10">
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <h3 class="font-bold text-lg uppercase text-[#1e3a8a]">
          Danh sách yêu cầu cần tiếp nhận
        </h3>
      </div>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 text-sm">
            <th class="p-3 border text-left">Mã YC</th>
            <th class="p-3 border text-left">Sinh viên</th>
            <th class="p-3 border text-left">Nội dung</th>
            <th class="p-3 border text-center">Trạng thái</th>
            <th class="p-3 border text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in db.YeuCauDichVu" :key="item.id" class="text-sm border-b hover:bg-gray-50">
            <td class="p-3 border font-mono font-bold text-blue-600">{{ item.maYeuCau }}</td>
            <td class="p-3 border font-bold">
              {{ item.studentName }}
              <span class="block text-xs font-normal text-gray-500">MSSV: {{ item.studentId }}</span>
            </td>
            <td class="p-3 border">{{ item.serviceName }}</td>
            <td class="p-3 border text-center">
              <span :class="`px-2 py-1 rounded text-xs font-semibold ${STATUS_MAP[item.status].badge}`">
                {{ STATUS_MAP[item.status].label }}
              </span>
            </td>
            <td class="p-3 border text-center">
              <button
                @click="activeReqId = item.id"
                class="bg-[#2f3c8a] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-800"
              >
                Xử lý ngay
              </button>
            </td>
          </tr>
          <tr v-if="db.YeuCauDichVu.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">
              Chưa có dữ liệu
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer class="absolute bottom-0 w-full bg-white py-6 text-center text-sm text-gray-500 border-t">
      Bản quyền @2023 thuộc Trường Đại học Xây dựng Hà Nội <br />
      Phát triển bởi: <span class="text-blue-600">Trung tâm CNTT &amp; CSDL</span>
    </footer>
  </div>

  <div v-else-if="!req" class="min-h-screen bg-gray-100 flex flex-col font-sans relative">
    <AppHeader />
    <div class="max-w-4xl mx-auto mt-6 bg-white border rounded-lg shadow-sm p-8 w-full">
      <p class="text-gray-600">Không tìm thấy yêu cầu.</p>
    </div>
    <footer class="absolute bottom-0 w-full bg-white py-6 text-center text-sm text-gray-500 border-t">
      Bản quyền @2023 thuộc Trường Đại học Xây dựng Hà Nội <br />
      Phát triển bởi: <span class="text-blue-600">Trung tâm CNTT &amp; CSDL</span>
    </footer>
  </div>

  <div v-else class="min-h-screen bg-gray-100 flex flex-col font-sans relative">
    <AppHeader />
    <div class="max-w-5xl mx-auto mt-6 bg-white border rounded-lg shadow-sm mb-24 overflow-hidden w-full z-10">
      <div class="bg-gray-100 p-4 flex justify-between items-center border-b">
        <button
          @click="activeReqId = null"
          class="font-bold text-gray-700 flex items-center gap-1 hover:text-blue-800"
        >
          <ArrowLeft :size="16" /> Quay lại danh sách
        </button>
        <span :class="`px-3 py-1 rounded text-xs font-bold ${STATUS_MAP[req.status].badge}`">
          {{ STATUS_MAP[req.status].label }}
        </span>
      </div>

      <div class="p-8 space-y-6">
        <div class="bg-blue-50/50 border border-blue-100 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 block">Sinh viên</span>
            <strong class="text-base text-[#1e3a8a] uppercase">
              {{ req.studentName }} ({{ req.studentId }})
            </strong>
          </div>
          <div>
            <span class="text-gray-500 block">Dịch vụ yêu cầu</span>
            <strong class="text-base">{{ req.serviceName }}</strong>
          </div>
          <div class="col-span-2">
            <span class="text-gray-500 block mb-2">Minh chứng SV đính kèm</span>
            <div v-if="req.attachedFiles && req.attachedFiles.length > 0" class="flex flex-wrap gap-3">
              <button
                v-for="(f, idx) in req.attachedFiles"
                :key="idx"
                @click="viewingFile = f"
                class="text-blue-600 font-medium hover:underline flex items-center gap-1 transition bg-white px-3 py-1.5 rounded border border-blue-200 shadow-sm hover:bg-blue-50"
              >
                <FileText :size="16" /> <span class="max-w-[200px] truncate">{{ getDisplayFileName(f) }}</span>
              </button>
            </div>
            <span v-else class="italic text-gray-400">Không có tệp đính kèm</span>
          </div>
        </div>

        <section class="border rounded-xl p-5 bg-white shadow-sm">
          <h4 class="text-[#1e3a8a] font-bold text-base uppercase mb-4">
            Thông tin sinh viên
          </h4>

          <div class="grid lg:grid-cols-2 gap-4 mb-6">
            <div class="rounded-xl border bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Họ và tên</div>
              <div class="text-base font-bold text-gray-900">
                {{ studentProfile?.hoTen || req.studentName || '---' }}
              </div>
            </div>

            <div class="rounded-xl border bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">MSSV</div>
              <div class="text-base font-bold text-gray-900">
                {{ studentProfile?.mssv || req.studentId || '---' }}
              </div>
            </div>

            <div class="rounded-xl border bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Lớp</div>
              <div class="text-base font-bold text-gray-900">{{ studentProfile?.lop || '---' }}</div>
            </div>

            <div class="rounded-xl border bg-gray-50 p-4">
              <div class="text-xs uppercase tracking-wide text-gray-500 mb-1">Khoa / Bộ môn</div>
              <div class="text-base font-bold text-gray-900">{{ studentProfile?.khoa || '---' }}</div>
            </div>
          </div>

          <h4 class="text-[#1e3a8a] font-bold text-base uppercase mb-4">
            Tài khoản sinh viên
          </h4>
          <div class="grid md:grid-cols-3 gap-4">
            <div v-for="accountType in ACCOUNT_TYPE_ORDER" :key="accountType" class="rounded-xl border p-4 bg-white shadow-sm border-gray-200">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <component :is="ACCOUNT_ICON[accountType] || KeyRound" :size="20" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-gray-800">{{ accounts[accountType].label }}</div>
                  <div class="text-xs text-gray-500 mt-1 break-all">{{ accounts[accountType].username }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ accounts[accountType].note }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div v-if="req.status === 1 || req.status === 2 || req.status === 6" class="grid grid-cols-2 gap-6 border-t pt-6">
          <div class="bg-white border rounded p-6 shadow-sm text-center flex flex-col justify-between">
            <div>
              <h4 class="font-bold text-[#1e3a8a] mb-2 uppercase">
                Thông tin Hợp lệ
              </h4>
              <p class="text-xs text-gray-500 mb-4 h-8">
                Hồ sơ đầy đủ và chính xác, tiến hành xử lý kỹ thuật để reset mật khẩu ngay.
              </p>
            </div>
            <button
              @click="sysAPI.processRequest(req.id, 'ACCEPT')"
              class="w-full bg-[#2f3c8a] text-white px-4 py-3 rounded font-bold hover:bg-blue-900 transition uppercase text-sm shadow-sm"
            >
              Xác nhận
            </button>
          </div>

          <div class="bg-red-50 border border-red-200 rounded p-6 shadow-sm">
            <h4 class="font-bold text-red-700 mb-2 text-center uppercase">Thiếu thông tin</h4>
            <p class="text-xs text-gray-500 mb-3 text-center">
              Yêu cầu sinh viên bổ sung thêm minh chứng hoặc chỉnh sửa thông tin.
            </p>
            <input
              type="text"
              v-model="rejectReason"
              placeholder="Nhập lý do cần bổ sung "
              class="w-full p-2.5 text-sm border border-red-200 rounded mb-3 outline-none focus:border-red-500 bg-white"
            />
            <button
              @click="async () => {
                if (!rejectReason.trim()) {
                  alert('Vui lòng nhập lý do cần bổ sung!');
                  return;
                }
                await sysAPI.processRequest(req.id, 'REJECT', { reason: rejectReason });
                activeReqId = null;
              }"
              class="w-full bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition uppercase text-sm"
            >
              Yêu cầu bổ sung
            </button>
          </div>
        </div>

        <div v-if="req.status === 3" class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm space-y-5">
          <div class="flex items-center gap-2">
            <KeyRound :size="20" class="text-[#1e3a8a]" />
            <h4 class="font-bold text-lg text-[#1e3a8a]">3. Chọn loại tài khoản cần reset</h4>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            <button
              v-for="accountType in ACCOUNT_TYPE_ORDER"
              :key="accountType"
              @click="handleSelectAccount(accountType)"
              :disabled="isResetActivated || !getExpectedType(req.serviceName, accountType)"
              :class="[
                'text-left rounded-xl border p-4 transition relative',
                selectedAccountType === accountType
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                  : (isResetActivated || !getExpectedType(req.serviceName, accountType))
                    ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-50 hover:bg-white border-blue-200'
              ]"
            >
              <div v-if="!getExpectedType(req.serviceName, accountType)" class="absolute top-2 right-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Không khớp</div>
              <div v-if="getExpectedType(req.serviceName, accountType)" class="absolute top-2 right-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Cần xử lý</div>
              <div class="font-bold text-gray-800">{{ getAccountMeta(accountType).label }}</div>
              <div class="text-xs text-gray-500 mt-1 break-all">{{ accounts[accountType]?.username }}</div>
              <div class="text-xs text-gray-400 mt-2">{{ getAccountMeta(accountType).description }}</div>
            </button>
          </div>

          <div v-if="selectedAccountType && !isResetActivated" class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <div>
              <h5 class="font-bold text-yellow-800">Xác nhận thao tác</h5>
              <p class="text-sm text-yellow-700">Tài khoản chuẩn bị reset: <strong>{{ getAccountMeta(selectedAccountType).label }}</strong></p>
            </div>
            <button
              @click="handleActivateReset"
              class="bg-yellow-600 text-white px-6 py-2 rounded font-bold hover:bg-yellow-700 transition shadow-sm"
            >
              KÍCH HOẠT RESET
            </button>
          </div>

          <div v-if="isResetActivated" class="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
            <div class="flex items-start gap-3">
              <ShieldAlert class="text-green-600 mt-1" :size="24" />
              <div>
                <h5 class="font-bold text-green-800">
                  Đã kích hoạt Reset thành công tài khoản {{ getAccountMeta(selectedAccountType).label }}.
                </h5>
                <p class="text-sm text-green-700 mt-2 leading-relaxed">
                  Hệ thống đã kích hoạt mật khẩu mới.
                  <br />Hãy nhấm "Hoàn tất quy trình", kết thúc quy trình.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6 border-t pt-6">
            <button
              @click="handleComplete"
              class="bg-[#10b981] text-white px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-green-600 shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
              :disabled="!isResetActivated"
            >
              <CheckCircle :size="20" /> HOÀN TẤT QUY TRÌNH
            </button>
          </div>
        </div>

        <div v-if="req.status > 3" class="text-center py-8 text-gray-500 font-bold">
          Quy trình xử lý cho yêu cầu này đã kết thúc.
        </div>
      </div>
    </div>

    <div v-if="viewingFile" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="font-bold text-[#1e3a8a] flex items-center gap-2">
            <FileText :size="18" /> Chi tiết minh chứng: {{ getDisplayFileName(viewingFile) }}
          </h3>
          <button
            @click="viewingFile = null"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition text-gray-500"
          >
            <X :size="20" />
          </button>
        </div>
        <div class="p-6 flex-1 overflow-auto bg-gray-100 flex flex-col items-center justify-center">
          <!-- File Preview Logic -->
          <div v-if="isImage(getFileExtension(viewingFile))" class="flex flex-col items-center w-full">
            <img
              :src="getFileUrl(viewingFile)"
              :alt="viewingFile"
              class="max-w-full h-auto max-h-[55vh] object-contain rounded shadow-sm border"
              @error="(e) => { e.target.style.display = 'none'; }"
            />
          </div>
          <div v-else-if="isPdf(getFileExtension(viewingFile))" class="w-full h-[65vh] flex flex-col">
            <iframe
              :src="getFileUrl(viewingFile)"
              :title="viewingFile"
              class="w-full flex-1 rounded border shadow-sm"
            ></iframe>
            <a
              :href="getFileUrl(viewingFile)"
              :download="viewingFile"
              class="mt-3 self-center bg-red-50 text-red-600 px-6 py-2 rounded font-medium border border-red-200 hover:bg-red-100 transition"
            >
              Tải xuống PDF
            </a>
          </div>
          <div v-else-if="isDocOrXls(getFileExtension(viewingFile))" class="flex flex-col items-center justify-center p-12 bg-white rounded border shadow-sm w-full max-w-xl mx-auto">
            <FileText :size="72" :class="isWord(getFileExtension(viewingFile)) ? 'text-blue-600' : 'text-green-600'" />
            <h4 class="font-bold text-gray-800 text-lg mb-2 mt-4">
              {{ isWord(getFileExtension(viewingFile)) ? 'Tài liệu Word' : 'Bảng tính Excel' }}
            </h4>
            <p class="text-gray-500 mb-6 font-mono text-sm">{{ viewingFile }}</p>
            <a
              :href="getFileUrl(viewingFile)"
              :download="viewingFile"
              :class="`px-6 py-2 rounded font-medium border transition ${isWord(getFileExtension(viewingFile))
                ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                }`"
            >
              Tải xuống để xem
            </a>
          </div>
          <div v-else class="flex flex-col items-center justify-center p-12 bg-white rounded border shadow-sm w-full max-w-xl mx-auto">
            <FileIcon :size="72" class="text-gray-400 mb-4" />
            <h4 class="font-bold text-gray-800 text-lg mb-2">Tệp tin không hỗ trợ xem trước</h4>
            <p class="text-gray-500 mb-6 font-mono text-sm">{{ viewingFile }}</p>
            <a
              :href="getFileUrl(viewingFile)"
              :download="viewingFile"
              class="bg-gray-100 text-gray-700 px-6 py-2 rounded font-medium border border-gray-300 hover:bg-gray-200 transition"
            >
              Tải xuống tệp gốc
            </a>
          </div>
        </div>
      </div>
    </div>

    <footer class="absolute bottom-0 w-full bg-white py-6 text-center text-sm text-gray-500 border-t">
      Bản quyền @2023 thuộc Trường Đại học Xây dựng Hà Nội <br />
      Phát triển bởi: <span class="text-blue-600">Trung tâm CNTT &amp; CSDL</span>
    </footer>
  </div>
</template>
