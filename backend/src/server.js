require('dotenv').config();
const app = require('./app');
require('./config/db');
const { evaluateAllGoalDeadlines } = require('./services/goalAlert.service');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API base URL: http://localhost:${PORT}/api`);

  // Kiểm tra deadline mục tiêu: lần đầu sau 30s, sau đó mỗi 1 giờ
  setTimeout(() => {
    evaluateAllGoalDeadlines();
    setInterval(evaluateAllGoalDeadlines, 60 * 60 * 1000);
  }, 30 * 1000);
});
