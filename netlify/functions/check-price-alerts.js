// netlify/functions/check-price-alerts.js
// Agendada (ver netlify.toml): só dispara a função em segundo plano que
// confere os preços, porque funções agendadas têm só 30s de limite.

export const handler = async () => {
  const base = process.env.URL;
  if (!base) return { statusCode: 500, body: 'URL do site indisponível' };

  const response = await fetch(
    `${base}/.netlify/functions/check-price-alerts-background`,
    {
      method: 'POST',
      headers: process.env.CRON_SECRET
        ? { 'x-cron-secret': process.env.CRON_SECRET }
        : {},
    },
  );

  return { statusCode: response.ok ? 200 : 502 };
};
