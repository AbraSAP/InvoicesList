import React, { useState, useEffect } from 'react';

const SAPInvoicesComponent = ({ customerCode = 'C20000' }) => {
  const [loginStatus, setLoginStatus] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract session cookies from response
  const extractSessionCookies = (response) => {
    const cookies = {};
    const setCookieHeader = response.headers.get("set-cookie");
    
    if (setCookieHeader) {
      const cookieStrings = setCookieHeader.split(",");
      cookieStrings.forEach(cookieString => {
        const [nameValue] = cookieString.trim().split(";");
        const [name, value] = nameValue.split("=");
        if (name && value) {
          cookies[name.trim()] = value.trim();
        }
      });
    }
    
    return cookies;
  };

  // Login to SAP B1
  const login = async () => {
    try {
      console.log("Attempting login to SAP B1...");
      
      const response = await fetch("https://service.sboweb.site/b1s/v2/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          "CompanyDB": "SBODemoIL",
          "Password": "1234",
          "UserName": "manager"
        })
      });
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Login response data:", data);
      
      const cookies = extractSessionCookies(response);
      console.log("Extracted cookies:", cookies);
      
      setLoginStatus('LOGIN SUCCESS');
      
      return {
        sessionId: data.SessionId,
        cookies: cookies
      };
    } catch (error) {
      console.error("Login error details:", error);
      setLoginStatus('LOGIN FAILED');
      setError('LOGIN FAILED');
      throw new Error("LOGIN FAILED");
    }
  };

  // Fetch invoices
  const fetchInvoices = async (loginData, customerCode) => {
    try {
      const url = `https://service.sboweb.site/b1s/v2/Invoices?$select=DocDate,DocNum,DocTotal&$filter=CardCode eq '${customerCode}'`;
      
      let cookieString = `B1SESSION=${loginData.sessionId}`;
      if (loginData.cookies.ROUTEID) {
        cookieString += `; ROUTEID=${loginData.cookies.ROUTEID}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Cookie": cookieString,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error("Fetch invoices error:", error);
      throw new Error("LOADING INVOICES FAILED");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };

  // Load invoices on component mount
  useEffect(() => {
    const loadInvoices = async () => {
      console.log("Starting login process...");
      
      try {
        // Step 1: Login
        const loginData = await login();
        console.log("Login completed successfully");
        
        // Wait 5 seconds after login success message, then load invoices
        setTimeout(async () => {
          try {
            setLoading(true);
            // Step 2: Fetch invoices
            const invoicesData = await fetchInvoices(loginData, customerCode);
            setInvoices(invoicesData);
            setLoading(false);
          } catch (error) {
            console.log("Invoice loading failed:", error.message);
            setError(error.message);
            setLoading(false);
          }
        }, 5000);
        
      } catch (error) {
        console.log("Login failed:", error.message);
        setError(error.message);
      }
    };

    loadInvoices();
  }, [customerCode]);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Customer Invoices</h1>
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Customer Code:</strong> {customerCode}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Login Status */}
        {loginStatus === 'LOGIN SUCCESS' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6 text-center font-bold">
            LOGIN SUCCESS
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading invoices...</p>
          </div>
        )}

        {/* Invoices Table */}
        {invoices.length > 0 && !loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.DocDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.DocNum || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(invoice.DocTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Invoices Message */}
        {invoices.length === 0 && !loading && !error && loginStatus === 'LOGIN SUCCESS' && (
          <div className="text-center py-8 text-gray-500">
            No invoices found for this customer.
          </div>
        )}
      </div>
    </div>
  );
};

export default SAPInvoicesComponent;
