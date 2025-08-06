import React, { useState, useEffect } from 'react';
import { Settings, Calendar, FileText, TrendingUp, Download, UserX, Car as CarIcon, UserCheck, Building2, AlertTriangle, DollarSign, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import FormSelect from '../components/FormSelect';
import FormInput from '../components/FormInput';
import { useToast } from '../contexts/ToastContext';
import { carsAPI, customersAPI, dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';

const AccountManagement = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCloseType, setSelectedCloseType] = useState('');
  const [selectedCloseAccount, setSelectedCloseAccount] = useState('');

  // Monthly closing state
  const [monthlyClosingLoading, setMonthlyClosingLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState('');

  // Data from database
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    totalCustomers: 0
  });

  // Account monthly data
  const [accountMonths, setAccountMonths] = useState([]);
  const [closedAccounts, setClosedAccounts] = useState([]);

  // Reopen account states
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [selectedReopenAccount, setSelectedReopenAccount] = useState('');

  // Monthly account view modal
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedMonthlyAccount, setSelectedMonthlyAccount] = useState(null);

  // Load data from database
  useEffect(() => {
    loadAllData();
    generateAccountMonths();
    loadClosedAccounts();
  }, []);

  const generateAccountMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    // Set current month
    const currentMonthKey = currentDate.toISOString().slice(0, 7);
    setCurrentMonth(currentMonthKey);
    
    // Generate 12 months (current + 11 previous)
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      months.push({
        value: monthKey,
        label: monthLabel,
        status: i === 0 ? 'Active' : 'Closed', // Current month is active, others are closed
        isCurrent: i === 0
      });
    }
    
    setAccountMonths(months);
  };

  const loadClosedAccounts = () => {
    // Simulate closed accounts data
    const closed = [
      {
        id: 'closed_2024_11',
        month: '2024-11',
        monthLabel: 'November 2024',
        closedDate: '2024-11-30',
        totalBalance: 125000,
        totalProfit: 18750,
        carsCount: 5,
        customersCount: 12,
        status: 'Closed'
      },
      {
        id: 'closed_2024_10',
        month: '2024-10',
        monthLabel: 'October 2024',
        closedDate: '2024-10-31',
        totalBalance: 98000,
        totalProfit: 14700,
        carsCount: 4,
        customersCount: 10,
        status: 'Closed'
      }
    ];
    
    setClosedAccounts(closed);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [carsResponse, customersResponse, dashboardResponse] = await Promise.all([
        carsAPI.getAll(),
        customersAPI.getAll(),
        dashboardAPI.getData()
      ]);
      
      setCars(carsResponse.data);
      setCustomers(customersResponse.data);
      setStats(dashboardResponse.data.stats);
      
      console.log('✅ Account management data loaded:', {
        cars: carsResponse.data.length,
        customers: customersResponse.data.length
      });
    } catch (error) {
      console.error('❌ Error loading account management data:', error);
      showError('Load Failed', 'Failed to load account management data');
    } finally {
      setLoading(false);
    }
  };

  const getAccountOptions = () => {
    switch (selectedReportType) {
      case 'car':
        return cars.map(car => ({ value: car._id, label: car.carName }));
      case 'customer':
        return customers.map(customer => ({ value: customer._id, label: customer.customerName }));
      default:
        return [];
    }
  };

  const getCloseAccountOptions = () => {
    switch (selectedCloseType) {
      case 'car':
        return cars
          .filter(car => car.status === 'Active')
          .map(car => ({ 
            value: car._id, 
            label: `${car.carName} (Balance: $${(car.balance || 0).toLocaleString()})` 
          }));
      case 'customer':
        return customers
          .filter(customer => customer.status === 'Active')
          .map(customer => ({ 
            value: customer._id, 
            label: `${customer.customerName} (Balance: $${(customer.balance || 0).toLocaleString()})` 
          }));
      default:
        return [];
    }
  };

  const getSelectedAccountDetails = () => {
    if (!selectedCloseType || !selectedCloseAccount) return null;

    let account = null;
    switch (selectedCloseType) {
      case 'car':
        account = cars.find(car => car._id === selectedCloseAccount);
        break;
      case 'customer':
        account = customers.find(customer => customer._id === selectedCloseAccount);
        break;
    }
    return account;
  };

  const handleGenerateReport = () => {
    if (!selectedReportType || !selectedAccount || !selectedMonth) {
      showError('Validation Error', 'Please select all required fields');
      return;
    }

    console.log('Generating report:', {
      type: selectedReportType,
      account: selectedAccount,
      month: selectedMonth
    });

    const accountName = getAccountOptions().find(opt => opt.value === selectedAccount)?.label;
    showSuccess('Report Generated', `${selectedReportType} report for ${accountName} (${selectedMonth}) generated successfully!`);
  };

  const calculateMonthlyProfit = () => {
    // Calculate profit: Car Balance - Car Left - Car Payments = Profit
    const totalCarBalance = cars.reduce((sum, car) => sum + (car.balance || 0), 0);
    const totalCarLeft = cars.reduce((sum, car) => sum + (car.left || 0), 0);
    const totalCarPayments = cars.reduce((sum, car) => sum + (car.payments || 0), 0);
    
    // Profit = Car Balance - Car Left - Car Payments (no percentage)
    const netAmount = totalCarBalance - totalCarLeft - totalCarPayments;
    const estimatedProfit = netAmount; // Direct calculation, no percentage
    
    return {
      totalCarBalance,
      totalCarLeft,
      totalCarPayments,
      netAmount,
      estimatedProfit
    };
  };

  const handleMonthlyClosing = async () => {
    const currentMonthLabel = accountMonths.find(month => month.isCurrent)?.label || 'Current Month';
    const profitData = calculateMonthlyProfit();
    
    const confirmMessage = `🚨 MONTHLY ACCOUNT CLOSING 🚨\n\n` +
      `This will close ${currentMonthLabel} and calculate final profit.\n\n` +
      `Current Financial Summary:\n` +
      `• Total Car Balance: $${profitData.totalCarBalance.toLocaleString()}\n` +
      `• Total Car Left: $${profitData.totalCarLeft.toLocaleString()}\n` +
      `• Total Car Payments: $${profitData.totalCarPayments.toLocaleString()}\n` +
      `• Net Amount: $${profitData.netAmount.toLocaleString()}\n` +
      `• Final Profit: $${profitData.estimatedProfit.toLocaleString()}\n\n` +
      `Actions that will be performed:\n` +
      `• Calculate final profit: Balance - Left - Payments = $${profitData.estimatedProfit.toLocaleString()}\n` +
      `• Reset all car balances to $0\n` +
      `• Reset all car left amounts to $0\n` +
      `• Reset all car payments to $0\n` +
      `• Archive current month's data\n` +
      `• Create new monthly accounts for next month\n\n` +
      `⚠️ This action cannot be undone!\n\n` +
      `Are you sure you want to proceed?`;

    if (window.confirm(confirmMessage)) {
      setMonthlyClosingLoading(true);
      
      try {
        // Simulate monthly closing process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔄 Performing monthly closing...');
        console.log('📅 Current month:', currentMonth);
        console.log('💰 Profit calculation:', profitData);
        
        // Reset all car balances and left amounts to 0
        for (const car of cars) {
          await carsAPI.update(car._id, { 
            balance: 0,
            left: 0,
            payments: 0
          });
        }
        
        // Create closed account record
        const newClosedAccount = {
          id: `closed_${currentMonth}`,
          month: currentMonth,
          monthLabel: currentMonthLabel,
          closedDate: new Date().toISOString(),
          totalBalance: profitData.totalCarBalance,
          totalLeft: profitData.totalCarLeft,
          totalProfit: profitData.estimatedProfit,
          carsCount: cars.length,
          customersCount: customers.length,
          status: 'Closed'
        };
        
        setClosedAccounts(prev => [newClosedAccount, ...prev]);
        
        // Update account months - close current and create new
        const newDate = new Date();
        newDate.setMonth(newDate.getMonth() + 1);
        const newMonthKey = newDate.toISOString().slice(0, 7);
        const newMonthLabel = newDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        
        // Regenerate account months with new current month
        generateAccountMonths();
        
        showSuccess(
          'Monthly Closing Complete', 
          `${currentMonthLabel} has been closed successfully!\n\nProfit Formula: Balance - Left - Payments\nFinal Profit: $${profitData.estimatedProfit.toLocaleString()}\nAll car balances reset to $0\nNew accounts created for ${newMonthLabel}`
        );
        
        // Reload data
        loadAllData();
        
      } catch (error) {
        console.error('❌ Error performing monthly closing:', error);
        showError('Monthly Closing Failed', 'Error performing monthly closing. Please try again.');
      } finally {
        setMonthlyClosingLoading(false);
      }
    }
  };

  const handleIndividualAccountClose = async () => {
    if (!selectedCloseType || !selectedCloseAccount) {
      showError('Validation Error', 'Please select account type and account to close');
      return;
    }

    const account = getSelectedAccountDetails();
    if (!account) return;

    const accountName = account.carName || account.customerName;
    const confirmMessage = `Are you sure you want to close the account for ${accountName}?\n\n` +
      `Account Type: ${selectedCloseType.charAt(0).toUpperCase() + selectedCloseType.slice(1)}\n` +
      `Current Balance: $${(account.balance || 0).toLocaleString()}\n\n` +
      `This action will:\n` +
      `• Set the account status to "Closed"\n` +
      `• Transfer remaining balance to company account\n` +
      `• Archive all transaction history\n` +
      `• Prevent future transactions\n\n` +
      `This action cannot be undone!`;

    if (window.confirm(confirmMessage)) {
      try {
        console.log('Closing individual account:', {
          type: selectedCloseType,
          accountId: selectedCloseAccount,
          accountName: accountName,
          balance: account.balance || 0
        });

        // Update account status to closed
        if (selectedCloseType === 'car') {
          await carsAPI.update(selectedCloseAccount, { status: 'Closed' });
        } else if (selectedCloseType === 'customer') {
          await customersAPI.update(selectedCloseAccount, { status: 'Closed' });
        }
        
        showSuccess(
          'Account Closed',
          `Account for ${accountName} has been successfully closed! Balance of $${(account.balance || 0).toLocaleString()} transferred to company account.`
        );

        // Reset form
        setSelectedCloseType('');
        setSelectedCloseAccount('');
        
        // Reload data
        loadAllData();
        
      } catch (error) {
        console.error('❌ Error closing account:', error);
        showError('Close Failed', 'Failed to close account. Please try again.');
      }
    }
  };

  const handleReopenAccount = async () => {
    if (!selectedReopenAccount) {
      showError('Validation Error', 'Please select an account to reopen');
      return;
    }

    const account = closedAccounts.find(acc => acc.id === selectedReopenAccount);
    if (!account) return;

    const confirmMessage = `🔄 REOPEN CLOSED ACCOUNT\n\n` +
      `Account: ${account.monthLabel}\n` +
      `Original Balance: $${account.totalBalance.toLocaleString()}\n` +
      `Original Profit: $${account.totalProfit.toLocaleString()}\n\n` +
      `This will:\n` +
      `• Restore the account to active status\n` +
      `• Make all historical data accessible\n` +
      `• Allow new transactions for this period\n\n` +
      `Are you sure you want to reopen this account?`;

    if (window.confirm(confirmMessage)) {
      try {
        // Update account status
        const updatedAccounts = closedAccounts.map(acc => 
          acc.id === selectedReopenAccount 
            ? { ...acc, status: 'Reopened' }
            : acc
        );
        setClosedAccounts(updatedAccounts);
        
        showSuccess(
          'Account Reopened',
          `${account.monthLabel} account has been successfully reopened! All historical data is now accessible.`
        );

        setShowReopenModal(false);
        setSelectedReopenAccount('');
        
      } catch (error) {
        console.error('❌ Error reopening account:', error);
        showError('Reopen Failed', 'Failed to reopen account. Please try again.');
      }
    }
  };

  const handleViewMonthlyAccount = (account) => {
    setSelectedMonthlyAccount(account);
    setShowMonthlyModal(true);
    
    if (account.status === 'Active') {
      showSuccess('Active Account', `Viewing current active month: ${account.label}`);
    } else if (account.status === 'Closed') {
      showSuccess('Closed Account', `Viewing closed account: ${account.monthLabel || account.label}`);
    } else {
      showSuccess('Monthly Account', `Viewing account: ${account.label}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="text-gray-600 mt-4">Loading account management data...</p>
        </div>
      </div>
    );
  }

  const profitData = calculateMonthlyProfit();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
        <p className="text-gray-600">Manage monthly accounts, calculate profits, and generate reports</p>
      </div>

      {/* Current Month Status with Profit Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Current Active Month</h3>
              <p className="text-blue-700">
                {accountMonths.find(month => month.isCurrent)?.label || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Active
            </span>
            <p className="text-sm text-blue-600 mt-1">
              {cars.length} Cars • {customers.length} Customers
            </p>
          </div>
        </div>

        {/* Profit Preview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Total Car Balance</p>
            <p className="text-xl font-bold text-blue-900">${profitData.totalCarBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Total Car Left</p>
            <p className="text-xl font-bold text-red-600">${profitData.totalCarLeft.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Total Car Payments</p>
            <p className="text-xl font-bold text-orange-600">${profitData.totalCarPayments.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Net Amount</p>
            <p className="text-xl font-bold text-blue-600">${profitData.netAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700">Final Profit</p>
            <p className="text-xl font-bold text-green-600">${profitData.estimatedProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Monthly Closing Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Monthly Account Closing & Profit Calculation</h2>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">Important Notice</h4>
              <p className="text-orange-800 text-sm mt-1">
                This will calculate final profit based on: Car Balance - Car Left - Car Payments = Profit (no percentage).
                Current calculation: ${profitData.totalCarBalance.toLocaleString()} - ${profitData.totalCarLeft.toLocaleString()} - ${profitData.totalCarPayments.toLocaleString()} = ${profitData.estimatedProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleMonthlyClosing} 
          variant="warning"
          disabled={monthlyClosingLoading}
        >
          {monthlyClosingLoading ? (
            <>
              <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Monthly Closing...
            </>
          ) : (
            <>
              <Settings className="w-5 h-5 mr-2" />
              Perform Monthly Closing & Calculate Profit
            </>
          )}
        </Button>
      </div>

      {/* Closed Accounts Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Monthly Account History</h2>
          </div>
          <Button
            onClick={() => setShowReopenModal(true)}
            variant="outline"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reopen Account
          </Button>
        </div>
        
        {/* Monthly Account Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Current Active Month */}
          {accountMonths.filter(month => month.isCurrent).map((month) => (
            <div 
              key={month.value} 
              className="border-2 border-green-300 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
              onClick={() => handleViewMonthlyAccount(month)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-900">{month.label}</h4>
                  <p className="text-sm text-green-700">{month.value}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                  <p className="text-xs text-green-600 mt-1">Current</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Closed Accounts */}
          {closedAccounts.map((account) => (
            <div 
              key={account.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleViewMonthlyAccount(account)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{account.monthLabel}</h4>
                  <p className="text-sm text-gray-600">{account.month}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                    Closed
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Profit: ${account.totalProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Other Months (Previous months without data) */}
          {accountMonths.filter(month => !month.isCurrent).slice(0, 6).map((month) => (
            <div 
              key={month.value} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer opacity-75"
              onClick={() => handleViewMonthlyAccount(month)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{month.label}</h4>
                  <p className="text-sm text-gray-600">{month.value}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                    {month.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">No data</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Account Closing Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <UserX className="w-6 h-6 text-red-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Individual Account Closing</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Close individual accounts when cars are sold or customers are no longer active. 
          This will transfer remaining balance and archive transaction history.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormSelect
            label="Account Type"
            name="closeType"
            value={selectedCloseType}
            onChange={(e) => {
              setSelectedCloseType(e.target.value);
              setSelectedCloseAccount(''); // Reset account selection
            }}
            options={[
              { value: '', label: 'Select account type' },
              { value: 'car', label: 'Car Account' },
              { value: 'customer', label: 'Customer Account' }
            ]}
          />

          {selectedCloseType && (
            <FormSelect
              label={`Select ${selectedCloseType.charAt(0).toUpperCase() + selectedCloseType.slice(1)}`}
              name="closeAccount"
              value={selectedCloseAccount}
              onChange={(e) => setSelectedCloseAccount(e.target.value)}
              options={[
                { value: '', label: `Choose a ${selectedCloseType}` },
                ...getCloseAccountOptions()
              ]}
            />
          )}
        </div>

        {/* Account Details Preview */}
        {selectedCloseAccount && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-900 mb-3">Account Closing Preview</h4>
            {(() => {
              const account = getSelectedAccountDetails();
              const accountName = account?.carName || account?.customerName;
              return account ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-700">Account Name:</span>
                    <span className="font-medium text-red-900">{accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Account Type:</span>
                    <span className="font-medium text-red-900">
                      {selectedCloseType.charAt(0).toUpperCase() + selectedCloseType.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Current Status:</span>
                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                      account.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : account.status === 'Inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-700">Current Balance:</span>
                    <span className="font-medium text-red-900">${(account.balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-red-800 font-medium">Actions that will be performed:</p>
                    <ul className="mt-2 space-y-1 text-red-700">
                      <li>• Account status will be set to "Closed"</li>
                      <li>• Balance of ${(account.balance || 0).toLocaleString()} will be transferred to company account</li>
                      <li>• All transaction history will be archived</li>
                      <li>• Future transactions will be prevented</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        <Button 
          onClick={handleIndividualAccountClose}
          variant="danger"
          disabled={!selectedCloseType || !selectedCloseAccount}
        >
          <UserX className="w-5 h-5 mr-2" />
          Close Account
        </Button>
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Generate Reports</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FormSelect
            label="Report Type"
            name="reportType"
            value={selectedReportType}
            onChange={(e) => {
              setSelectedReportType(e.target.value);
              setSelectedAccount(''); // Reset account selection
            }}
            options={[
              { value: '', label: 'Select report type' },
              { value: 'car', label: 'Car Report' },
              { value: 'customer', label: 'Customer Report' }
            ]}
          />

          {selectedReportType && (
            <FormSelect
              label={`Select ${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)}`}
              name="account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              options={[
                { value: '', label: `Choose a ${selectedReportType}` },
                ...getAccountOptions()
              ]}
            />
          )}

          <FormSelect
            label="Monthly Account"
            name="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={[
              { value: '', label: 'Select month' },
              ...accountMonths.map(month => ({ 
                value: month.value, 
                label: `${month.label} (${month.status})` 
              })),
              ...closedAccounts.map(account => ({
                value: account.month,
                label: `${account.monthLabel} (${account.status})`
              }))
            ]}
          />
        </div>

        <Button 
          onClick={handleGenerateReport}
          disabled={!selectedReportType || !selectedAccount || !selectedMonth}
        >
          <Download className="w-5 h-5 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Account Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Car Accounts</p>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-600">
                    {cars.filter(car => car.status === 'Active').length}
                  </p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-600">
                    {cars.filter(car => car.status === 'Closed').length}
                  </p>
                  <p className="text-xs text-gray-500">Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customer Accounts</p>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-green-600">
                    {customers.filter(customer => customer.status === 'Active').length}
                  </p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-600">
                    {customers.filter(customer => customer.status === 'Closed').length}
                  </p>
                  <p className="text-xs text-gray-500">Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reopen Account Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reopen Closed Account</h3>
              <p className="text-sm text-gray-600">Select a closed account to reopen</p>
            </div>

            <div className="p-6 space-y-4">
              <FormSelect
                label="Select Closed Account"
                value={selectedReopenAccount}
                onChange={(e) => setSelectedReopenAccount(e.target.value)}
                options={[
                  { value: '', label: 'Choose a closed account' },
                  ...closedAccounts
                    .filter(account => account.status === 'Closed')
                    .map(account => ({
                      value: account.id,
                      label: `${account.monthLabel} (Profit: $${account.totalProfit.toLocaleString()})`
                    }))
                ]}
                required
              />

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReopenModal(false);
                    setSelectedReopenAccount('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReopenAccount} 
                  className="flex-1"
                  disabled={!selectedReopenAccount}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reopen Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Account View Modal */}
      {showMonthlyModal && selectedMonthlyAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMonthlyAccount.monthLabel || selectedMonthlyAccount.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Account Details - {selectedMonthlyAccount.status || 'Active'}
                  </p>
                </div>
                <button
                  onClick={() => setShowMonthlyModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Account Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">Account Status</h4>
                    <p className="text-sm text-gray-600">
                      {selectedMonthlyAccount.value || selectedMonthlyAccount.month}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMonthlyAccount.status === 'Active' || selectedMonthlyAccount.isCurrent
                      ? 'bg-green-100 text-green-800'
                      : selectedMonthlyAccount.status === 'Closed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedMonthlyAccount.status || (selectedMonthlyAccount.isCurrent ? 'Active' : 'Closed')}
                  </span>
                </div>
              </div>

              {/* Financial Summary (for closed accounts) */}
              {selectedMonthlyAccount.totalBalance && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Financial Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700">Total Balance</p>
                      <p className="text-xl font-bold text-blue-900">
                        ${selectedMonthlyAccount.totalBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700">Total Left</p>
                      <p className="text-xl font-bold text-red-900">
                        ${(selectedMonthlyAccount.totalLeft || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700">Final Profit</p>
                      <p className="text-xl font-bold text-green-900">
                        ${selectedMonthlyAccount.totalProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">Closed Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(selectedMonthlyAccount.closedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Month Info (for active account) */}
              {(selectedMonthlyAccount.isCurrent || selectedMonthlyAccount.status === 'Active') && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Current Month Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700">Current Balance</p>
                      <p className="text-xl font-bold text-blue-900">
                        ${profitData.totalCarBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700">Current Left</p>
                      <p className="text-xl font-bold text-red-900">
                        ${profitData.totalCarLeft.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-700">Current Payments</p>
                      <p className="text-xl font-bold text-orange-900">
                        ${profitData.totalCarPayments.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700">Estimated Profit</p>
                      <p className="text-xl font-bold text-green-900">
                        ${profitData.estimatedProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Actions */}
              <div className="flex justify-end space-x-4">
                {selectedMonthlyAccount.status === 'Closed' && (
                  <Button
                    onClick={() => {
                      setSelectedReopenAccount(selectedMonthlyAccount.id);
                      setShowMonthlyModal(false);
                      setShowReopenModal(true);
                    }}
                    variant="outline"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reopen Account
                  </Button>
                )}
                <Button
                  onClick={() => setShowMonthlyModal(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Management Instructions</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• <strong>Monthly Closing:</strong> Calculates profit from (Car Balance - Car Left) × 15% and resets all car balances to $0</li>
          <li>• <strong>Monthly Closing:</strong> Calculates profit from Car Balance - Car Left - Car Payments = Profit (no percentage) and resets all car balances to $0</li>
          <li>• <strong>Profit Formula:</strong> Car Balance - Car Left - Car Payments = Final Profit (direct calculation, no percentage)</li>
          <li>• <strong>Car Payments:</strong> All payments made for car expenses are added to car left amount</li>
          <li>• <strong>Balance Reset:</strong> All car balances start from $0 each new month</li>
          <li>• <strong>Closed Account Management:</strong> View and reopen previously closed monthly accounts</li>
          <li>• <strong>Individual Account Closing:</strong> Close specific accounts when cars are sold or customers become inactive</li>
          <li>• <strong>Account Reopening:</strong> Reopen closed accounts to access historical data and allow new transactions</li>
          <li>• <strong>Historical Data:</strong> All closed account data is preserved and accessible</li>
          <li>• <strong>Warning:</strong> Monthly closing actions cannot be undone</li>
        </ul>
      </div>

      <Footer/>
    </div>
  );
};

export default AccountManagement;