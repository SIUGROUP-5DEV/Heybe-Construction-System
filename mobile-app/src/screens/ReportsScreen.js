import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Button,
  Chip,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { dashboardAPI, carsAPI, customersAPI, invoicesAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [cars, setCars] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const [dashboardResponse, carsResponse, customersResponse, invoicesResponse] = await Promise.all([
        dashboardAPI.getData(),
        carsAPI.getAll(),
        customersAPI.getAll(),
        invoicesAPI.getAll(),
      ]);

      setDashboardData(dashboardResponse.data);
      setCars(carsResponse.data);
      setCustomers(customersResponse.data);
      setInvoices(invoicesResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load reports data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReportsData();
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map((month, index) => {
      const baseRevenue = (dashboardData?.stats?.totalRevenue || 0) / 6;
      return Math.floor(baseRevenue * (0.8 + Math.random() * 0.4));
    });
    
    return {
      labels: months,
      datasets: [{
        data: data,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const getCarBalanceData = () => {
    const topCars = cars.slice(0, 4);
    return {
      labels: topCars.map(car => car.carName.substring(0, 8)),
      datasets: [{
        data: topCars.map(car => car.balance || 0)
      }]
    };
  };

  const getPieChartData = () => {
    const totalRevenue = dashboardData?.stats?.totalRevenue || 0;
    const totalProfit = dashboardData?.stats?.totalProfit || 0;
    const totalOutstanding = dashboardData?.stats?.totalOutstanding || 0;
    
    return [
      {
        name: 'Revenue',
        population: totalRevenue,
        color: '#4CAF50',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Profit',
        population: totalProfit,
        color: '#2196F3',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: 'Outstanding',
        population: totalOutstanding,
        color: '#FF9800',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Summary Stats */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Business Overview</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="directions-car" size={24} color="#2196F3" />
              <Paragraph style={styles.statNumber}>
                {dashboardData?.stats?.totalCars || 0}
              </Paragraph>
              <Paragraph style={styles.statLabel}>Cars</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="people" size={24} color="#4CAF50" />
              <Paragraph style={styles.statNumber}>
                {dashboardData?.stats?.totalCustomers || 0}
              </Paragraph>
              <Paragraph style={styles.statLabel}>Customers</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="receipt" size={24} color="#FF9800" />
              <Paragraph style={styles.statNumber}>
                {dashboardData?.stats?.totalInvoices || 0}
              </Paragraph>
              <Paragraph style={styles.statLabel}>Invoices</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="attach-money" size={24} color="#9C27B0" />
              <Paragraph style={styles.statNumber}>
                ${(dashboardData?.stats?.totalRevenue || 0).toLocaleString()}
              </Paragraph>
              <Paragraph style={styles.statLabel}>Revenue</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Monthly Revenue Trend</Title>
          <LineChart
            data={getMonthlyData()}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Car Balance Chart */}
      {cars.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>Car Balance Comparison</Title>
            <BarChart
              data={getCarBalanceData()}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </Card.Content>
        </Card>
      )}

      {/* Financial Distribution */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Financial Distribution</Title>
          <PieChart
            data={getPieChartData()}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Reports</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="directions-car"
              style={styles.actionButton}
              onPress={() => navigation.navigate('CarReports')}
            >
              Car Reports
            </Button>
            <Button
              mode="outlined"
              icon="people"
              style={styles.actionButton}
              onPress={() => navigation.navigate('CustomerReports')}
            >
              Customer Reports
            </Button>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="receipt"
              style={styles.actionButton}
              onPress={() => navigation.navigate('InvoiceReports')}
            >
              Invoice Reports
            </Button>
            <Button
              mode="outlined"
              icon="payment"
              style={styles.actionButton}
              onPress={() => navigation.navigate('PaymentReports')}
            >
              Payment Reports
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={styles.activityCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Recent Activity</Title>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Icon name="add-circle" size={20} color="#4CAF50" />
              <Paragraph style={styles.activityText}>New invoice created</Paragraph>
              <Chip style={styles.activityChip}>Today</Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.activityItem}>
              <Icon name="payment" size={20} color="#2196F3" />
              <Paragraph style={styles.activityText}>Payment received</Paragraph>
              <Chip style={styles.activityChip}>Yesterday</Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.activityItem}>
              <Icon name="directions-car" size={20} color="#FF9800" />
              <Paragraph style={styles.activityText}>Car added to fleet</Paragraph>
              <Chip style={styles.activityChip}>2 days ago</Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activityCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    elevation: 2,
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  activityChip: {
    backgroundColor: '#e3f2fd',
  },
  divider: {
    marginVertical: 4,
  },
});

export default ReportsScreen;