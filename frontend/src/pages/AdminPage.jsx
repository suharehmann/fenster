import { useEffect, useState } from 'react';
import { DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Select, Space } from 'antd';
import './AdminPage.scss';
import { fetchInquiries, getExportUrl, updateInquiryStatus } from '@/api/client';

const INQUIRY_STATUS_OPTIONS = [
  { value: 'neu', label: 'Neu' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' }
];

const STATUS_FILTER_ALL_OPTION = { value: '', label: 'Alle Status' };

const EMPTY_STATUS_COUNTS = {
  neu: 0,
  in_bearbeitung: 0,
  abgeschlossen: 0
};

function countInquiriesByStatus(inquiries) {
  const counts = { ...EMPTY_STATUS_COUNTS };

  for (const inquiry of inquiries) {
    if (counts[inquiry.status] !== undefined) {
      counts[inquiry.status] += 1;
    }
  }

  return counts;
}

function formatInquiryDate(isoDate) {
  return new Date(isoDate).toLocaleString('de-DE');
}

export default function AdminPage() {
  const [filters, setFilters] = useState({ q: '', status: '' });
  const [inquiries, setInquiries] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function loadInquiries() {
    setIsLoading(true);

    try {
      const data = await fetchInquiries(filters);
      setInquiries(data.items);
      setErrorMessage('');
    } catch (requestError) {
      setErrorMessage(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  async function handleStatusChange(inquiryId, newStatus) {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      await loadInquiries();
    } catch (requestError) {
      setErrorMessage(requestError.message);
    }
  }

  function handleSearchQueryChange(event) {
    setFilters((previousFilters) => ({ ...previousFilters, q: event.target.value }));
  }

  function handleStatusFilterChange(selectedStatus) {
    setFilters((previousFilters) => ({
      ...previousFilters,
      status: selectedStatus || ''
    }));
  }

  const statusCounts = countInquiriesByStatus(inquiries);
  const statusFilterOptions = [STATUS_FILTER_ALL_OPTION, ...INQUIRY_STATUS_OPTIONS];
  const hasNoResults = inquiries.length === 0 && !isLoading;

  return (
    <section className="page page--content page--admin">
      <header className="page-hero page-hero--compact">
        <p className="page-hero__eyebrow">Intern</p>
        <h1>Admin Dashboard</h1>
        <p className="page-hero__lead">
          Anfragen aus dem Konfigurator filtern, Status pflegen und als CSV exportieren.
        </p>
      </header>

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{inquiries.length}</strong>
          <span>Gesamt</span>
        </div>
        <div className="admin-stat">
          <strong>{statusCounts.neu}</strong>
          <span>Neu</span>
        </div>
        <div className="admin-stat">
          <strong>{statusCounts.in_bearbeitung}</strong>
          <span>In Bearbeitung</span>
        </div>
        <div className="admin-stat">
          <strong>{statusCounts.abgeschlossen}</strong>
          <span>Abgeschlossen</span>
        </div>
      </div>

      <div className="content-card admin-toolbar">
        <Input
          allowClear
          placeholder="Suche Name / E-Mail"
          prefix={<SearchOutlined />}
          value={filters.q}
          onChange={handleSearchQueryChange}
          onPressEnter={loadInquiries}
        />
        <Select
          allowClear
          placeholder="Alle Status"
          value={filters.status || undefined}
          onChange={handleStatusFilterChange}
          options={statusFilterOptions}
        />
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={loadInquiries} loading={isLoading}>
            Filtern
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} href={getExportUrl()}>
            CSV Export
          </Button>
        </Space>
      </div>

      {errorMessage && <Alert type="error" showIcon message={errorMessage} />}

      <div className="content-card admin-table-card">
        {hasNoResults ? (
          <p className="admin-empty">Keine Anfragen gefunden. Passen Sie die Filter an oder laden Sie neu.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Zeitpunkt</th>
                  <th>Kunde</th>
                  <th>Produkt</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>{formatInquiryDate(inquiry.created_at)}</td>
                    <td>
                      <div className="admin-customer">
                        <strong>{inquiry.customer.full_name}</strong>
                        <span>{inquiry.customer.email}</span>
                      </div>
                    </td>
                    <td>{inquiry.product_type}</td>
                    <td>
                      <Select
                        size="small"
                        value={inquiry.status}
                        onChange={(newStatus) => handleStatusChange(inquiry.id, newStatus)}
                        options={INQUIRY_STATUS_OPTIONS}
                      />
                    </td>
                    <td>
                      <pre>{JSON.stringify(inquiry.configuration, null, 2)}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
