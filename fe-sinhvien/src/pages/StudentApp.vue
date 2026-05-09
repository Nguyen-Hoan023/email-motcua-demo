<script setup>
import { ref, computed } from 'vue';
import {
  ArrowLeft, Plus,
  List, FileText as FileTextIcon, Info, X, AlertCircle, RefreshCw, ChevronRight,
} from 'lucide-vue-next';
import AppHeader from '../components/AppHeader.vue';
import Toast from '../components/Toast.vue';
import Modal from '../components/Modal.vue';
import { ASSETS, SKYLINE_SVG } from '../constants/assets';
import { STATUS_MAP } from '../constants/statusMap';

const props = defineProps({
  db: Object,
  user: Object,
  sysAPI: Object
});

const view = ref('REQUEST_LIST');
const reqType = ref('Tài khoản Email');
const files = ref([]);
const modalReqId = ref(null);
const toastMsg = ref('');
const resubmitFiles = ref([]);

const handleFileChange = (e) => {
  if (e.target.files.length) {
    const newFiles = Array.from(e.target.files);
    files.value = [...files.value, ...newFiles];
  }
};

const removeFile = (fileName) => {
  files.value = files.value.filter((f) => f.name !== fileName);
};

const handleResubmitFileChange = (e) => {
  if (e.target.files.length) {
    const newFiles = Array.from(e.target.files);
    resubmitFiles.value = [...resubmitFiles.value, ...newFiles];
  }
};

const removeResubmitFile = (fileName) => {
  resubmitFiles.value = resubmitFiles.value.filter((f) => f.name !== fileName);
};

const handleSubmit = async () => {
  await props.sysAPI.createRequest(reqType.value, files.value);
  files.value = [];
  view.value = 'REQUEST_LIST';
  toastMsg.value = 'Đã gửi yêu cầu thành công!';
  setTimeout(() => toastMsg.value = '', 3000);
};

const parseDateString = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = String(dateStr).split(/[\s/:]+/);
  if (parts.length >= 5) {
    const [dd, MM, yyyy, HH, mm] = parts.map(Number);
    return new Date(yyyy, MM - 1, dd, HH, mm);
  }
  return new Date();
};

const formatWithOffset = (baseDate, addDays) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + addDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const modalReq = computed(() => {
  if (!modalReqId.value) return null;
  return props.db.YeuCauDichVu.find((r) => String(r.id) === String(modalReqId.value));
});

const phanHoiArr = computed(() => {
  if (!modalReqId.value) return [];
  return props.db.PhanHoiYeuCau.filter((ph) => String(ph.reqId) === String(modalReqId.value));
});

const lastPh = computed(() => {
  return phanHoiArr.value.length > 0 ? phanHoiArr.value[phanHoiArr.value.length - 1] : null;
});

const myRequests = computed(() => {
  return props.db.YeuCauDichVu.filter((req) => String(req.studentId) === String(props.user.id));
});

const confirmedDateStr = computed(() => {
  if (!modalReq.value || modalReq.value.status < 2) return '';
  const baseDate = parseDateString(modalReq.value.createdAt);
  const logs = props.db.LogYeuCau.filter((l) => String(l.reqId) === String(modalReqId.value));
  const processLog = logs.find((l) => String(l.action).includes('Tiếp nhận') || String(l.action).includes('xử lý'));
  return processLog ? processLog.time : formatWithOffset(baseDate, 1);
});

const startReturnStr = computed(() => {
  if (!confirmedDateStr.value) return '';
  const confirmedDateObj = parseDateString(confirmedDateStr.value);
  return formatWithOffset(confirmedDateObj, 5);
});

