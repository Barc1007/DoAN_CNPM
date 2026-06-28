const pool = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');

const toBool = (v) => v === 1 || v === '1' || v === true || v === 'true';

const toDateParts = (value) => {
  if (value instanceof Date) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }

  const raw = String(value).slice(0, 10);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

const diffDays = (dateStr) => {
  const todayParts = toDateParts(new Date());
  const targetParts = toDateParts(dateStr);
  if (!targetParts) return null;

  const today = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);
  const target = Date.UTC(targetParts.year, targetParts.month - 1, targetParts.day);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(value)) + ' VND';

/* ── Kiểm tra đã gửi thông báo tương tự trong 24h chưa ── */
const hasRecentGoalAlert = async (userId, goalId, level) => {
  const [rows] = await pool.query(
    `SELECT message FROM notifications
     WHERE user_id = ? AND type = 'daily_reminder'
       AND created_at >= NOW() - INTERVAL 24 HOUR`,
    [userId]
  );
  const tag = `[goal:${goalId}:${level}]`;
  return rows.some((r) => {
    const msg = decrypt(r.message, userId);
    return typeof msg === 'string' && msg.includes(tag);
  });
};

/* ── Tạo nội dung thông báo ── */
const buildGoalAlertPayload = (goal, userId, daysLeft) => {
  const name = decrypt(goal.name, userId);
  const target = Number(decrypt(goal.target_amount, userId)) || 0;
  const current = Number(decrypt(goal.current_amount, userId)) || 0;
  const progress = target > 0 ? Math.round((current / target) * 100) : 0;
  const remaining = Math.max(target - current, 0);

  let level, title, body;

  if (daysLeft < 0) {
    level = 'overdue';
    const overDays = Math.abs(daysLeft);
    title = `Mục tiêu "${name}" đã quá hạn`;
    body = `Mục tiêu đã quá hạn ${overDays} ngày. Tiến độ: ${progress}% (${formatVnd(current)} / ${formatVnd(target)}), còn thiếu ${formatVnd(remaining)}.`;
  } else if (daysLeft === 0) {
    level = 'today';
    title = `Hôm nay là hạn cuối của mục tiêu "${name}"`;
    body = `Tiến độ hiện tại: ${progress}% (${formatVnd(current)} / ${formatVnd(target)}), còn thiếu ${formatVnd(remaining)}.`;
  } else if (daysLeft <= 3) {
    level = 'near3';
    title = `Mục tiêu "${name}" còn ${daysLeft} ngày nữa là đến hạn`;
    body = `Tiến độ hiện tại: ${progress}% (${formatVnd(current)} / ${formatVnd(target)}), còn thiếu ${formatVnd(remaining)}.`;
  } else if (daysLeft <= 7) {
    level = 'near7';
    title = `Mục tiêu "${name}" còn ${daysLeft} ngày nữa là đến hạn`;
    body = `Tiến độ hiện tại: ${progress}% (${formatVnd(current)} / ${formatVnd(target)}), còn thiếu ${formatVnd(remaining)}.`;
  } else {
    return null;
  }

  const tag = `[goal:${goal.goal_id}:${level}]`;
  return { level, title, message: `${tag} ${body}` };
};

/* ── Insert notification ── */
const insertNotification = async (userId, title, message) => {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES (?, 'daily_reminder', ?, ?)`,
    [userId, encrypt(title, userId), encrypt(message, userId)]
  );
};

/* ── Hàm chính: kiểm tra tất cả goals active của 1 user ── */
const evaluateGoalDeadlines = async (userId) => {
  try {
    const [settingsRows] = await pool.query(
      'SELECT budget_reminders FROM user_settings WHERE user_id = ?',
      [userId]
    );
    const remindersEnabled = settingsRows.length === 0 || toBool(settingsRows[0].budget_reminders);
    if (!remindersEnabled) return;

    const [goals] = await pool.query(
      `SELECT goal_id, user_id, name, target_amount, current_amount, end_date, status
       FROM goals
       WHERE user_id = ? AND status = 'active' AND end_date IS NOT NULL`,
      [userId]
    );

    if (goals.length === 0) return;

    for (const goal of goals) {
      const target = Number(decrypt(goal.target_amount, userId)) || 0;
      const current = Number(decrypt(goal.current_amount, userId)) || 0;

      // Bỏ qua nếu đã hoàn thành
      if (target > 0 && current >= target) continue;

      const daysLeft = diffDays(goal.end_date);
      if (daysLeft === null) continue;

      const payload = buildGoalAlertPayload(goal, userId, daysLeft);
      if (!payload) continue;

      const alreadyNotified = await hasRecentGoalAlert(userId, goal.goal_id, payload.level);
      if (alreadyNotified) continue;

      await insertNotification(userId, payload.title, payload.message);
    }
  } catch (err) {
    console.error('[goalAlert] evaluate failed:', err.message);
  }
};

/* ── Hàm chạy cho TẤT CẢ user (dùng cho cron/interval) ── */
const evaluateAllGoalDeadlines = async () => {
  try {
    const [users] = await pool.query(
      `SELECT DISTINCT user_id FROM goals WHERE status = 'active' AND end_date IS NOT NULL`
    );

    for (const { user_id } of users) {
      await evaluateGoalDeadlines(user_id);
    }

    console.log(`[goalAlert] Checked ${users.length} user(s) at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[goalAlert] batch evaluate failed:', err.message);
  }
};

module.exports = { evaluateGoalDeadlines, evaluateAllGoalDeadlines };
