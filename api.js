const DEFAULT_TIMEOUT = 8000; // 8 saniye timeout
const MAX_RETRIES = 3; // Maksimum 3 deneme
const AUTH_HEADER = { Authorization: "Basic VXNyMTpQd2Qx" };

// Genel fetch fonksiyonu: timeout ve retry desteği ile
async function fetchWithTimeoutAndRetry(url, options = {}, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response;
    } catch (error) {
      clearTimeout(id);
      if (attempt === retries) {
        throw error; // Son denemede hata at
      }
      await new Promise(res => setTimeout(res, 500)); // 0.5 saniye bekle ve tekrar dene
    }
  }
}

// Şehir listesini çek
async function fetchCities() {
  try {
    const res = await fetchWithTimeoutAndRetry('http://localhost:3000/proxy/cities', {
      headers: AUTH_HEADER,
    });
    const data = await res.json();
    return data.citiesListDto || [];
  } catch (error) {
    console.error("fetchCities hata:", error);
    return [];
  }
}

// İlçe listesini çek
async function fetchDistricts(cityCode) {
  try {
    const res = await fetchWithTimeoutAndRetry(`http://localhost:3000/proxy/districts/${cityCode}`, {
      headers: AUTH_HEADER,
    });
    const data = await res.json();
    return data.districtListDto || data.districsListDto || [];
  } catch (error) {
    console.error("fetchDistricts hata:", error);
    return [];
  }
}

// Onboarding formunu gönder
async function submitOnboarding(payload) {
  try {
    const res = await fetchWithTimeoutAndRetry('http://localhost:3000/proxy/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error("submitOnboarding hata:", error);
    return { errorCode: -1, errorDesc: error.message };
  }
}

// Evrak yükleme (FormData ile)
async function uploadDocuments(onboardingId, documentTypeId, formData) {
  try {
    const res = await fetchWithTimeoutAndRetry(`http://localhost:3000/proxy/onboarding/documents/upload/${onboardingId}/${documentTypeId}`, {
      method: "POST",
      body: formData,
      // Authorization header sorun yaratıyorsa kaldırılabilir
      // headers: {
      //   'Authorization': 'Basic VXNyMTpQd2Qx'
      // }
    });
    return await res.json();
  } catch (error) {
    console.error("uploadDocuments hata:", error);
    return { errorCode: -1, errorDesc: error.message };
  }
}

// Evrak durumunu sorgulama
async function fetchDocumentsStatus(onboardingId) {
  try {
    const res = await fetchWithTimeoutAndRetry(`http://localhost:3000/proxy/onboarding/documents/status/${onboardingId}`, {
      headers: AUTH_HEADER,
    });
    const data = await res.json();
    return data; // Beklenen format: [{ documentTypeId, status, comment }, ...]
  } catch (error) {
    console.error("fetchDocumentsStatus hata:", error);
    return [];
  }
}

// Evrak güncelleme (reddedilen belge için)
async function updateDocument(onboardingId, documentTypeId, documentId, formData) {
  try {
    const res = await fetchWithTimeoutAndRetry(
      `http://localhost:3000/proxy/onboarding/documents/update/${onboardingId}/${documentTypeId}/${documentId}`,
      {
        method: "POST",
        body: formData,
        headers: AUTH_HEADER,
      }
    );
    return await res.json();
  } catch (error) {
    console.error("updateDocument hata:", error);
    return { errorCode: -1, errorDesc: error.message };
  }
}
