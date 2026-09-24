export const ADMIN_AUTH_SECRET = 'idoost_admin_2026_secure';

export async function fetchAdminApi(action: string, method: 'GET' | 'POST' = 'GET', body?: any) {
  const url = method === 'GET' 
    ? `/api/admin?action=${action}${body ? '&' + new URLSearchParams(body).toString() : ''}`
    : `/api/admin`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_AUTH_SECRET}`,
    },
    body: method === 'POST' ? JSON.stringify({ action, ...body }) : undefined,
  });

  return res.json();
}
