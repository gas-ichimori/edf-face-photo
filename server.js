const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3005;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function cleanup() {
  try {
    const now = Date.now();
    fs.readdirSync(UPLOAD_DIR).forEach(file => {
      const fp = path.join(UPLOAD_DIR, file);
      try {
        if (now - fs.statSync(fp).mtimeMs > MAX_AGE_MS) fs.unlinkSync(fp);
      } catch(e) {}
    });
  } catch(e) {}
}
cleanup();
setInterval(cleanup, 60 * 60 * 1000);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

app.post('/save-image', (req, res) => {
  try {
    const { image } = req.body;
    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const id = uuidv4();
    fs.writeFileSync(path.join(UPLOAD_DIR, `${id}.jpg`), base64, 'base64');
    const host = `${req.protocol}://${req.get('host')}`;
    res.json({ id, url: `${host}/photo/${id}` });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/photo/:id', (req, res) => {
  const id = req.params.id.replace(/[^a-zA-Z0-9-]/g, '');
  const fp = path.join(UPLOAD_DIR, `${id}.jpg`);
  if (!fs.existsSync(fp)) return res.status(404).send('Not found or expired');
  res.sendFile(fp);
});

app.get('/ping', (_req, res) => res.send('ok'));

app.listen(PORT, () => console.log(`EDF Face Photo: http://localhost:${PORT}`));
