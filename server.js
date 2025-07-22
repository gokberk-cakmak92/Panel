
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';

const app = express();
const PORT = 3000;
const HISTORY_FILE = 'onboarding-history.json';

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
    console.log("GET Şehir listesi isteği atılıyor"); // ✅ burada

    const response = await fetch('https://testonboardingapi.payby.me/api/v1/cities', {
      headers: { Authorization: 'Basic VXNyMTpQd2Qx' }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
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

    for (const field of requiredFields) {
      const keys = field.split(".");
      let current = cleanedBody;
      for (const key of keys) {
        if (!current || current[key] === undefined || current[key] === null || (typeof current[key] === "string" && current[key].trim() === "")) {
          return res.status(400).json({ error: `Zorunlu alan eksik veya boş: ${field}` });
        }
        current = current[key];
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

    const text = await response.text();
    if (!text || text.trim() === '') {
      return res.status(502).json({ error: 'API boş yanıt verdi' });
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy POST failed', detail: error.toString() });
  }
});

app.post('/proxy/onboarding/documents/upload/:onboardingId/:documentTypeId', upload.single('file'), async (req, res) => {
  const { onboardingId, documentTypeId } = req.params;
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Dosya bulunamadı' });

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
    res.status(500).json({ error: 'Upload failed', detail: error.toString() });
  }
});

app.get('/proxy/onboarding/documents/status/:onboardingId', async (req, res) => {
  const onboardingId = req.params.onboardingId;

  // Konsola log at
  console.log("📩 [GET] Belgelerin durumu isteniyor → onboardingId:", onboardingId);

  try {
    const response = await fetch(`https://testonboardingapi.payby.me/api/v1/onboardingdocumentsstatus/${onboardingId}`, {
      headers: {
        Authorization: 'Basic VXNyMTpQd2Qx'
      }
    });

app.post('/proxy/onboarding/documents/update/:onboardingId/:documentTypeId/:documentId', upload.single('file'), async (req, res) => {
  const { onboardingId, documentTypeId, documentId } = req.params;
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Dosya bulunamadı' });

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await fetch(`https://testonboardingapi.payby.me/api/v1/onboardingdocumentsupdate/${onboardingId}/${documentTypeId}/${documentId}`, {
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
    res.status(500).json({ error: 'Update failed', detail: error.toString() });
  }
});



    const text = await response.text();

    if (!text || response.status >= 400) {
      return res.status(response.status).json({
        error: 'API hatası',
        body: text
      });
    }

    const data = JSON.parse(text);
    res.json(data);

  } catch (error) {
    res.status(500).json({
      error: 'Proxy fetch failed',
      detail: error.toString()
    });
  }
});
app.post('/save-onboarding-history', async (req, res) => {
  try {
    const { onboardingId, taxNo, companyName, email } = req.body;
    if (!onboardingId || !taxNo || !companyName || !email) {
      return res.status(400).json({ error: 'Eksik bilgi: onboardingId, taxNo, companyName, email zorunlu.' });
    }

    const record = {
      onboardingId,
      taxNo,
      companyName,
      email,
      createdAt: new Date().toISOString()
    };

    let data = [];
    if (fs.existsSync(HISTORY_FILE)) {
      const fileContent = fs.readFileSync(HISTORY_FILE, 'utf8');
      data = JSON.parse(fileContent).records || [];
    }

    const existingIndex = data.findIndex(r => r.taxNo === taxNo);
    if (existingIndex !== -1) {
      data[existingIndex] = record;
    } else {
      data.push(record);
    }

    fs.writeFileSync(HISTORY_FILE, JSON.stringify({ records: data }, null, 2));
    res.json({ message: 'Kayıt başarıyla saklandı.' });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt sırasında hata oluştu' });
  }
});

app.get('/find-onboarding', (req, res) => {
  const { taxNo } = req.query;
  if (!taxNo) return res.status(400).json({ error: 'Vergi numarası zorunludur.' });

  try {
    if (!fs.existsSync(HISTORY_FILE)) return res.status(404).json({ error: 'Kayıt bulunamadı.' });

    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')).records || [];
    const record = data.find(r => r.taxNo === taxNo);

    if (!record) return res.status(404).json({ error: 'Bu vergi numarasına ait kayıt bulunamadı.' });

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Sorgulama sırasında hata oluştu' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server çalışıyor: http://localhost:${PORT}`);
});
