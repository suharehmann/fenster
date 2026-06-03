const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function parseResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'Serverfehler');
  }
  return response.json();
}

export async function submitInquiry(payload) {
  const response = await fetch(`${API_BASE}/inquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function saveDraft(payload) {
  const response = await fetch(`${API_BASE}/inquiries/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function submitContact(payload) {
  const response = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function fetchInquiries({ q = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);

  const response = await fetch(`${API_BASE}/admin/inquiries?${params.toString()}`);
  return parseResponse(response);
}

export async function updateInquiryStatus(id, status) {
  const response = await fetch(`${API_BASE}/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return parseResponse(response);
}

export function getExportUrl() {
  return `${API_BASE}/admin/inquiries/export`;
}
