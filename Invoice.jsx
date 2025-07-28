import React from 'react';
import InvoicesList from '../components/InvoicesList';

export default function InvoicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <InvoicesList />
    </div>
  );
}
