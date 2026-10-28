// netlify/functions/lib/alerts-core.js
// Núcleo da checagem automática de alertas. Para cada produto que tem algum
// alerta ativo: busca o preço atual na loja (reaproveitando o handler de
// extract.js), grava o produto + um ponto no histórico de preços e avalia
// cada alerta. Alertas disparados viram notificação no site e e-mail.

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { handler as extractHandler } from '../extract.js';

const CONCURRENCY = 4;

function getDb() {
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

const escapeHtml = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

const formatMoney = (value, currency) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(value);

async function fetchCurrent(link) {
  const res = await extractHandler({
    httpMethod: 'GET',
    queryStringParameters: { url: link },
  });
  const data = JSON.parse(res.body);
  if (data.erro) return null;
  return data;
}

// roda `worker` sobre `items` com no máximo `limit` em paralelo
async function pool(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      try {
        await worker(item);
      } catch (error) {
        console.error('Falha ao processar', error);
      }
    }
  });
  await Promise.all(runners);
}

// Grava um ponto no histórico só quando o preço mudou. Se for o primeiro
// ponto, grava antes o preço antigo do produto, pra o gráfico já ter dois.
async function recordPricePoint(productRef, product, price, currency) {
  const history = productRef.collection('priceHistory');
  const last = await history.orderBy('at', 'desc').limit(1).get();
  const now = Date.now();

  if (last.empty) {
    if (typeof product.price === 'number' && product.price > 0) {
      await history.add({
        price: product.price,
        currency: product.currency ?? 'BRL',
        at: product.createdAt ?? now - 1,
      });
    }
  } else if (last.docs[0].data().price === price) {
    return;
  }
  await history.add({ price, currency, at: now });
}

async function lowestSeen(productRef, fallback) {
  const lowest = await productRef
    .collection('priceHistory')
    .orderBy('price', 'asc')
    .limit(1)
    .get();
  return lowest.empty ? fallback : lowest.docs[0].data().price;
}

// decide se o alerta dispara. `lowestBefore` é o menor preço visto ANTES
// da leitura atual.
export function shouldTrigger(alert, { price, available, lowestBefore }) {
  switch (alert.mode) {
    case 'restock':
      return available === true;
    case 'lowest':
      return typeof lowestBefore === 'number' && price < lowestBefore;
    default: {
      if (price > alert.targetPrice) return false;
      // alerta recorrente: só avisa de novo se caiu mais do que da última vez
      if (alert.repeat && typeof alert.lastNotifiedPrice === 'number') {
        return price < alert.lastNotifiedPrice;
      }
      return true;
    }
  }
}

async function sendAlertEmail({ to, product, price, previousPrice, currency, mode }) {
  if (!process.env.RESEND_API_KEY || !to) return;

  const headline =
    mode === 'restock'
      ? `${escapeHtml(product.name)} voltou ao estoque!`
      : `O preço de ${escapeHtml(product.name)} caiu!`;
  const drop =
    previousPrice && previousPrice > price
      ? Math.round(((previousPrice - price) / previousPrice) * 100)
      : 0;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="margin:0 0 16px">${headline}</h2>
      ${
        product.url
          ? `<img src="${escapeHtml(product.url)}" alt="" style="width:100%;max-height:360px;object-fit:contain;border-radius:12px;background:#f4f4f5" />`
          : ''
      }
      <p style="font-size:16px;margin:16px 0 4px">${escapeHtml(product.name)}</p>
      <p style="margin:0;font-size:24px;font-weight:700">
        ${formatMoney(price, currency)}
        ${
          drop
            ? `<span style="font-size:14px;font-weight:600;color:#16a34a"> -${drop}%</span>
               <span style="font-size:14px;font-weight:400;color:#71717a;text-decoration:line-through"> ${formatMoney(previousPrice, currency)}</span>`
            : ''
        }
      </p>
      <p style="margin:24px 0">
        <a href="${escapeHtml(product.link)}" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Ver na loja</a>
      </p>
      <p style="font-size:12px;color:#71717a">Você recebeu este e-mail porque criou um alerta de preço no Choose a Club.</p>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Choose a Club <onboarding@resend.dev>',
      to,
      subject: mode === 'restock' ? `${product.name} voltou ao estoque` : `O preço de ${product.name} caiu!`,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend respondeu ${response.status}: ${await response.text()}`);
  }
}

async function processProduct(db, { uid, productId, alerts }) {
  const productRef = db.doc(`users/${uid}/products/${productId}`);
  const snapshot = await productRef.get();
  if (!snapshot.exists) return { checked: 1, triggered: 0 };
  const product = snapshot.data();

  const current = product.link ? await fetchCurrent(product.link) : null;

  const price =
    typeof current?.preco === 'number' && current.preco > 0 ? current.preco : product.price;
  const currency = current?.moeda || product.currency || 'BRL';
  const available =
    typeof current?.disponivel === 'boolean' ? current.disponivel : product.available;

  const lowestBefore = await lowestSeen(productRef, product.price);

  if (current) {
    const updates = { price, currency };
    if (typeof available === 'boolean') updates.available = available;
    if (typeof current.precoDe === 'number') updates.priceFrom = current.precoDe;
    await productRef.update(updates);
    if (typeof price === 'number' && price > 0) {
      await recordPricePoint(productRef, product, price, currency);
    }
  }

  let triggered = 0;
  for (const alertDoc of alerts) {
    const alert = alertDoc.data();
    if (!shouldTrigger(alert, { price, available, lowestBefore })) continue;

    const previousPrice = product.priceFrom > price ? product.priceFrom : product.price;
    const notification = {
      type: alert.mode === 'restock' ? 'restock' : 'price-drop',
      productId,
      productName: product.name,
      productUrl: product.url ?? '',
      price,
      previousPrice: previousPrice ?? null,
      currency,
      read: false,
      createdAt: Date.now(),
    };
    await db.collection(`users/${uid}/notifications`).add(notification);

    // o e-mail é um extra: se falhar (ex: domínio não verificado no Resend),
    // o alerta já foi entregue no site e não deve ser reenviado
    try {
      await sendAlertEmail({
        to: alert.email,
        product: { ...product, price },
        price,
        previousPrice,
        currency,
        mode: alert.mode,
      });
    } catch (error) {
      console.error('Falha ao enviar e-mail do alerta', alertDoc.id, error);
    }

    await alertDoc.ref.update(
      alert.repeat
        ? { lastNotifiedPrice: price, notifiedAt: Date.now() }
        : { active: false, notifiedAt: Date.now() },
    );
    triggered++;
  }
  return { checked: 1, triggered };
}

export async function runAlertCheck() {
  const db = getDb();
  const snapshot = await db.collection('priceAlerts').where('active', '==', true).get();

  // agrupa por produto: um produto com vários alertas é lido uma vez só
  const groups = new Map();
  for (const alertDoc of snapshot.docs) {
    const { uid, productId } = alertDoc.data();
    const key = `${uid}/${productId}`;
    if (!groups.has(key)) groups.set(key, { uid, productId, alerts: [] });
    groups.get(key).alerts.push(alertDoc);
  }

  let checked = 0;
  let triggered = 0;
  await pool([...groups.values()], CONCURRENCY, async (group) => {
    const result = await processProduct(db, group);
    checked += result.checked;
    triggered += result.triggered;
  });

  return { products: groups.size, checked, triggered };
}
