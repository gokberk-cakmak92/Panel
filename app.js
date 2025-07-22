// Global scoped elements
let messageDiv;
let docsContainer;
let citySelect;
let districtSelect;
let uploadBtn;
let updateUploadBtn;
let resultContainer;

function showMessage(text, type = "info") {
  if (!messageDiv) return;
  messageDiv.textContent = text;
  messageDiv.className = "";
  if (type === "success") {
    messageDiv.style.backgroundColor = "#d1e7dd";
    messageDiv.style.border = "1px solid #badbcc";
    messageDiv.style.color = "#0f5132";
  } else if (type === "error") {
    messageDiv.style.backgroundColor = "#f8d7da";
    messageDiv.style.border = "1px solid #f5c2c7";
    messageDiv.style.color = "#842029";
  } else {
    messageDiv.style.backgroundColor = "#cff4fc";
    messageDiv.style.border = "1px solid #b6effb";
    messageDiv.style.color = "#055160";
  }
  if (text) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function clearInlineErrors() {
  document.querySelectorAll(".text-danger").forEach((el) => el.remove());
}

function toggleSpinner(show, submitBtn) {
  if (!submitBtn) return;
  if (show) {
    submitBtn.disabled = true;
    if (!submitBtn.querySelector(".spinner-border")) {
      const spinner = document.createElement("span");
      spinner.className = "spinner-border spinner-border-sm ms-2";
      spinner.setAttribute("role", "status");
      spinner.setAttribute("aria-hidden", "true");
      submitBtn.appendChild(spinner);
    }
  } else {
    submitBtn.disabled = false;
    const spinner = submitBtn.querySelector(".spinner-border");
    if (spinner) spinner.remove();
  }
}

function isValidTCKN(tckn) {
  if (!/^\d{11}$/.test(tckn)) return false;
  if (tckn[0] === "0") return false;
  const digits = tckn.split("").map(Number);
  const sumOdd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const sumEven = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = ((sumOdd * 7) - sumEven) % 10;
  if (digit10 !== digits[9]) return false;
  const sumFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  return sumFirst10 % 10 === digits[10];
}

function isValidPhone(phone) {
  return /^5\d{9}$/.test(phone);
}

function isValidIban(iban) {
  const trimmed = iban.replace(/\s/g, "").toUpperCase();
  return /^TR\d{24}$/.test(trimmed);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatPhoneForAPI(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) return digits;
  if (digits.length === 10 && digits.startsWith("5")) return "90" + digits;
  return digits;
}

async function fetchCities(AUTH_HEADER) {
  try {
    const res = await fetch("http://localhost:3000/proxy/cities", { headers: AUTH_HEADER });
    if (!res.ok) throw new Error("Şehirler alınamadı");
    const data = await res.json();
    return data.citiesListDto || [];
  } catch (err) {
    showMessage("Şehirler yüklenirken hata oluştu.", "error");
    return [];
  }
}
async function fetchDistricts(cityCode, AUTH_HEADER) {
  try {
    const res = await fetch(`http://localhost:3000/proxy/districts/${cityCode}`, { headers: AUTH_HEADER });
    if (!res.ok) throw new Error("İlçeler alınamadı");
    const data = await res.json();
    return data.districtListDto || data.districsListDto || [];
  } catch (err) {
    showMessage("İlçeler yüklenirken hata oluştu.", "error");
    return [];
  }
}

async function submitOnboarding(payload, AUTH_HEADER) {
  const res = await fetch("http://localhost:3000/proxy/onboarding", {
    method: "POST",
    headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (res.status === 409) {
      const errorData = await res.json();
      return {
        isConflict: true,
        errorCode: errorData.errorCode || 409,
        errorDesc: errorData.errorDesc || errorData.error || "Conflict: başvuru mevcut.",
        onboardingId: errorData.onboardingId || null,
        documentTypes: errorData.documentTypes || null,
      };
    }
    throw new Error("Onboarding isteği başarısız oldu.");
  }
  return await res.json();
}

async function fetchDocumentsStatus(onboardingId, AUTH_HEADER) {
  try {
    const res = await fetch(`http://localhost:3000/proxy/onboarding/documents/status/${onboardingId}`, { headers: AUTH_HEADER });
    if (!res.ok) throw new Error("Evrak durumu alınamadı");
    const data = await res.json();
    data.forEach((docStatus) => {
      const statusDiv = document.getElementById(`status_${docStatus.documentTypeId}`);
      if (statusDiv) {
        let statusText = "";
        let color = "";
        switch (docStatus.status) {
          case "approved":
            statusText = "Onaylandı";
            color = "green";
            break;
          case "pending":
            statusText = "Beklemede";
            color = "orange";
            break;
          case "rejected":
            statusText = "Revize Talebi";
            color = "red";
            break;
          default:
            statusText = docStatus.status;
            color = "black";
        }
        statusDiv.textContent = `${statusText}${docStatus.comment ? ` - Not: ${docStatus.comment}` : ""}`;
        statusDiv.style.color = color;
      }
    });
    return data;
  } catch (err) {
    showMessage("Evrak durumu alınırken hata oluştu.", "error");
    return [];
  }
}

function createFileInputs(documentTypes, AUTH_HEADER) {
  docsContainer.innerHTML = `
  <div class="alert alert-info">Başvurunuz alındı. Lütfen aşağıdaki belgeleri yükleyiniz.</div>
  <h5 class="mt-3">Yüklenmesi Gereken Belgeler</h5>
  `;
  documentTypes.forEach((doc) => {
    const div = document.createElement("div");
    div.className = "mb-3";

    const label = document.createElement("label");
    label.textContent = doc.documentDetail;
    label.htmlFor = `doc_${doc.documentTypeId}`;
    label.className = "form-label";

    const input = document.createElement("input");
    input.type = "file";
    input.id = `doc_${doc.documentTypeId}`;
    input.name = `doc_${doc.documentTypeId}`;
    input.dataset.documentTypeId = doc.documentTypeId;
    input.className = "form-control";

    const status = document.createElement("div");
    status.id = `status_${doc.documentTypeId}`;
    status.style.marginTop = "5px";
    status.style.fontSize = "0.9rem";

    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(status);
    docsContainer.appendChild(div);
  });

  if (uploadBtn && uploadBtn.remove) uploadBtn.remove();
  uploadBtn = document.createElement("button");
  uploadBtn.textContent = "Belgeleri Yükle";
  uploadBtn.className = "btn btn-secondary mt-3";
  uploadBtn.type = "button";
  uploadBtn.disabled = false;
  uploadBtn.addEventListener("click", () => uploadDocuments(AUTH_HEADER));
  docsContainer.appendChild(uploadBtn);
}

async function uploadDocuments(AUTH_HEADER) {
  showMessage("");
  if (uploadBtn) uploadBtn.disabled = true;
  const fileInputs = docsContainer.querySelectorAll("input[type=file]");
  if (!window.lastOnboardingId) {
    showMessage("Onboarding ID bulunamadı. Lütfen önce formu gönderin.", "error");
    if (uploadBtn) uploadBtn.disabled = false;
    return;
  }
  const onboardingId = window.lastOnboardingId;
  let successCount = 0;
  let failCount = 0;
  for (const input of fileInputs) {
    if (input.files.length === 0) continue;
    const documentTypeId = input.dataset.documentTypeId;
    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`http://localhost:3000/proxy/onboarding/documents/upload/${onboardingId}/${documentTypeId}`, {
        method: "POST",
        headers: AUTH_HEADER,
        body: formData,
      });
      if (!res.ok) throw new Error("Dosya yükleme başarısız");
      await res.json();
      successCount++;
      document.getElementById(`status_${documentTypeId}`).textContent = "Yüklendi";
      document.getElementById(`status_${documentTypeId}`).style.color = "green";
    } catch (err) {
      failCount++;
      document.getElementById(`status_${documentTypeId}`).textContent = "Hata";
      document.getElementById(`status_${documentTypeId}`).style.color = "red";
    }
  }
  if (uploadBtn) uploadBtn.disabled = false;
  if (successCount === 0 && failCount > 0) {
    showMessage(`${failCount} belge yüklenemedi.`, "error");
  } else if (successCount > 0 && failCount > 0) {
    showMessage(`${successCount} belge yüklendi, ${failCount} belge yüklenemedi.`, "info");
  } else if (successCount > 0) {
    showMessage(`${successCount} belge başarıyla yüklendi.`, "success");
  }
}

