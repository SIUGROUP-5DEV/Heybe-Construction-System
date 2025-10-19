import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Phone, User, Eye, Printer, Search } from 'lucide-react';
import Button from '../components/Button';
import Table from '../components/Table';
import SearchInput from '../components/SearchInput';
import DateFilter from '../components/DateFilter';
import SectionPrintOptions from '../components/SectionPrintOptions';
import { customersAPI, invoicesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Footer from '../components/Footer';

const CreditOverview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCreditCustomers();
    loadInvoices();
  }, []);

  const loadCreditCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll();
      const customersWithCredit = response.data.filter(c => (c.balance || 0) > 0);
      setCustomers(customersWithCredit);

      console.log('✅ Credit customers loaded:', customersWithCredit.length);
    } catch (error) {
      console.error('❌ Error loading credit customers:', error);
      showError('Load Failed', 'Failed to load customer credit data');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getAll();
      setAllInvoices(response.data);
      console.log('✅ Invoices loaded for date filtering:', response.data.length);
    } catch (error) {
      console.error('❌ Error loading invoices:', error);
    }
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  // Calculate customer balances based on filtered date range
  const calculateFilteredBalance = (customerId) => {
    let totalCredited = 0;

    // Get credit transactions within date range
    allInvoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate);
      if (invoiceDate >= dateRange.from && invoiceDate <= dateRange.to) {
        invoice.items?.forEach(item => {
          const itemCustomerId = item.customerId?._id?.toString() || item.customerId?.toString();
          if (itemCustomerId === customerId.toString() && item.paymentMethod === 'credit') {
            totalCredited += item.total || 0;
          }
        });
      }
    });

    return totalCredited;
  };

  // Filter customers based on search term and date range
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    // Include customer if they have credit transactions in the date range
    const hasTransactionsInRange = calculateFilteredBalance(customer._id) > 0;

    return matchesSearch && hasTransactionsInRange;
  }).map(customer => ({
    ...customer,
    filteredBalance: calculateFilteredBalance(customer._id)
  }));

  const totalBalance = filteredCustomers.reduce((sum, customer) => sum + (customer.filteredBalance || 0), 0);

  const columns = [
    {
      header: 'Customer Name',
      accessor: 'customerName',
      render: (value) => (
        <div className="flex items-center">
          <User className="w-4 h-4 text-blue-600 mr-2" />
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      render: (value) => (
        <div className="flex items-center">
          <Phone className="w-4 h-4 text-green-600 mr-2" />
          <span className="font-mono text-gray-700">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Credit Balance (Filtered)',
      accessor: 'filteredBalance',
      render: (value) => (
        <span className="font-bold text-red-600 text-lg">
          ${(value || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value) => (
        <Button
          onClick={() => handleViewCustomer(value)}
          variant="outline"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center">
          <Link
            to="/account-management"
            className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Overview</h1>
            <p className="text-gray-600">Customers with outstanding balances</p>
          </div>
        </div>
      </div>


      {/* Date Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 no-print">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Date Range</h3>
            <p className="text-xs text-gray-600">View credit transactions within a specific period</p>
          </div>
          <DateFilter
            dateRange={dateRange}
            onDateChange={setDateRange}
            showApplyButton={false}
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="w-10 h-10 text-red-600 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-red-900">Total Outstanding Credit</h2>
            <p className="text-red-700">Summary of all customer debts</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-red-300">
            <p className="text-sm text-red-700 mb-2">Total Customers with Credit</p>
            <p className="text-3xl font-bold text-red-600">{filteredCustomers.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-red-300">
            <p className="text-sm text-red-700 mb-2">Total Balance Owed</p>
            <p className="text-3xl font-bold text-red-600">${totalBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customers Who Owe Money</h2>
              <p className="text-gray-600 mt-1">
                {filteredCustomers.length} of {customers.length} customers with outstanding balances
              </p>
            </div>
            <div className="no-print">
              <SectionPrintOptions
                data={filteredCustomers}
                columns={columns}
                title="Credit Overview Report"
                sectionName="Credit Customers"
                dateRange={dateRange}
                balanceSummary={{
                  totalAmount: totalBalance,
                  totalPayments: 0,
                  finalBalance: totalBalance
                }}
              />
            </div>
          </div>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by customer name or phone number..."
          />
        </div>
        <div className="p-6">
          <Table
            data={filteredCustomers}
            columns={columns}
            emptyMessage="No customers with outstanding credit found."
          />
        </div>
      </div>

      {/* Total Balance Summary at Bottom */}
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Grand Total</h3>
            <p className="text-gray-600">Sum of all outstanding balances (filtered period)</p>
            <p className="text-sm text-gray-500 mt-1">
              {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Credit Balance</p>
            <p className="text-4xl font-bold text-red-600">${totalBalance.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">{filteredCustomers.length} customers</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreditOverview;
