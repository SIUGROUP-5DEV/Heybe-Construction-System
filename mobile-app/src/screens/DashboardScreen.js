import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { dashboardAPI } from '../services/api';

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
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
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Dashboard</Title>
        <Paragraph style={styles.headerSubtitle}>Business Overview</Paragraph>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="directions-car" size={30} color="#2196F3" />
            <View style={styles.statText}>
              <Title style={styles.statNumber}>
                {dashboardData?.stats?.totalCars || 0}
              </Title>
              <Paragraph style={styles.statLabel}>Total Cars</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="people" size={30} color="#4CAF50" />
            <View style={styles.statText}>
              <Title style={styles.statNumber}>
                {dashboardData?.stats?.totalCustomers || 0}
              </Title>
              <Paragraph style={styles.statLabel}>Customers</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="receipt" size={30} color="#FF9800" />
            <View style={styles.statText}>
              <Title style={styles.statNumber}>
                {dashboardData?.stats?.totalInvoices || 0}
              </Title>
              <Paragraph style={styles.statLabel}>Invoices</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Icon name="attach-money" size={30} color="#9C27B0" />
            <View style={styles.statText}>
              <Title style={styles.statNumber}>
                ${(dashboardData?.stats?.totalRevenue || 0).toLocaleString()}
              </Title>
              <Paragraph style={styles.statLabel}>Revenue</Paragraph>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.recentCard}>
        <Card.Content>
          <Title>Recent Activity</Title>
          <View style={styles.activityList}>
            <Chip icon="add" style={styles.activityChip}>
              New invoice created
            </Chip>
            <Chip icon="payment" style={styles.activityChip}>
              Payment received
            </Chip>
            <Chip icon="directions-car" style={styles.activityChip}>
              Car added to fleet
            </Chip>
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
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    marginBottom: 10,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 15,
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  recentCard: {
    margin: 10,
    marginTop: 0,
  },
  activityList: {
    marginTop: 10,
  },
  activityChip: {
    marginBottom: 5,
    marginRight: 5,
  },
});

export default DashboardScreen;