async function uploadUpdatedDocuments(onboardingId, AUTH_HEADER) {
  showMessage("");
  if (updateUploadBtn) updateUploadBtn.disabled = true;
  const fileInputs = resultContainer.querySelectorAll("input[type=file]");
  let successCount = 0;
  let failCount = 0;
  for (const input of fileInputs) {
    if (input.files.length === 0) continue;
    const documentTypeId = input.dataset.documentTypeId;
    const documentId = input.dataset.documentId;
    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      await updateDocument(onboardingId, documentTypeId, documentId, formData);
      successCount++;
      document.getElementById(`status_${documentTypeId}`).textContent = "Yüklendi";
      document.getElementById(`status_${documentTypeId}`).style.color = "green";
    } catch (err) {
      failCount++;
      document.getElementById(`status_${documentTypeId}`).textContent = "Hata";
      document.getElementById(`status_${documentTypeId}`).style.color = "red";
    }
  }
  if (updateUploadBtn) updateUploadBtn.disabled = false;
  if (successCount === 0 && failCount > 0) {
    showMessage(`${failCount} belge yüklenemedi.`, "error");
  } else if (successCount > 0 && failCount > 0) {
    showMessage(`${successCount} belge yüklendi, ${failCount} belge yüklenemedi.`, "info");
  } else if (successCount > 0) {
    showMessage(`${successCount} belge başarıyla yüklendi.`, "success");
  }
  await fetchDocumentsStatus(onboardingId, AUTH_HEADER);
}

