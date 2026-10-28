// netlify/functions/check-price-alerts-background.js
// Função em segundo plano (até 15 min, ao contrário das agendadas, que têm
// 30s): faz o trabalho pesado de conferir todos os preços. É disparada por
// check-price-alerts.js.

import { runAlertCheck } from './lib/alerts-core.js';

export const handler = async (event) => {
  const secret = process.env.CRON_SECRET;
  if (secret && event.headers?.['x-cron-secret'] !== secret) {
    return { statusCode: 401 };
  }

  const result = await runAlertCheck();
  console.log('check-price-alerts', result);
  return { statusCode: 200 };
};
