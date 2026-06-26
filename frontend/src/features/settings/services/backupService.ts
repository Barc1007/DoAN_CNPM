import apiClient from '../../../services/apiClient';

export const exportBackup = async (): Promise<{ filename: string; content: string }> => {
  const [wallets, transactions, budgets, goals, categories] = await Promise.all([
    apiClient.get('/wallets').then((r) => r.data.result),
    apiClient.get('/transactions').then((r) => r.data.result),
    apiClient.get('/budgets').then((r) => r.data.result),
    apiClient.get('/goals').then((r) => r.data.result),
    apiClient.get('/categories').then((r) => r.data.result),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { wallets, transactions, budgets, goals, categories },
  };

  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  return { filename: `student-money-backup-${stamp}.json`, content: JSON.stringify(payload, null, 2) };
};

export const downloadBackup = async () => {
  const { filename, content } = await exportBackup();
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};