async function saveOnboardingHistory({ onboardingId, taxNo, companyName, email }) {
  try {
    await fetch('http://localhost:3000/save-onboarding-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingId, taxNo, companyName, email })
    });
  } catch (error) {
    console.error("Geçmiş kayıt hatası:", error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  citySelect = document.getElementById("city");
  districtSelect = document.getElementById("district");
  const onboardingForm = document.getElementById("onboardingForm");
  const submitBtn = document.getElementById("submitBtn");
  const updateForm = document.getElementById("updateForm");
  resultContainer = document.getElementById('resultContainer');
  const AUTH_HEADER = { Authorization: "Basic VXNyMTpQd2Qx" };

  if (!onboardingForm || !submitBtn || !citySelect || !districtSelect) {
    console.error("Gerekli DOM elementleri bulunamadı.");
    return;
  }

  messageDiv = document.createElement("div");
  messageDiv.id = "formMessage";
  messageDiv.style.marginBottom = "15px";
  messageDiv.style.fontWeight = "bold";
  onboardingForm.insertAdjacentElement("beforebegin", messageDiv);

  docsContainer = document.createElement("div");
  docsContainer.id = "documentsContainer";
  docsContainer.style.marginTop = "20px";
  submitBtn.parentNode.insertAdjacentElement("beforebegin", docsContainer);

  (async () => {
    const cities = await fetchCities(AUTH_HEADER);
    citySelect.innerHTML = "";
    cities.sort((a, b) => a.city.localeCompare(b.city)).forEach((city) => {
      const option = document.createElement("option");
      option.value = city.cityCode;
      option.textContent = city.city;
      citySelect.appendChild(option);
    });
    citySelect.removeAttribute("disabled");
  })();

  citySelect.addEventListener("change", async () => {
    const cityCode = citySelect.value;
    districtSelect.innerHTML = "<option>Yükleniyor...</option>";
    districtSelect.disabled = true;
    const districts = await fetchDistricts(cityCode, AUTH_HEADER);
    districtSelect.innerHTML = "";
    if (districts.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "İlçe bulunamadı";
      districtSelect.appendChild(opt);
    } else {
      districts.sort((a, b) => a.district.localeCompare(b.district)).forEach((district) => {
        const opt = document.createElement("option");
        opt.value = district.districtCode;
        opt.textContent = district.district;
        districtSelect.appendChild(opt);
      });
    }
    districtSelect.disabled = false;
  });

  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultContainer.innerHTML = '<div class="alert alert-info">Sorgulanıyor...</div>';
    resultContainer.classList.remove('d-none');
    const taxNo = document.getElementById('taxNoUpdate').value.trim();
    try {
      const res = await fetch(`http://localhost:3000/find-onboarding?taxNo=${encodeURIComponent(taxNo)}`);
      if (!res.ok) throw new Error('Kayıt bulunamadı');
      const record = await res.json();
      const onboardingId = record.onboardingId;
      if (!onboardingId) throw new Error('Onboarding ID bulunamadı');
      const statuses = await fetchDocumentsStatus(onboardingId, AUTH_HEADER);
      resultContainer.innerHTML = '';
      let hasRejected = false;
      statuses.forEach((doc) => {
        const div = document.createElement('div');
        div.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = doc.documentDetail || `Belge ${doc.documentTypeId}`;
        label.htmlFor = `upd_${doc.documentTypeId}`;
        div.appendChild(label);

        if (doc.status === 'rejected') {
          const input = document.createElement('input');
          input.type = 'file';
          input.className = 'form-control';
          input.id = `upd_${doc.documentTypeId}`;
          input.dataset.documentTypeId = doc.documentTypeId;
          if (doc.documentId) input.dataset.documentId = doc.documentId;
          if (doc.onboardingDocumentId) input.dataset.documentId = doc.onboardingDocumentId;
          div.appendChild(input);
          hasRejected = true;
        }

        const statusDiv = document.createElement('div');
        statusDiv.id = `status_${doc.documentTypeId}`;
        statusDiv.style.marginTop = '5px';
        statusDiv.style.fontSize = '0.9rem';
        let statusText = '';
        let color = '';
        switch (doc.status) {
          case 'approved':
            statusText = 'Onaylandı';
            color = 'green';
            break;
          case 'pending':
            statusText = 'Beklemede';
            color = 'orange';
            break;
          case 'rejected':
            statusText = 'Revize Talebi';
            color = 'red';
            break;
          default:
            statusText = doc.status;
            color = 'black';
        }
        statusDiv.textContent = `${statusText}${doc.comment ? ` - Not: ${doc.comment}` : ''}`;
        statusDiv.style.color = color;
        div.appendChild(statusDiv);
        resultContainer.appendChild(div);
      });

      if (hasRejected) {
        if (updateUploadBtn && updateUploadBtn.remove) updateUploadBtn.remove();
        updateUploadBtn = document.createElement('button');
        updateUploadBtn.textContent = 'Belgeleri Yükle';
        updateUploadBtn.className = 'btn btn-secondary mt-3';
        updateUploadBtn.type = 'button';
        updateUploadBtn.addEventListener('click', () => uploadUpdatedDocuments(onboardingId, AUTH_HEADER));
        resultContainer.appendChild(updateUploadBtn);
      }
    } catch (err) {
      resultContainer.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  });

  onboardingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearInlineErrors();
    showMessage("");
    toggleSpinner(true, submitBtn);
    try {
  const phoneInput = document.getElementById("companyPhoneNumber");
  if (phoneInput) {
    let rawPhone = phoneInput.value.trim();
    if (!rawPhone.startsWith("90")) {
      if (rawPhone.startsWith("0")) rawPhone = rawPhone.slice(1);
      if (rawPhone.startsWith("5")) rawPhone = "90" + rawPhone;
      phoneInput.value = rawPhone;
    }
  }

  // Diğer form verilerini alma ve gönderme işlemleri burada olacak
} finally {
  toggleSpinner(false, submitBtn);
}
  });
});

window.createFileInputs = createFileInputs;
window.fetchDocumentsStatus = fetchDocumentsStatus;
