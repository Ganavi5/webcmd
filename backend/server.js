import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'labellens-api' });
});

app.post('/investigate', async (req, res) => {
  const { url } = req.body;
  res.json({
    message: 'Investigate endpoint working',
    url,
    product: { name: 'Demo Product', brand: 'Demo Brand' },
    ingredients: ['Whey', 'Maltodextrin'],
    claims: ['No Added Sugar'],
    nutrition: { protein: '24g' },
    log: ['Exploring website...', 'Opening hidden sections...', 'Extracting product data...'],
    isFirstVisit: true
  });
});

app.listen(PORT, () => {
  console.log(`LabelLens API running on http://localhost:${PORT}`);
});