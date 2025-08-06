import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, DollarSign, Calendar, Filter, Printer, Edit, Eye, CreditCard, FileText, Trash2, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import Button from '../components/Button';
import Table from '../components/Table';
import DateFilter from '../components/DateFilter';
import InvoiceModal from '../components/InvoiceModal';
import { customersAPI, invoicesAPI, paymentsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Footer from '../components/Footer';

const CustomerProfile = () => {
  const { id } = useParams();
  const { showError } = useToast();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [showModal, setShowModal] = useState(false);
  const [showViewPaymentModal, setShowViewPaymentModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState({
    paymentNo: '',
    paymentDate: '',
    amount: '',
    description: ''
  });
  
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  // Load customer data and transactions from database
  useEffect(() => {
    if (id) {
      loadCustomerData();
      loadTransactions();
      loadPayments();
    }
  }, [id]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getById(id);
      setCustomer(response.data);
      console.log('✅ Customer data loaded:', response.data);
    } catch (error) {
      console.error('❌ Error loading customer:', error);
      showError('Load Failed', 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // Load all invoices and filter customer transactions
      const response = await invoicesAPI.getAll();
      const allInvoices = response.data;
      
      // Find transactions for this customer
      const customerTransactions = [];
      
      allInvoices.forEach(invoice => {
        invoice.items?.forEach(item => {
          if (item.customerId?._id === id || item.customerId === id) {
            customerTransactions.push({
              id: `${invoice._id}-${item._id}`,
              invoiceNo: invoice.invoiceNo,
              carName: invoice.carId?.carName || 'Unknown Car',
              itemName: item.itemId?.itemName || 'Unknown Item',
              quantity: item.quantity || 0,
              price: item.price || 0,
              total: item.total || 0,
             
              date: invoice.invoiceDate,
              paymentMethod: item.paymentMethod || 'cash',
              description: item.description || ''
            });
          }
        });
      });
      
      setTransactions(customerTransactions);
      console.log('✅ Customer transactions loaded:', customerTransactions);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      showError('Load Failed', 'Failed to load transaction data');
      setTransactions([]);
    }
  };

  const loadPayments = async () => {
    try {
      // Load all payments and filter by customer
      const response = await paymentsAPI.getAll();
      const customerPayments = response.data.filter(payment => 
        payment.customerId?._id === id || payment.customerId === id
      );
      
      setPayments(customerPayments);
      console.log('✅ Customer payments loaded:', customerPayments);
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      showError('Load Failed', 'Failed to load payment data');
      setPayments([]);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.carName.toLowerCase().includes(searchTerm.toLowerCase());
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    
    return matchesSearch && matchesDateRange;
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const paymentDate = new Date(payment.paymentDate);
    const matchesDateRange = paymentDate >= dateRange.from && paymentDate <= dateRange.to;
    
    return matchesSearch && matchesDateRange;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleApplyFilter = () => {
    console.log('Applying customer profile filter with:', {
      searchTerm,
      dateRange
    });
    
    alert(`Filter applied for ${customer?.customerName} with ${filteredTransactions.length} transactions and ${filteredPayments.length} payments found`);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowViewPaymentModal(true);
    
    // Set edit payment data
    setEditPaymentData({
      paymentNo: payment.paymentNo || '',
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
      amount: payment.amount || '',
      description: payment.description || ''
    });
  };
  
  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setEditPaymentData({
      paymentNo: payment.paymentNo || '',
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
      amount: payment.amount || '',
      description: payment.description || ''
    });
    setShowEditPaymentModal(true);
  };

  const handleEditPaymentChange = (e) => {
    const { name, value } = e.target;
    setEditPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    
    if (!editPaymentData.amount || !editPaymentData.paymentDate) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }
    
    try {
      // Update payment in database
      const updatedPayment = {
        ...selectedPayment,
        paymentDate: editPaymentData.paymentDate,
        amount: parseFloat(editPaymentData.amount),
        description: editPaymentData.description
      };
      
      // Call API to update payment
      await paymentsAPI.update(selectedPayment._id, updatedPayment);
      
      showSuccess('Payment Updated', 'Payment has been updated successfully');
      
      // Close modal and refresh data
      setShowEditPaymentModal(false);
      loadPayments();
      
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      showError('Update Failed', 'Failed to update payment. Please try again.');
    }
  };


  const handleViewInvoice = (invoiceNo) => {
    setSelectedInvoice(invoiceNo);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeletePayment = async (payment) => {
    if (window.confirm(`Are you sure you want to delete this payment of $${payment.amount}?`)) {
      try {
        setLoading(true);
        await paymentsAPI.delete(payment._id);
        console.log('✅ Payment deleted:', payment._id);
        showSuccess('Payment Deleted', `Payment of $${payment.amount} has been deleted successfully`);
        loadPayments();
      } catch (error) {
        console.error('❌ Error deleting payment:', error);
        showError('Delete Failed', error.response?.data?.error || 'Failed to delete payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditInvoice = (invoiceNo) => {
    setSelectedInvoice(invoiceNo);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const transactionColumns = [
    {
      header: 'Invoice No',
      accessor: 'invoiceNo',
      render: (value) => (
        <span className="font-mono text-blue-600">{value}</span>
      )
    },
    {
      header: 'Car Name',
      accessor: 'carName'
    },
    {
      header: 'Item Name',
      accessor: 'itemName'
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value) => (
        <span className="text-gray-600">{value || 'No description'}</span>
      )
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (value) => (
        <span className="font-semibold">{value}</span>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value) => (
        <span className="font-semibold text-green-600">${value}</span>
      )
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (value) => (
        <span className="font-semibold text-blue-600">${value}</span>
      )
    },
   
    {
      header: 'Date',
      accessor: 'date',
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      header: 'Payment',
      accessor: 'paymentMethod',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'cash' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'invoiceNo',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewInvoice(value)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditInvoice(value)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Invoice"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const paymentColumns = [
    {
      header: 'Date',
      accessor: 'paymentDate', 
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'receive' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'receive' ? 'Payment Received' : 'Payment Out'}
        </span>
      )
    },
    {
      header: 'Payment No',
      accessor: 'paymentNo',
      render: (value) => (
        <span className="font-mono text-blue-600 font-medium">
          {value || payment.paymentNo || 'N/A'}
        </span>
      )
    },
    {
      header: 'Invoice No',
      accessor: 'invoiceNo',
      render: (value) => (
        <span className="font-mono text-blue-600">{value || 'N/A'}</span>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value) => (
        <span className="text-gray-700">{value || 'No description'}</span>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (value, row) => (
        <span className={`font-semibold ${
          row.type === 'receive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {row.type === 'receive' ? '-' : '+'}${value.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Balance Impact',
      accessor: 'amount',
      render: (value, row) => (
        <div className="text-xs text-gray-600">
          {row.type === 'receive' 
            ? 'Reduced balance' 
            : 'Added to balance'
          }
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewPayment(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.invoiceNo && (
            <button
              onClick={() => handleViewInvoice(row.invoiceNo)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="View Invoice"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeletePayment(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Payment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Not Found</h3>
        <p className="text-gray-600 mb-4">The requested customer could not be found.</p>
        <Link to="/customers">
          <Button>Back to Customers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/customers"
            className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.customerName}</h1>
            <p className="text-gray-600">Customer Profile & History</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-5 h-5 mr-2" />
          Print
        </Button>
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <User className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="text-lg font-semibold text-gray-900">{customer.customerName}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Phone className="w-12 h-12 text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="text-lg font-semibold font-mono">{customer.phoneNumber || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <DollarSign className="w-12 h-12 text-red-600 mr-4" />
            <div>
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className={`text-lg font-semibold ${
                (customer.balance || 0) === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${(customer.balance || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {(customer.balance || 0) === 0 ? 'No outstanding debt' : 'Amount owed by customer'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 How Customer Balance Works</h4>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• <strong>Credit Purchases:</strong> When customer buys on credit, amount is added to their balance (debt)</p>
          <p>• <strong>Cash Purchases:</strong> When customer pays cash, no balance change (recorded as transaction only)</p>
          <p>• <strong>Payments Received:</strong> When customer pays their debt, amount is deducted from balance</p>
          <p>• <strong>Current Balance:</strong> ${(customer.balance || 0).toLocaleString()} = Total amount customer owes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search invoice, item, or car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <DateFilter 
            dateRange={dateRange} 
            onDateChange={setDateRange}
            showApplyButton={true}
            onApplyFilter={handleApplyFilter}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Transaction History
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {filteredTransactions.length}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment History
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {filteredPayments.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'transactions' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
              <p className="text-gray-600 mb-4">
                All purchases made by {customer.customerName} - showing {filteredTransactions.length} transactions
              </p>
              <Table 
                data={filteredTransactions} 
                columns={transactionColumns}
                emptyMessage="No transactions found for the selected criteria."
              />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
              <p className="text-gray-600 mb-4">
                All payments received from {customer.customerName} - showing {filteredPayments.length} payments
              </p>
              <Table 
                data={filteredPayments} 
                columns={paymentColumns}
                emptyMessage="No payments found for the selected criteria."
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredTransactions.reduce((sum, t) => sum + t.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cash Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredTransactions
                  .filter(t => t.paymentMethod === 'cash')
                  .reduce((sum, t) => sum + t.total, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credit Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                ${filteredTransactions
                  .filter(t => t.paymentMethod === 'credit')
                  .reduce((sum, t) => sum + t.total, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            </div>
          </div>
        </div>

<Footer/>

      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        invoiceNo={selectedInvoice}
        mode={modalMode}
      />
      
      {/* View Payment Modal */}
      {showViewPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowViewPaymentModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full ${
                    selectedPayment.type === 'receive' ? 'bg-green-100' : 'bg-red-100'
                  } flex-shrink-0`}>
                    {selectedPayment.type === 'receive' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">
                      {selectedPayment.type === 'receive' ? 'Payment Received' : 'Payment Out'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Number:</span>
                    <span className="font-medium text-blue-600">{selectedPayment.paymentNo || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className={`font-semibold ${
                      selectedPayment.type === 'receive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedPayment.type === 'receive' ? '+' : '-'}${selectedPayment.amount.toLocaleString()}
                    </span>
                  </div>
                  
                  {selectedPayment.customerId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">
                        {customer.customerName || 'Unknown Customer'}
                      </span>
                    </div>
                  )}
                  
                  {selectedPayment.carId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Car:</span>
                      <span className="font-medium">
                        {cars?.find(c => c._id === selectedPayment.carId)?.carName || 'Unknown Car'}
                      </span>
                    </div>
                  )}
                  
                  {selectedPayment.accountMonth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Month:</span>
                      <span className="font-medium">{selectedPayment.accountMonth}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium text-gray-800">{selectedPayment.description || 'No description'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowViewPaymentModal(false)}>Close</Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleEditPayment(selectedPayment)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {selectedPayment && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showEditPaymentModal ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Edit Payment</h3>
                </div>
                <button
                  onClick={() => setShowEditPaymentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdatePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Number
                </label>
                <input
                  name="paymentNo"
                  value={editPaymentData.paymentNo}
                  onChange={handleEditPaymentChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  name="paymentDate"
                  type="date"
                  value={editPaymentData.paymentDate}
                  onChange={handleEditPaymentChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  value={editPaymentData.amount}
                  onChange={handleEditPaymentChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  name="description"
                  value={editPaymentData.description}
                  onChange={handleEditPaymentChange}
                  className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Payment description"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditPaymentModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default CustomerProfile;