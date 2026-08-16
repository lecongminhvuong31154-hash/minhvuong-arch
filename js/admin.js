const SUPABASE_URL = "https://zmgsforefkyxmftuczpz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qc8AZryLZDjNz6ZITLACug_-E2OOxnt";
const AUTH_STORAGE_KEY = "sb-zmgsforefkyxmftuczpz-auth-token";

const $ = (selector) => document.querySelector(selector);

const state = {
  dashboard: null,
  session: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function setLoading(active, message = "Đang tải dữ liệu...") {
  const overlay = $("#loading-overlay");
  const text = $("#loading-text");

  if (text) text.textContent = message;
  if (overlay) overlay.hidden = !active;
}

function showToast(message, type = "success") {
  const toast = $("#toast");

  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.hidden = false;

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}

function readStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // supabase-js v2 usually stores the session object directly.
    if (parsed?.access_token) return parsed;

    // Compatibility with wrappers that store { currentSession: ... }
    if (parsed?.currentSession?.access_token) {
      return parsed.currentSession;
    }

    return null;
  } catch (error) {
    console.error("Không đọc được Supabase session:", error);
    return null;
  }
}

function saveStoredSession(session) {
  if (!session?.access_token) return;

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session)
  );
}

async function refreshSession(session) {
  if (!session?.refresh_token) {
    throw new Error("Không tìm thấy refresh token. Vui lòng đăng nhập lại.");
  }

  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY
      },
      body: JSON.stringify({
        refresh_token: session.refresh_token
      })
    }
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.msg ||
      body?.message ||
      body?.error_description ||
      "Phiên đăng nhập đã hết hạn."
    );
  }

  saveStoredSession(body);
  state.session = body;

  return body;
}

async function getValidSession() {
  let session = state.session || readStoredSession();

  if (!session?.access_token) {
    return null;
  }

  const expiresAt = Number(session.expires_at || 0);
  const now = Math.floor(Date.now() / 1000);

  // Refresh 60s before expiry.
  if (expiresAt && expiresAt <= now + 60) {
    session = await refreshSession(session);
  }

  state.session = session;

  return session;
}

async function rpc(functionName, params = {}) {
  let session = await getValidSession();

  if (!session) {
    throw new Error("NOT_AUTHENTICATED");
  }

  let response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify(params)
    }
  );

  // Access token may have expired unexpectedly. Refresh once and retry.
  if (response.status === 401 && session.refresh_token) {
    session = await refreshSession(session);

    response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(params)
      }
    );
  }

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Server trả dữ liệu không hợp lệ (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.hint ||
      data?.details ||
      data?.code ||
      `HTTP ${response.status}`
    );
  }

  return data;
}

async function requireAdmin() {
  let session;

  try {
    session = await getValidSession();
  } catch (error) {
    console.error(error);
    window.location.href = "index.html";
    return false;
  }

  if (!session?.access_token) {
    window.location.href = "index.html";
    return false;
  }

  const email =
    session?.user?.email ||
    "Administrator";

  $("#admin-email").textContent = email;

  try {
    const isAdmin = await rpc(
      "is_current_user_admin"
    );

    if (isAdmin !== true) {
      throw new Error("ADMIN_REQUIRED");
    }

    return true;

  } catch (error) {
    console.error("Admin check error:", error);

    document.body.innerHTML = `
      <main class="access-denied">
        <div>
          <p class="eyebrow">ACCESS DENIED</p>
          <h1>Bạn không có quyền truy cập trang quản trị.</h1>
          <a href="index.html">← Quay lại website</a>
        </div>
      </main>
    `;

    return false;
  }
}

async function loadDashboard() {
  setLoading(true);

  try {
    const data = await rpc(
      "admin_get_dashboard"
    );

    state.dashboard = data;

    renderSummary(data?.summary || {});
    renderOrders(data?.orders || []);
    renderLicenses(data?.licenses || []);
    renderDevices(data?.devices || []);

  } catch (error) {
    console.error("Dashboard error:", error);

    showToast(
      error.message || "Không thể tải dashboard.",
      "error"
    );
  } finally {
    setLoading(false);
  }
}

function renderSummary(summary) {
  $("#summary-customers").textContent =
    summary.customers ?? 0;

  $("#summary-orders").textContent =
    summary.paid_orders ?? 0;

  $("#summary-licenses").textContent =
    summary.active_licenses ?? 0;

  $("#summary-devices").textContent =
    summary.devices ?? 0;
}

