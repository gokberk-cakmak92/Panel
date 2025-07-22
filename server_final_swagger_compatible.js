// ✅ TAM GÜNCELLENMİŞ server.js (409 durumu detaylı handle edildi)

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import FormData from 'form-data';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = cleanObject(value);
      } else {
        cleaned[key] = value;
      }
    }
  });
  return cleaned;
}

app.get('/proxy/cities', async (req, res) => {
  try {
    const response = await fetch('https://testonboardingapi.payby.me/api/v1/cities', {
      headers: { Authorization: 'Basic VXNyMTpQd2Qx' }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Cities fetch error:', error);
    res.status(500).json({ error: 'Fetch failed', detail: error.toString() });
  }
});

app.get('/proxy/districts/:cityCode', async (req, res) => {
  const cityCode = req.params.cityCode;
  try {
    const response = await fetch(`https://testonboardingapi.payby.me/api/v1/districts/${cityCode}`, {
      headers: { Authorization: 'Basic VXNyMTpQd2Qx' }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Districts fetch error:', error);
    res.status(500).json({ error: 'Fetch failed', detail: error.toString() });
  }
});

app.post('/proxy/onboarding', async (req, res) => {
  try {
    const cleanedBody = cleanObject(req.body);

    const requiredFields = [
      "companyType",
      "companyDetail.companyName",
      "companyDetail.iban",
      "companyDetail.tradeRegisterNo",
      "companyDetail.countryCode",
      "companyDetail.address",
      "companyDetail.zipCode",
      "companyDetail.city",
      "companyDetail.district",
      "companyDetail.taxOffice",
      "companyDetail.taxNo",
      "companyDetail.naceCode",
      "companyDetail.website",
      "companyDetail.companyPhoneNumber",
      "authorizedContact1.name",
      "authorizedContact1.surname",
      "authorizedContact1.email",
      "authorizedContact1.phoneNumber",
      "authorizedContact1.tckn",
      "authorizedContact1.birthDate",
      "authorizedContact1.representationType"
    ];

    function checkField(path, obj) {
      const keys = path.split(".");
      let current = obj;
      for (const key of keys) {
        if (!current || current[key] === undefined || current[key] === null || (typeof current[key] === "string" && current[key].trim() === "")) {
          return false;
        }
        current = current[key];
      }
      return true;
    }

    for (const field of requiredFields) {
      if (!checkField(field, cleanedBody)) {
        return res.status(400).json({ error: `Zorunlu alan eksik veya boş: ${field}` });
      }
    }

    const response = await fetch('https://testonboardingapi.payby.me/api/v1/onboarding', {
      method: 'POST',
      headers: {
        Authorization: 'Basic VXNyMTpQd2Qx',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanedBody)
    });

    if (response.status === 409) {
      const errorData = await response.json();
      console.warn("409 CONFLICT - onboardingId:", errorData.onboardingId);

      if (!errorData.onboardingId) {
        return res.status(409).json({
          errorCode: 409,
          errorDesc: 'Bu şirket için başvuru yapılmış ancak onboardingId alınamıyor. Lütfen destekle iletişime geçin.',
          onboardingId: null,
          documentTypes: []
        });
      }

      return res.status(409).json({
        errorCode: 409,
        errorDesc: errorData.errorDesc || 'Conflict: Onboarding data already exists.',
        onboardingId: errorData.onboardingId,
        documentTypes: errorData.documentTypes || []
      });
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return res.status(502).json({ error: 'API boş yanıt verdi' });
    }

    const data = JSON.parse(text);
    console.log("Onboarding API yanıtı:", data);

    if (data.errorCode === 5501) {
      if (!data.onboardingId) {
        console.warn('API onboardingId null dönüyor ama 5501 hatası var.');
        return res.status(409).json({ error: 'Başvuru mevcut ancak onboardingId alınamadı. Destek ile iletişime geçin.' });
      }
      return res.json({
        errorCode: data.errorCode,
        errorDesc: data.errorDesc,
        onboardingId: data.onboardingId,
        documentTypes: data.documentTypes || []
      });
    }

    res.json(data);

  } catch (error) {
    console.error('Proxy POST hatası:', error);
    res.status(500).json({ error: 'Proxy POST failed', detail: error.toString() });
  }
});

app.get('/proxy/onboarding/documents/:onboardingId', async (req, res) => {
  const onboardingId = req.params.onboardingId;
  try {
    const response = await fetch(`https://testonboardingapi.payby.me/api/v1/onboarding/documents/${onboardingId}`, {
      headers: { Authorization: 'Basic VXNyMTpQd2Qx' }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ error: 'Fetch failed', detail: error.toString() });
  }
});

app.get('/proxy/onboarding/documents/status/:onboardingId', async (req, res) => {
  const onboardingId = req.params.onboardingId;
  console.log("📨 Gelen onboardingId:", onboardingId);

  try {
    const response = await fetch(`https://testonboardingapi.payby.me/api/v1/onboarding/documents/status/${onboardingId}`, {
      headers: { Authorization: 'Basic VXNyMTpQd2Qx' }
    });

    const statusCode = response.status;
    const text = await response.text();

    console.log("📥 Paybyme response status:", statusCode);
    console.log("📄 Paybyme response body:", text);

    if (!text || statusCode >= 400) {
      return res.status(statusCode).json({
        error: 'Paybyme API yanıtı başarısız',
        statusCode,
        body: text
      });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error('❌ Documents status fetch error:', error);
    res.status(500).json({ error: 'Proxy fetch failed', detail: error.toString() });
  }
});
app.post('/proxy/onboarding/documents/upload/:onboardingId/:documentTypeId', upload.single('file'), async (req, res) => {
  const { onboardingId, documentTypeId } = req.params;

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Dosya bulunamadı' });
    }

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await fetch(`https://testonboardingapi.payby.me/api/v1/onboardingdocuments/${onboardingId}/${documentTypeId}`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic VXNyMTpQd2Qx',
        ...formData.getHeaders()
      },
      body: formData
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Documents upload error:', error);
    res.status(500).json({ error: 'Upload failed', detail: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server çalışıyor: http://localhost:${PORT}`);
});
