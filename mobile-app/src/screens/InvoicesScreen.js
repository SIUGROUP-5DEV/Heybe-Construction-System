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
  IconButton,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { invoicesAPI } from '../services/api';

const InvoicesScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getAll();
      setInvoices(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invoice.carId?.carName && invoice.carId.carName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteInvoice = (invoiceId, invoiceNo) => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${invoiceNo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await invoicesAPI.delete(invoiceId);
              Alert.alert('Success', 'Invoice deleted successfully');
              loadInvoices();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete invoice');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
      <Searchbar
        placeholder="Search invoices..."
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
        {filteredInvoices.map((invoice) => (
          <Card key={invoice._id} style={styles.invoiceCard}>
            <Card.Content>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Title style={styles.invoiceNo}>{invoice.invoiceNo}</Title>
                  <Paragraph style={styles.carName}>
                    {invoice.carId?.carName || 'Unknown Car'}
                  </Paragraph>
                  <Paragraph style={styles.invoiceDate}>
                    {formatDate(invoice.invoiceDate)}
                  </Paragraph>
                </View>
                <View style={styles.invoiceActions}>
                  <IconButton
                    icon="eye"
                    size={20}
                    onPress={() => navigation.navigate('InvoiceDetails', { invoiceId: invoice._id })}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#f44336"
                    onPress={() => handleDeleteInvoice(invoice._id, invoice.invoiceNo)}
                  />
                </View>
              </View>

              <View style={styles.invoiceDetails}>
                <View style={styles.amountRow}>
                  <View style={styles.amountItem}>
                    <Icon name="attach-money" size={16} color="#4CAF50" />
                    <Paragraph style={styles.amountText}>
                      Total: ${(invoice.total || 0).toLocaleString()}
                    </Paragraph>
                  </View>
                  
                  <View style={styles.amountItem}>
                    <Icon name="warning" size={16} color="#FF9800" />
                    <Paragraph style={styles.amountText}>
                      Left: ${(invoice.totalLeft || 0).toLocaleString()}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.amountRow}>
                  <View style={styles.amountItem}>
                    <Icon name="trending-up" size={16} color="#2196F3" />
                    <Paragraph style={styles.amountText}>
                      Profit: ${(invoice.totalProfit || 0).toLocaleString()}
                    </Paragraph>
                  </View>
                  
                  <View style={styles.amountItem}>
                    <Icon name="list" size={16} color="#9C27B0" />
                    <Paragraph style={styles.amountText}>
                      Items: {invoice.items?.length || 0}
                    </Paragraph>
                  </View>
                </View>

                <Chip
                  style={[
                    styles.statusChip,
                    (invoice.totalLeft || 0) === 0 ? styles.paidChip : styles.pendingChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {(invoice.totalLeft || 0) === 0 ? 'Fully Paid' : 'Pending Payment'}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="receipt" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>No Invoices Found</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 'No invoices match your search' : 'Create your first invoice to get started'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateInvoice')}
      />
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
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  invoiceCard: {
    marginBottom: 12,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  carName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 12,
    color: '#999',
  },
  invoiceActions: {
    flexDirection: 'row',
  },
  invoiceDetails: {
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  amountText: {
    marginLeft: 4,
    fontSize: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  paidChip: {
    backgroundColor: '#E8F5E8',
  },
  pendingChip: {
    backgroundColor: '#FFF3E0',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default InvoicesScreen;