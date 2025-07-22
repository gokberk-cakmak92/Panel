function showMessage(text, type = "info") {
    messageDiv.textContent = text;
    messageDiv.className = "";
    if (type === "success") {
      messageDiv.style.backgroundColor = "#d1e7dd";
      messageDiv.style.border = "1px solid #badbcc";
      messageDiv.style.color = "#0f5132";

function clearInlineErrors() {
  document.querySelectorAll(".text-danger").forEach(el => el.remove());

window.scrollTo(0, 0);

let citySelect = null;
let districtSelect = null;
let uploadBtn = null;

document.addEventListener("DOMContentLoaded", () => {
  citySelect = document.getElementById("city");
  districtSelect = document.getElementById("district");
  const onboardingForm = document.getElementById("onboardingForm");
  const submitBtn = document.getElementById("submitBtn");
  const AUTH_HEADER = { Authorization: "Basic VXNyMTpQd2Qx" };
  if (!onboardingForm || !submitBtn || !citySelect || !districtSelect) {
    console.error("Gerekli DOM elementleri bulunamadı.");
    return;

  const messageDiv = document.createElement("div");
  messageDiv.id = "formMessage";
  messageDiv.style.marginBottom = "15px";
  messageDiv.style.fontWeight = "bold";

  if (onboardingForm.isConnected) {
    onboardingForm.insertAdjacentElement("beforebegin", messageDiv);
  } else {
    document.body.prepend(messageDiv);

  const docsContainer = document.createElement("div");
  docsContainer.id = "documentsContainer";
  docsContainer.style.marginTop = "20px";

  if (submitBtn.parentNode && submitBtn.isConnected) {
    submitBtn.parentNode.insertAdjacentElement("beforebegin", docsContainer);
  } else {
    document.body.appendChild(docsContainer);

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

if (text) {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showInlineError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const next = input.nextElementSibling;
  if (next && next.classList.contains("text-danger")) {
    next.remove();

  const errorDiv = document.createElement("div");
  errorDiv.className = "text-danger mt-1";
  errorDiv.textContent = message;
  input.insertAdjacentElement("afterend", errorDiv);

  function toggleSpinner(show) {
    if (show) {
      submitBtn.disabled = true;
      if (!submitBtn.querySelector(".spinner-border")) {
        const spinner = document.createElement("span");
        spinner.className = "spinner-border spinner-border-sm ms-2";
        spinner.setAttribute("role", "status");
        spinner.setAttribute("aria-hidden", "true");
        submitBtn.appendChild(spinner);
    } else {
      submitBtn.disabled = false;
      const spinner = submitBtn.querySelector(".spinner-border");
      if (spinner) spinner.remove();
  }

  async function fetchCities() {
  try {
    const res = await fetch("http://localhost:3000/proxy/cities", {
      headers: AUTH_HEADER,
    });
    if (!res.ok) throw new Error("Şehirler alınamadı.");

    const data = await res.json();
    const list = data.citiesListDto || [];

    citySelect.innerHTML = ""; // "Yükleniyor..." yazısını temizle

    list.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.cityCode;
      option.textContent = city.city;
      citySelect.appendChild(option);
    });

    citySelect.removeAttribute("disabled");
  } catch (err) {
    showMessage("Şehirler yüklenirken hata oluştu.", "error");
    console.error("fetchCities error:", err);
    citySelect.innerHTML = `<option>Yüklenemedi</option>`;
  }

  async function fetchDistricts(cityCode) {
  try {
    // URL'yi template literal ile doğru şekilde yazdık
    const res = await fetch(`http://localhost:3000/proxy/districts/${cityCode}`, {
      headers: AUTH_HEADER, 
    });
    
    // Hata durumu kontrolü
    if (!res.ok) throw new Error("İlçeler alınamadı.");
    
    // JSON verisini almak
    const data = await res.json();
    
    // districtListDto veya districsListDto kontrolü yapıp döndürme
    return data.districtListDto || data.districsListDto || [];
  } catch (err) {
    // Hata mesajını gösterme
    showMessage("İlçeler yüklenirken hata oluştu.", "error");
    
    // Boş bir array döndürme
    return [];
}
    


 async function submitOnboarding(payload) {
  const res = await fetch("http://localhost:3000/proxy/onboarding", {
    method: "POST",
    headers: {
  ...AUTH_HEADER,
  "Content-Type": "application/json"
    },
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
    throw new Error("Onboarding isteği başarısız oldu.");

  return await res.json();

  
        

  async function fetchDocumentsStatus(onboardingId) {
    try {
      const res = await fetch(
  `http://localhost:3000/proxy/onboarding/documents/status/${onboardingId}`,
        {
          headers: AUTH_HEADER,
          },
      );
      if (!res.ok) throw new Error("Evrak durumu alınamadı.");

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
          statusDiv.textContent = `${statusText}${docStatus.comment ? ` - Not: ${docStatus.comment}` : ""}`;
          statusDiv.style.color = color;
      });
    } catch (err) {
      showMessage("Evrak durumu alınırken hata oluştu.", "error");
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
    if (sumFirst10 % 10 !== digits[10]) return false;

    return true;

  function isValidPhone(phone) {
    return /^5\d{9}$/.test(phone);
function isValidIban(iban) {
  const trimmed = iban.replace(/\s/g, "").toUpperCase();
  return /^TR\d{24}$/.test(trimmed);  // Sadece Türkiye IBAN kontrolü
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
  function formatPhoneForAPI(phone) {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 12 && digits.startsWith("90")) {
      return digits;

    if (digits.length === 10 && digits.startsWith("5")) {
      return "90" + digits;

    return digits;

  // Şehir ve İlçe dropdownları doldur
  (async () => {
    const cities = await fetchCities();
if (!Array.isArray(cities)) return; // güvenlik kontrolü
cities
  .sort((a, b) => a.city.localeCompare(b.city))
  .forEach((city) => {
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
    const districts = await fetchDistricts(cityCode);
    districtSelect.innerHTML = "";
    if (districts.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "İlçe bulunamadı";
      districtSelect.appendChild(opt);
    } else {
      districts
        .sort((a, b) => a.district.localeCompare(b.district))
        .forEach((district) => {
          const opt = document.createElement("option");
          opt.value = district.districtCode;
          opt.textContent = district.district;
          districtSelect.appendChild(opt);
        });
    districtSelect.disabled = false;
  });

  });

  onboardingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
clearInlineErrors();
    showMessage("");
    toggleSpinner(true);

    try {
      const tcknRaw1 = document.getElementById("authorizedTCKN1").value;
      const tckn1 = tcknRaw1.replace(/\D/g, "").trim();
     if (!isValidTCKN(tckn1)) {
  showMessage("Lütfen geçerli 11 haneli bir TCKN giriniz.", "error");
  showInlineError("authorizedTCKN1", "11 haneli geçerli bir TCKN giriniz.");
  toggleSpinner(false);
  return;

      const phoneRaw1 = document.getElementById("authorizedPhone1").value;
      const phoneDigitsOnly1 = phoneRaw1.replace(/\D/g, "").slice(-10);
      if (!isValidPhone(phoneDigitsOnly1)) {
        showMessage("Lütfen geçerli bir telefon numarası giriniz.", "error");
	showInlineError("authorizedPhone1", "Telefon numarası 5XXXXXXXXX formatında olmalı.");
        toggleSpinner(false);
        return;

const iban = document.getElementById("iban").value.trim();
if (!isValidIban(iban)) {
  showMessage("Geçerli bir IBAN giriniz. (TR ile başlamalı ve 26 haneli olmalı)", "error");
  showInlineError("iban", "TR ile başlayan 26 haneli geçerli bir IBAN giriniz.");
  toggleSpinner(false);
  return;
const email1 = document.getElementById("authorizedEmail1").value.trim();
if (!isValidEmail(email1)) {
  showMessage("Yetkili Kişi 1 için geçerli bir e-posta adresi giriniz.", "error");
  showInlineError("authorizedEmail1", "Geçerli bir e-posta adresi giriniz.");
  toggleSpinner(false);
  return;
      const formattedPhone1 = formatPhoneForAPI(phoneDigitsOnly1);

      const tcknRaw2 = document.getElementById("authorizedTCKN2").value || "";
      let tckn2 = tcknRaw2.replace(/\D/g, "").trim();
      if (tckn2 !== "" && !isValidTCKN(tckn2)) {
        showMessage("Yetkili Kişi 2 için geçerli 11 haneli bir TCKN giriniz.", "error");
        showInlineError("authorizedTCKN2", "11 haneli geçerli bir TCKN giriniz.");
        toggleSpinner(false);
        return;
      if (tckn2 === "") tckn2 = null;

      const phoneRaw2 = document.getElementById("authorizedPhone2").value || "";
      const phoneDigitsOnly2 = phoneRaw2.replace(/\D/g, "").slice(-10);
      if (phoneRaw2 && !isValidPhone(phoneDigitsOnly2)) {
        showMessage("Yetkili Kişi 2 için geçerli bir telefon numarası giriniz.", "error");
	showInlineError("authorizedPhone2", "Telefon numarası 5XXXXXXXXX formatında olmalı.");
        toggleSpinner(false);
        return;
const email2 = document.getElementById("authorizedEmail2").value.trim();
if (email2 && !isValidEmail(email2)) {
  showMessage("Yetkili Kişi 2 için geçerli bir e-posta adresi giriniz.", "error");
  showInlineError("authorizedEmail2", "Geçerli bir e-posta adresi giriniz.");
  toggleSpinner(false);
  return;
      const formattedPhone2 = phoneRaw2 ? formatPhoneForAPI(phoneDigitsOnly2) : null;

      const bpTcknRaw = document.getElementById("businessPartnerTCKN1").value || "";
      let bpTckn = bpTcknRaw.replace(/\D/g, "").trim();
      if (bpTckn !== "" && !isValidTCKN(bpTckn)) {
        showMessage("İş Ortağı için geçerli 11 haneli bir TCKN giriniz.", "error");
        showInlineError("businessPartnerTCKN1", "11 haneli geçerli bir TCKN giriniz.");
        toggleSpinner(false);
        return;

      if (bpTckn === "") bpTckn = null;

      const bpPhoneRaw = document.getElementById("businessPartnerPhone1").value || "";
      const bpPhoneDigitsOnly = bpPhoneRaw.replace(/\D/g, "").slice(-10);
      const formattedBpPhone = bpPhoneRaw ? formatPhoneForAPI(bpPhoneDigitsOnly) : null;

      const companyPhoneRaw = document.getElementById("companyPhoneNumber").value;
      const companyPhoneDigitsOnly = companyPhoneRaw.replace(/\D/g, "").slice(-10);
      const formattedCompanyPhone = formatPhoneForAPI(companyPhoneDigitsOnly);

      const businessContactPhoneRaw = document.getElementById("businessContactPhone").value || "";
      const businessContactPhoneDigitsOnly = businessContactPhoneRaw.replace(/\D/g, "").slice(-10);
      const formattedBusinessContactPhone = businessContactPhoneRaw
        ? formatPhoneForAPI(businessContactPhoneDigitsOnly)
        : null;

      const technicalContactPhoneRaw = document.getElementById("technicalContactPhone").value || "";
      const technicalContactPhoneDigitsOnly = technicalContactPhoneRaw.replace(/\D/g, "").slice(-10);
      const formattedTechnicalContactPhone = technicalContactPhoneRaw
        ? formatPhoneForAPI(technicalContactPhoneDigitsOnly)
        : null;

      const payload = {
        companyType: parseInt(document.getElementById("companyType").value, 10),
        product_SanalPOS: document.getElementById("product_SanalPOS").checked,
        product_MobilOdeme: document.getElementById("product_MobilOdeme").checked,
        product_FizikselPOS: document.getElementById("product_FizikselPOS").checked,
        product_SoftPOS: document.getElementById("product_SoftPOS").checked,
        product_ParaTransferi: document.getElementById("product_ParaTransferi").checked,
        companyDetail: {
          companyName: document.getElementById("companyName").value,
          iban: document.getElementById("iban").value,
          tradeRegisterNo: document.getElementById("tradeRegisterNo").value,
          countryCode: "TR",
          address: document.getElementById("address").value,
          zipCode: document.getElementById("zipCode").value,
          city: document.getElementById("city").value,
          district: document.getElementById("district").value,
          taxOffice: document.getElementById("taxOffice").value,
          taxNo: document.getElementById("taxNo").value,
          naceCode: document.getElementById("naceCode").value,
          website: document.getElementById("website").value,
          companyPhoneNumber: formattedCompanyPhone,
        },
        authorizedContact1: {
          name: document.getElementById("authorizedName1").value,
          surname: document.getElementById("authorizedSurname1").value,
          email: document.getElementById("authorizedEmail1").value,
          phoneNumber: formattedPhone1,
          tckn: tckn1,
          birthDate: document.getElementById("authorizedBirthDate1").value,
          representationType: parseInt(document.getElementById("representationType1").value, 10),
        },
        authorizedContact2: {
          name: document.getElementById("authorizedName2").value || null,
          surname: document.getElementById("authorizedSurname2").value || null,
          email: document.getElementById("authorizedEmail2").value || null,
          phoneNumber: formattedPhone2,
          tckn: tckn2,
          birthDate: document.getElementById("authorizedBirthDate2").value || null,
          representationType: document.getElementById("representationType2").value
            ? parseInt(document.getElementById("representationType2").value, 10)
            : null,
        },
        businessPartner1: {
          name: document.getElementById("businessPartnerName1").value || null,
          surname: document.getElementById("businessPartnerSurname1").value || null,
          email: document.getElementById("businessPartnerEmail1").value || null,
          phoneNumber: formattedBpPhone,
          tckn: bpTckn,
          birthDate: document.getElementById("businessPartnerBirthDate1").value || null,
          address: document.getElementById("businessPartnerAddress1").value || null,
        },
        businessContact: {
          name: document.getElementById("businessContactName").value || null,
          surname: document.getElementById("businessContactSurname").value || null,
          email: document.getElementById("businessContactEmail").value || null,
          phoneNumber: formattedBusinessContactPhone,
        },
        technicalContact: {
          name: document.getElementById("technicalContactName").value || null,
          surname: document.getElementById("technicalContactSurname").value || null,
          email: document.getElementById("technicalContactEmail").value || null,
          phoneNumber: formattedTechnicalContactPhone,
        },
      };

      
      window.localOnboardingData = payload;
window.lastOnboardingId = null; // daha sonra gelecek
showMessage("Form verisi geçici olarak kaydedildi. Lütfen belgeleri yükleyin.", "info");

// Belge yükleme ekranı oluştur
        // Konsola yazdır
const result = await submitOnboarding(payload);
      console.log("Onboarding API sonucu:", result);
      if (result.errorCode === 1000) {
  showMessage("Başarıyla kayıt oluşturuldu. Lütfen belgeleri yükleyin.", "success");
  window.lastOnboardingId = result.onboardingId;
  createFileInputs(result.documentTypes);
        const submitBtn = document.getElementById("submitBtn");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = "Form Kaydedildi";
        } // ← eksik olan kısım bu
  await saveOnboardingHistory({
    onboardingId: result.onboardingId,
    taxNo: payload.companyDetail.taxNo,
    companyName: payload.companyDetail.companyName,
    email: payload.authorizedContact1.email
});
      } else if (result.isConflict && result.onboardingId) {
        showMessage("Bu şirket için zaten kayıt mevcut. Belgeleri yüklemek için devam edin.", "info");
        window.lastOnboardingId = result.onboardingId;
        createFileInputs(result.documentTypes || []);
        fetchDocumentsStatus(result.onboardingId);
      } else {
  const desc = result?.errorDesc || "Bilinmeyen bir hata oluştu.";
  if (result.errorCode === 409 && !result.onboardingId) {
    showMessage("Bu şirket için daha önce başvuru yapılmış ancak belge yükleme mümkün değil. Lütfen destekle iletişime geçin.", "error");
  } else {
    showMessage(`Hata: ${desc}`, "error");
}
    } catch (error) {
      console.error("Onboarding isteği gönderilirken hata:", error);
      showMessage("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
    } finally {
      toggleSpinner(false);
  });

const updateForm = document.getElementById('updateForm');
if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const taxNo = document.getElementById('taxNoUpdate').value.trim();
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.classList.remove('d-none');
  resultContainer.innerHTML = ''; // eski içerikleri temizle
  

  try {
    const response = await fetch(`/onboarding/${taxNo}`);
    if (!response.ok) throw new Error('Kayıt bulunamadı');

    const data = await response.json();
    const onboardingId = data.onboardingId;
window.lastOnboardingId = onboardingId;
try {
  const resDocs = await fetch(`http://localhost:3000/proxy/onboarding/documents/status/${onboardingId}`, {
    headers: AUTH_HEADER,
  });


  if (!resDocs.ok) throw new Error("Belge listesi alınamadı");
  const documentList = await resDocs.json();

  const select = document.getElementById("documentType");
  select.innerHTML = '<option value="">Seçiniz</option>'; // temizle

  documentList
  .filter((doc) => doc.status === "rejected")
  .forEach((doc) => {
    const opt = document.createElement("option");
    opt.value = doc.documentTypeId;
    opt.textContent = doc.documentDetail;
    select.appendChild(opt);
  });
} catch (err) {
  console.error("Belge tipi doldurma hatası:", err);
  const select = document.getElementById("documentType");
  select.innerHTML = '<option value="">Belge tipi alınamadı</option>';
    resultContainer.classList.remove('d-none');
    resultContainer.innerHTML = `
  <div class="alert alert-success">Onboarding ID bulundu: <strong>${onboardingId}</strong></div>
  <form id="uploadForm" class="mt-3">
    <input type="hidden" name="onboardingId" value="${onboardingId}" />
    <div class="mb-3">
      <label for="documentType" class="form-label">Belge Tipi</label>
      <select class="form-select" name="documentType" id="documentType" required>
        <option value="">Yükleniyor...</option>
      </select>
    </div>
    <div class="mb-3">
      <label for="documentFile" class="form-label">Dosya Yükle</label>
      <input type="file" class="form-control" name="documentFile" id="documentFile" required />
    </div>
    <button type="submit" class="btn btn-success">Belge Güncelle</button>
  </form>
`;

  } catch (err) {
    resultContainer.classList.remove('d-none');
    resultContainer.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
});
// Belge güncelleme formu gönderildiğinde dosyayı yükle
document.getElementById("uploadForm")?.addEventListener("submit", async function (e) {
  if (e.target && e.target.id === 'uploadForm') {
    e.preventDefault();

    const form = e.target;
    const onboardingId = form.querySelector('input[name="onboardingId"]').value;
    const documentTypeId = form.querySelector('select[name="documentType"]').value;
    const fileInput = form.querySelector('input[name="documentFile"]');
    const resultContainer = document.getElementById('resultContainer');

    if (!documentTypeId || documentTypeId === "" || !fileInput.files.length) {
      resultContainer.innerHTML = `<div class="alert alert-warning">Lütfen belge tipi seçin ve dosya yükleyin.</div>`;
      return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:3000/proxy/onboarding/documents/upload/${onboardingId}/${documentTypeId}`, {
        method: 'POST',
        body: formData,
        headers: AUTH_HEADER,
      });

      if (!res.ok) throw new Error('Yükleme başarısız');

      resultContainer.innerHTML = `<div class="alert alert-success">Belge başarıyla yüklendi.</div>`;
    } catch (err) {
      resultContainer.innerHTML = `<div class="alert alert-danger">Yükleme hatası: ${err.message}</div>`;
  }  // ← uploadForm submit event handler kapanışı
});  // ← document.getElementById("uploadForm") listener kapanışı

window.createFileInputs = createFileInputs;
window.fetchDocumentsStatus = fetchDocumentsStatus;
};

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

function createFileInputs(documentTypes) {
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

if (uploadBtn && uploadBtn.remove) uploadBtn.remove(); // Önceki varsa temizle

uploadBtn = document.createElement("button");
uploadBtn.textContent = "Belgeleri Yükle";
uploadBtn.className = "btn btn-secondary mt-3";
uploadBtn.type = "button";
uploadBtn.disabled = false;
uploadBtn.addEventListener("click", uploadDocuments);
docsContainer.appendChild(uploadBtn);

  async function uploadDocuments() {
  showMessage("");

  if (uploadBtn) uploadBtn.disabled = true; // Pasifleştir

  const fileInputs = docsContainer.querySelectorAll("input[type=file]");

  if (!window.lastOnboardingId) {
    showMessage("Onboarding ID bulunamadı. Lütfen önce formu gönderin.", "error");
    if (uploadBtn) uploadBtn.disabled = false; // Geri aktif yap
    return;

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

      if (!res.ok) throw new Error("Dosya yükleme başarısız.");
      const result = await res.json();

      successCount++;
      document.getElementById(`status_${documentTypeId}`).textContent = "Yüklendi";
      document.getElementById(`status_${documentTypeId}`).style.color = "green";
    } catch (err) {
      console.error(`Upload error for documentTypeId=${documentTypeId}, onboardingId=${onboardingId}`, err);
      failCount++;
      document.getElementById(`status_${documentTypeId}`).textContent = "Hata";
      document.getElementById(`status_${documentTypeId}`).style.color = "red";
  }

  if (uploadBtn) uploadBtn.disabled = false; // ✅ Geri aktif yap

  if (successCount === 0 && failCount > 0) {
  showMessage(`${failCount} belge yüklenemedi.`, "error");
} else if (successCount > 0 && failCount > 0) {
  showMessage(`${successCount} belge yüklendi, ${failCount} belge yüklenemedi.`, "info");
} else if (successCount > 0) {
  showMessage(`${successCount} belge başarıyla yüklendi.`, "success");
}
window.createFileInputs = createFileInputs;