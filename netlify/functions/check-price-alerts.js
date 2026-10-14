// netlify/functions/check-price-alerts.js
// Roda uma vez por dia (ver netlify.toml): confere o preço já salvo de cada
// produto com um alerta ativo e manda e-mail (via Resend) quando ele já
// está no preço alvo ou abaixo. Não faz scraping por conta própria — usa o
// `price` que a própria visita do usuário já mantém atualizado (ver
// src/hooks/use-product-reveal.ts), pra não duplicar a lógica de extração
// que já existe em extract.js.

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

async function sendAlertEmail({ to, productName, price, currency, link }) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(price);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Choose a Club <onboarding@resend.dev>',
      to: 'david.lerner@hotmail.com',
      subject: `O preço de ${productName} caiu!`,
      html: `
        <p>Boas notícias! <strong>${productName}</strong> está agora por <strong>${formattedPrice}</strong>.</p>
        <p><a href="${link}">Ver na loja</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend respondeu ${response.status}: ${body}`);
  }
}

export const handler = async () => {
  const db = getDb();

  const alertsSnapshot = await db
    .collection('priceAlerts')
    .where('active', '==', true)
    .get();

  let checked = 0;
  let triggered = 0;

  for (const alertDoc of alertsSnapshot.docs) {
    checked++;
    const alert = alertDoc.data();

    const productSnapshot = await db
      .doc(`users/${alert.uid}/products/${alert.productId}`)
      .get();
    if (!productSnapshot.exists) continue;

    const product = productSnapshot.data();
    if (
      typeof product.price !== 'number' ||
      product.price > alert.targetPrice
    ) {
      continue;
    }

    try {
      await sendAlertEmail({
        to: alert.email,
        productName: product.name,
        price: product.price,
        currency: product.currency,
        link: product.link,
      });
      await alertDoc.ref.update({ active: false, notifiedAt: Date.now() });
      triggered++;
    } catch (error) {
      console.error('Falha ao notificar alerta', alertDoc.id, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ checked, triggered }),
  };
};
