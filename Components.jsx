
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, DollarSign, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const customerCode = 'C20000'; // Hardcoded customer code

  // Updated fixed session ID as requested
  const sessionId = "B1SESSION=[]; ROUTEID=.node2";

  useEffect(() => {
    fetchInvoices();
  }, []); // Removed customerCode dependency as it's now constant

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://service.sboweb.site/b1s/v2/Invoices?$select=DocDate,DocNum,DocTotal&$filter=CardCode eq '${customerCode}'`,
        {
          headers: {
            'Cookie': sessionId,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.value || []);
    } catch (err) {
      setError('Failed to load invoice data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-red-800 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Customer Invoices
            </h1>
            <p className="text-slate-600 mt-2">
              Showing invoices for customer: 
              <Badge variant="outline" className="ml-2 bg-slate-50 text-slate-700 border-slate-200">
                {customerCode}
              </Badge>
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{invoices.length} invoices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center space-x-2 text-slate-800">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>Invoice Details</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                    <TableHead className="font-semibold text-slate-700 py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Document Date</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Document Number</span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Total Amount</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-3">
                            <FileText className="w-12 h-12 text-slate-300" />
                            <p className="text-slate-500 font-medium">No invoices found</p>
                            <p className="text-slate-400 text-sm">
                              No invoices available for customer {customerCode}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice, index) => (
                        <motion.tr
                          key={invoice.DocNum || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
                        >
                          <TableCell className="py-4 px-6">
                            <span className="text-slate-700 font-medium">
                              {formatDate(invoice.DocDate)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                #{invoice.DocNum}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <span className="text-slate-900 font-bold text-lg">
                              {formatAmount(invoice.DocTotal)}
                            </span>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      {invoices.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Summary</h3>
              <p className="text-slate-300 text-sm">Total invoices for {customerCode}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatAmount(invoices.reduce((sum, inv) => sum + (inv.DocTotal || 0), 0))}
              </p>
              <p className="text-slate-300 text-sm">{invoices.length} invoices</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
