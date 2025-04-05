const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const riderRoutes = require('./routes/riderRoutes'); // 🔹 أضف هذا السطر

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.use('/users', userRoutes);
app.use('/api/riders', riderRoutes); // 🔹 أضف هذا السطر

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
