import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  FAB,
  Chip,
  Button,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { paymentsAPI } from '../services/api';

const PaymentsScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const filteredPayments = payments.filter(payment =>
    (payment.invoiceNo && payment.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (payment.description && payment.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalReceived = () => {
    return payments
      .filter(p => p.type === 'receive')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getTotalPaymentsOut = () => {
    return payments
      .filter(p => p.type === 'payment_out')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="trending-up" size={24} color="#4CAF50" />
            <View style={styles.summaryText}>
              <Paragraph style={styles.summaryLabel}>Total Received</Paragraph>
              <Title style={[styles.summaryAmount, { color: '#4CAF50' }]}>
                ${getTotalReceived().toLocaleString()}
              </Title>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Icon name="trending-down" size={24} color="#f44336" />
            <View style={styles.summaryText}>
              <Paragraph style={styles.summaryLabel}>Total Payments Out</Paragraph>
              <Title style={[styles.summaryAmount, { color: '#f44336' }]}>
                ${getTotalPaymentsOut().toLocaleString()}
              </Title>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          icon="arrow-down-left"
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => navigation.navigate('ReceivePayment')}
        >
          Receive Payment
        </Button>
        <Button
          mode="contained"
          icon="arrow-up-right"
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => navigation.navigate('PaymentOut')}
        >
          Payment Out
        </Button>
      </View>

      <Searchbar
        placeholder="Search payments..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPayments.map((payment) => (
          <Card key={payment._id} style={styles.paymentCard}>
            <Card.Content>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <View style={styles.paymentType}>
                    <Icon
                      name={payment.type === 'receive' ? 'arrow-downward' : 'arrow-upward'}
                      size={20}
                      color={payment.type === 'receive' ? '#4CAF50' : '#f44336'}
                    />
                    <Title style={styles.paymentTitle}>
                      {payment.type === 'receive' ? 'Payment Received' : 'Payment Out'}
                    </Title>
                  </View>
                  <Paragraph style={styles.paymentDate}>
                    {formatDate(payment.paymentDate)}
                  </Paragraph>
                </View>
                <Title style={[
                  styles.paymentAmount,
                  { color: payment.type === 'receive' ? '#4CAF50' : '#f44336' }
                ]}>
                  {payment.type === 'receive' ? '+' : '-'}${payment.amount.toLocaleString()}
                </Title>
              </View>

              <View style={styles.paymentDetails}>
                {payment.invoiceNo && (
                  <View style={styles.detailRow}>
                    <Icon name="receipt" size={16} color="#2196F3" />
                    <Paragraph style={styles.detailText}>
                      Invoice: {payment.invoiceNo}
                    </Paragraph>
                  </View>
                )}

                {payment.description && (
                  <View style={styles.detailRow}>
                    <Icon name="description" size={16} color="#666" />
                    <Paragraph style={styles.detailText}>
                      {payment.description}
                    </Paragraph>
                  </View>
                )}

                {payment.accountMonth && (
                  <View style={styles.detailRow}>
                    <Icon name="calendar-today" size={16} color="#9C27B0" />
                    <Paragraph style={styles.detailText}>
                      Account: {payment.accountMonth}
                    </Paragraph>
                  </View>
                )}

                <Chip
                  style={[
                    styles.statusChip,
                    payment.type === 'receive' ? styles.receiveChip : styles.payoutChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {payment.type === 'receive' ? 'Money In' : 'Money Out'}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredPayments.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="payment" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>No Payments Found</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 'No payments match your search' : 'Start processing payments to see them here'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    elevation: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: 12,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    marginTop: 0,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  paymentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  receiveChip: {
    backgroundColor: '#E8F5E8',
  },
  payoutChip: {
    backgroundColor: '#FFEBEE',
  },
  chipText: {
    fontSize: 12,
  },
  emptyCard: {
    marginTop: 50,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default PaymentsScreen;