const endReturnStr = computed(() => {
  if (!startReturnStr.value) return '';
  const startReturnDateObj = parseDateString(startReturnStr.value);
  return formatWithOffset(startReturnDateObj, 10);
});
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col font-sans relative">
    <AppHeader />
    <Toast :message="toastMsg" />

    <main class="max-w-6xl mx-auto mt-6 w-full mb-32 border border-gray-200 rounded-t-lg shadow-sm">
      <div class="flex gap-6 border-b px-6 py-3 bg-gray-50 rounded-t-lg">
        <div class="flex items-center gap-2 text-gray-600 font-medium cursor-pointer">
          <List :size="18" /> Dịch vụ
        </div>
        <div class="flex items-center gap-2 text-gray-400 cursor-pointer">
          <FileTextIcon :size="18" /> Hóa đơn
        </div>
      </div>

      <div class="relative h-40 bg-gray-800 overflow-hidden">
        <img
          :src="ASSETS.images.banners.studentBackground"
          alt="Banner"
          class="w-full h-full object-cover opacity-60 mix-blend-overlay grayscale"
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <h2 class="text-white text-3xl font-bold uppercase tracking-wide border-b-2 border-white pb-2 px-12">
            Hệ thống đăng ký thủ tục hành chính một cửa
          </h2>
          <h3 class="text-white text-4xl font-black uppercase mt-2 opacity-80 tracking-[0.2em]">
            DỊCH VỤ
          </h3>
        </div>
      </div>

      <div class="px-10 pb-4 relative -mt-12 flex items-end gap-4">
        <div class="bg-white p-1 rounded-full shadow-md z-10">
          <img
            :src="ASSETS.images.avatars.default"
            alt="Avatar"
            class="w-24 h-24 rounded-full border-2 border-white bg-blue-50 object-cover"
          />
        </div>
        <div class="mb-2 bg-white/90 px-4 py-1.5 rounded shadow-sm">
          <p class="text-sm">
            <span class="font-bold uppercase text-[#1e3a8a]">{{ user.name }}</span>
            <span class="text-gray-500 mx-1">MSSV: {{ user.id }}</span>
          </p>
          <button class="bg-[#10b981] text-white px-3 py-1 rounded text-xs font-bold mt-1.5 hover:bg-green-600">
            Cập nhật hồ sơ
          </button>
        </div>
      </div>

      <div class="px-12 py-8">

        <div v-if="view === 'FORM'" class="max-w-4xl mx-auto">
          <button
            @click="view = 'REQUEST_LIST'"
            class="bg-[#2f3c8a] text-white px-4 py-2 rounded text-sm font-bold mb-8 flex items-center gap-2 hover:bg-blue-800"
          >
            <ArrowLeft :size="16" /> QUAY LẠI
          </button>

          <div class="mb-6">
            <label class="block font-bold text-gray-800 mb-2 text-sm">
              Nội dung yêu cầu
            </label>
            <div class="relative">
              <select
                v-model="reqType"
                class="w-full p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm appearance-none"
              >
                <option value="Tài khoản Email">Tài khoản Email</option>
                <option value="Tài khoản Microsoft Office">Tài khoản Microsoft Office</option>
                <option value="Tài khoản cổng thông tin (sinhvien.huce.edu.vn)">
                  Tài khoản cổng thông tin (sinhvien.huce.edu.vn)
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ChevronRight class="rotate-90" :size="16" />
              </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block font-bold text-gray-800 mb-2 text-sm">
              Minh chứng (nếu có)
            </label>
            <div class="border border-gray-200 rounded bg-white">
              <input
                type="file"
                id="file"
                multiple
                class="hidden"
                @change="handleFileChange"
              />
              <div class="p-3 border-b bg-gray-50 flex items-center justify-between">
                <label
                  for="file"
                  class="cursor-pointer bg-[#6366f1] text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 hover:bg-indigo-500"
                >
                  <Plus :size="16" /> Chọn file
                </label>
                <button
                  v-if="files.length > 0"
                  @click="files = []"
                  class="text-red-500 text-sm hover:underline flex items-center gap-1"
                >
                  <X :size="14" /> Xóa tất cả
                </button>
              </div>
              <div class="p-6 text-center text-sm">
                <div v-if="files.length > 0" class="flex flex-wrap gap-4 justify-center">
                  <div
                    v-for="(f, idx) in files"
                    :key="idx"
                    class="flex flex-col items-center gap-1 bg-indigo-50 p-2 rounded border border-indigo-100 relative group min-w-[80px]"
                  >
                    <button
                      @click="removeFile(f.name)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hidden group-hover:block shadow"
                    >
                      <X :size="12" />
                    </button>
                    <FileTextIcon :size="24" class="text-indigo-500" />
                    <span
                      class="text-indigo-700 font-medium text-xs max-w-[100px] truncate"
                      :title="f.name"
                    >
                      {{ f.name }}
                    </span>
                  </div>
                </div>
                <span v-else class="text-gray-600">Kéo thả nhiều file từ máy tính để upload.</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-8">
            <button
              @click="handleSubmit"
              class="bg-[#2f3c8a] text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-blue-900 transition"
            >
              GỬI YÊU CẦU
            </button>
          </div>
        </div>

        <div v-if="view === 'REQUEST_LIST'" class="w-full">
          <div class="flex justify-between items-center mb-8">
            <div />
            <button
              @click="view = 'FORM'"
              class="bg-[#2f3c8a] text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-800 uppercase tracking-wide"
            >
              Thêm mới
            </button>
          </div>

          <h2 class="text-[#2f3c8a] font-bold text-xl uppercase mb-2">DANH SÁCH YÊU CẦU</h2>
          <div class="border border-gray-200 rounded overflow-hidden">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-[#2f3c8a] text-white text-sm">
                  <th class="py-3 px-4 border-r border-blue-800 w-24 text-center font-semibold">
                    #
                  </th>
                  <th class="py-3 px-4 text-left font-semibold">NỘI DUNG</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(req, index) in myRequests" :key="req.id" class="border-b bg-white">
                  <td class="py-4 px-4 text-center border-r text-sm text-gray-700 align-top">
                    {{ index + 1 }}
                  </td>
                  <td class="py-4 px-6">
                    <div class="text-sm text-gray-800 mb-1">{{ req.serviceName }}</div>
                    <div class="text-sm font-medium mb-1 flex items-center gap-1">
                      <span class="text-gray-700">Trạng thái yêu cầu:</span>
                      <span :class="`font-bold ${STATUS_MAP[req.status].color}`">
                        {{ STATUS_MAP[req.status].label }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-600 mb-3">Ngày tạo: {{ req.createdAt }}</div>
                    <button
                      @click="modalReqId = req.id"
                      class="bg-[#3b82f6] hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    >
                      <Info :size="14" /> Quá trình xử lý
                    </button>
                  </td>
                </tr>
                <tr v-if="myRequests.length === 0">
                  <td colspan="2" class="py-8 text-center text-gray-500 text-sm bg-white">
                    No Available Data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <Modal v-if="modalReq" title="Chi tiết" @close="modalReqId = null">
      <div class="p-6">
        <div class="flex justify-between items-start mb-2">
          <div class="text-[#1e3a8a] font-bold text-base uppercase">{{ modalReq.studentName }}</div>
          <div class="text-gray-600 text-sm">Thời gian gửi yêu cầu: {{ modalReq.createdAt }}</div>
        </div>
        <div class="flex items-center gap-2 mb-6 text-sm text-gray-700">
          <span>Mã sinh viên: {{ modalReq.studentId }}</span>
          <span class="text-gray-300">|</span>
          <span>
            Trạng thái:
            <span :class="`font-bold ${STATUS_MAP[modalReq.status].color}`">
              {{ STATUS_MAP[modalReq.status].label }}
            </span>
          </span>
        </div>

        <div class="mb-4">
          <h4 class="text-[#1e3a8a] font-bold text-base uppercase mb-1">NỘI DUNG</h4>
          <p class="text-gray-800 text-sm mb-8">{{ modalReq.serviceName }}</p>

          <div class="relative border-l-2 border-gray-200 ml-2 pl-6 pb-2 space-y-6">
            <div v-if="modalReq.status === 3 || modalReq.status === 5" class="relative">
              <div class="absolute -left-[31px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
              <div class="text-sm text-gray-800">
                Trạng thái: <span class="font-bold text-[#10b981]">Bộ phận Một cửa đã tiếp nhận</span> =&gt; <span class="font-bold text-[#2563eb]">Đang xử lý</span>
              </div>
              <div class="text-xs text-gray-500 italic mt-1">{{ confirmedDateStr }}</div>
              <div class="border-b border-dashed border-gray-300 w-full ml-0 my-4"></div>
            </div>

            <div v-if="modalReq.status === 2 || modalReq.status === 3 || modalReq.status === 5" class="relative">
              <div class="absolute -left-[31px] top-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              <div class="text-sm text-gray-800">
                Trạng thái: <span class="font-bold text-[#f59e0b]">Đã gửi</span> =&gt; <span class="font-bold text-[#10b981]">Bộ phận Một cửa đã tiếp nhận</span>
              </div>
              <div class="text-sm text-gray-800 mt-1">
                Hẹn trả từ ngày: =&gt; <span class="font-bold text-blue-700">{{ startReturnStr }}</span>
              </div>
              <div class="text-sm text-gray-800 mt-1">
                Đến ngày: =&gt; <span class="font-bold text-blue-700">{{ endReturnStr }}</span>
              </div>
              <div class="text-xs text-gray-500 italic mt-1">{{ confirmedDateStr }}</div>
            </div>
          </div>
        </div>

        <div v-if="modalReq.status === 4 && lastPh" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 class="text-red-800 font-bold text-sm uppercase mb-2 flex items-center gap-2">
            <AlertCircle :size="16" /> Cán bộ yêu cầu bổ sung
          </h4>
          <p class="text-sm text-red-900 mb-4">{{ lastPh.content }}</p>

          <div class="mb-4 bg-white p-3 rounded border border-red-100">
            <label class="block font-bold text-gray-800 mb-2 text-xs uppercase">
              Minh chứng bổ sung (nếu có)
            </label>
            <input
              type="file"
              id="resubmitFile"
              multiple
              class="hidden"
              @change="handleResubmitFileChange"
            />
            <div class="flex items-center gap-2 mb-3">
              <label
                for="resubmitFile"
                class="cursor-pointer bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 hover:bg-red-200 border border-red-200"
              >
                <Plus :size="14" /> Chọn file
              </label>
              <button
                v-if="resubmitFiles.length > 0"
                @click="resubmitFiles = []"
                class="text-red-500 text-xs hover:underline flex items-center gap-1"
              >
                <X :size="12" /> Xóa tất cả
              </button>
            </div>
            <div v-if="resubmitFiles.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="(f, idx) in resubmitFiles"
                :key="idx"
                class="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border text-xs"
              >
                <FileTextIcon :size="12" class="text-gray-500" />
                <span class="max-w-[100px] truncate text-gray-700" :title="f.name">{{ f.name }}</span>
                <button
                  @click="removeResubmitFile(f.name)"
                  class="text-red-500 hover:text-red-700 ml-1"
                >
                  <X :size="12" />
                </button>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400 italic">Chưa có file nào được chọn</div>
          </div>

          <button
            @click="() => { props.sysAPI.resubmitRequest(modalReq.id, resubmitFiles); modalReqId = null; resubmitFiles = []; }"
            class="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold flex justify-center items-center gap-2"
          >
            <RefreshCw :size="14" /> Đã bổ sung - Gửi lại
          </button>
        </div>

        <div v-if="modalReq.status === 5 && lastPh" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 class="text-green-800 font-bold text-sm uppercase mb-2 flex items-center gap-2">
            KẾT QUẢ
          </h4>
          <div v-if="lastPh.accountLabel" class="mb-3 text-sm text-gray-700">
            Loại tài khoản đã reset:
            <span class="font-bold text-green-700">{{ lastPh.accountLabel }}</span>
          </div>
          <div class="bg-white border border-gray-300 rounded px-4 py-2 inline-block mb-2">
            <span class="font-mono text-xl font-bold tracking-wider text-gray-900">
              {{ lastPh.password || '---' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 italic">
            * Khuyến cáo: Vui lòng đổi mật khẩu ngay sau khi đăng nhập thành công.
          </p>
        </div>
      </div>
      <div class="p-4 border-t flex justify-end bg-gray-50">
        <button
          @click="modalReqId = null"
          class="bg-[#64748b] hover:bg-slate-600 text-white px-6 py-2 rounded font-medium transition text-sm"
        >
          Đóng
        </button>
      </div>
    </Modal>

    <footer class="relative bg-white py-8 text-center text-sm text-gray-500 border-t mt-auto z-20">
      <div
        class="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none"
        :style="{
          backgroundImage: `url(${SKYLINE_SVG})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom'
        }"
      ></div>
      <div class="relative z-10">
        Bản quyền @2023 thuộc Trường Đại học Xây dựng Hà Nội <br />
        Phát triển bởi:
        <span class="text-blue-600 font-medium cursor-pointer">Trung tâm CNTT &amp; CSDL</span>
      </div>
    </footer>
  </div>
</template>