function renderOrders(orders) {
  const body = $("#orders-body");

  if (!orders.length) {
    body.innerHTML = `
      <tr>
        <td colspan="7" class="empty">Chưa có đơn hàng.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = orders.map((order) => `
    <tr>
      <td>${escapeHtml(order.email || "—")}</td>
      <td>${escapeHtml(order.product_name || "—")}</td>
      <td>${formatMoney(order.amount)}</td>
      <td>
        <span class="mono">${escapeHtml(order.payment_reference || "—")}</span>
      </td>
      <td>
        <span class="status ${escapeHtml(order.status)}">
          ${escapeHtml(order.status)}
        </span>
      </td>
      <td>${formatDate(order.created_at)}</td>
      <td class="mono small">${escapeHtml(order.id)}</td>
    </tr>
  `).join("");
}

function renderLicenses(licenses) {
  const body = $("#licenses-body");

  if (!licenses.length) {
    body.innerHTML = `
      <tr>
        <td colspan="8" class="empty">Chưa có license.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = licenses.map((license) => {
    const active = license.status === "active";

    return `
      <tr>
        <td>${escapeHtml(license.email || "—")}</td>
        <td>${escapeHtml(license.product_name || "—")}</td>
        <td>
          <span class="status ${escapeHtml(license.status)}">
            ${escapeHtml(license.status)}
          </span>
        </td>
        <td>
          ${license.expires_at ? formatDate(license.expires_at) : "Vĩnh viễn"}
        </td>
        <td>
          <strong>${license.used_devices || 0}</strong>
          /
          <strong>${license.max_devices}</strong>
        </td>
        <td>
          <select
            class="device-limit"
            data-license-id="${escapeHtml(license.id)}"
          >
            ${[1,2,3,4,5,10].map((n) => `
              <option
                value="${n}"
                ${Number(license.max_devices) === n ? "selected" : ""}
              >
                ${n} thiết bị
              </option>
            `).join("")}
          </select>
        </td>
        <td>
          <button
            class="action-btn ${active ? "danger" : "success"}"
            data-action="toggle-license"
            data-license-id="${escapeHtml(license.id)}"
            data-next-status="${active ? "suspended" : "active"}"
          >
            ${active ? "Khóa" : "Mở"}
          </button>
        </td>
        <td class="mono small">${escapeHtml(license.id)}</td>
      </tr>
    `;
  }).join("");
}

function renderDevices(devices) {
  const body = $("#devices-body");

  if (!devices.length) {
    body.innerHTML = `
      <tr>
        <td colspan="8" class="empty">Chưa có thiết bị.</td>
      </tr>
    `;
    return;
  }

  body.innerHTML = devices.map((device) => `
    <tr>
      <td>${escapeHtml(device.email || "—")}</td>
      <td>${escapeHtml(device.product_name || "—")}</td>
      <td>${escapeHtml(device.device_name || "—")}</td>
      <td class="mono small">${escapeHtml(device.device_id)}</td>
      <td>${formatDate(device.activated_at)}</td>
      <td>${formatDate(device.last_check_at)}</td>
      <td>
        <button
          class="action-btn danger"
          data-action="remove-device"
          data-device-row-id="${escapeHtml(device.id)}"
          data-device-name="${escapeHtml(device.device_name || "thiết bị này")}"
        >
          Gỡ thiết bị
        </button>
      </td>
      <td class="mono small">${escapeHtml(device.license_id)}</td>
    </tr>
  `).join("");
}

async function setLicenseStatus(licenseId, status) {
  const label =
    status === "suspended" ? "khóa license" : "mở license";

  if (!confirm(`Bạn chắc chắn muốn ${label}?`)) return;

  setLoading(true, "Đang cập nhật license...");

  try {
    const data = await rpc(
      "admin_set_license_status",
      {
        p_license_id: licenseId,
        p_status: status
      }
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
        data?.code ||
        "Cập nhật thất bại."
      );
    }

    showToast(
      status === "active"
        ? "Đã mở license."
        : "Đã khóa license."
    );

    await loadDashboard();

  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function setMaxDevices(licenseId, maxDevices) {
  setLoading(true, "Đang đổi giới hạn thiết bị...");

  try {
    const data = await rpc(
      "admin_set_max_devices",
      {
        p_license_id: licenseId,
        p_max_devices: Number(maxDevices)
      }
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
        data?.code ||
        "Cập nhật thất bại."
      );
    }

    showToast(
      `Đã đổi giới hạn thành ${maxDevices} thiết bị.`
    );

    await loadDashboard();

  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function removeDevice(deviceRowId, deviceName) {
  if (
    !confirm(
      `Gỡ "${deviceName}" khỏi license?\n\nKhách sẽ phải kích hoạt lại máy này nếu muốn sử dụng.`
    )
  ) {
    return;
  }

  setLoading(true, "Đang gỡ thiết bị...");

  try {
    const data = await rpc(
      "admin_remove_device",
      {
        p_device_row_id: deviceRowId
      }
    );

    if (!data?.success) {
      throw new Error(
        data?.code ||
        "Không thể gỡ thiết bị."
      );
    }

    showToast("Đã gỡ thiết bị.");
    await loadDashboard();

  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function setActiveTab(tabName) {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.tab === tabName
    );
  });

  document.querySelectorAll(".panel").forEach((panel) => {
    panel.hidden =
      panel.id !== `panel-${tabName}`;
  });
}

document.addEventListener("click", (event) => {
  const tab =
    event.target.closest("[data-tab]");

  if (tab) {
    setActiveTab(tab.dataset.tab);
    return;
  }

  const action =
    event.target.closest("[data-action]");

  if (!action) return;

  if (
    action.dataset.action ===
    "toggle-license"
  ) {
    setLicenseStatus(
      action.dataset.licenseId,
      action.dataset.nextStatus
    );
  }

  if (
    action.dataset.action ===
    "remove-device"
  ) {
    removeDevice(
      action.dataset.deviceRowId,
      action.dataset.deviceName
    );
  }
});

document.addEventListener("change", (event) => {
  const select =
    event.target.closest(".device-limit");

  if (!select) return;

  setMaxDevices(
    select.dataset.licenseId,
    select.value
  );
});

$("#refresh-dashboard")
  ?.addEventListener(
    "click",
    loadDashboard
  );

$("#logout-admin")
  ?.addEventListener(
    "click",
    () => {
      localStorage.removeItem(
        AUTH_STORAGE_KEY
      );

      state.session = null;

      window.location.href =
        "index.html";
    }
  );

(async function init() {
  setLoading(
    true,
    "Đang kiểm tra quyền quản trị..."
  );

  const allowed =
    await requireAdmin();

  if (!allowed) {
    setLoading(false);
    return;
  }

  await loadDashboard();
})();
