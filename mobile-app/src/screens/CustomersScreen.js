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
import { customersAPI } from '../services/api';

const CustomersScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phoneNumber && customer.phoneNumber.includes(searchQuery))
  );

  const handleDeleteCustomer = (customerId, customerName) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customersAPI.delete(customerId);
              Alert.alert('Success', 'Customer deleted successfully');
              loadCustomers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
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
        placeholder="Search customers..."
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
        {filteredCustomers.map((customer) => (
          <Card key={customer._id} style={styles.customerCard}>
            <Card.Content>
              <View style={styles.customerHeader}>
                <View style={styles.customerInfo}>
                  <Title style={styles.customerName}>{customer.customerName}</Title>
                  <Paragraph style={styles.phoneNumber}>
                    {customer.phoneNumber || 'No Phone'}
                  </Paragraph>
                </View>
                <View style={styles.customerActions}>
                  <IconButton
                    icon="eye"
                    size={20}
                    onPress={() => navigation.navigate('CustomerDetails', { customerId: customer._id })}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#f44336"
                    onPress={() => handleDeleteCustomer(customer._id, customer.customerName)}
                  />
                </View>
              </View>

              <View style={styles.customerDetails}>
                <View style={styles.detailRow}>
                  <Icon name="account-balance-wallet" size={16} color="#FF9800" />
                  <Paragraph style={styles.detailText}>
                    Balance: ${(customer.balance || 0).toLocaleString()}
                  </Paragraph>
                </View>

                <Chip
                  style={[
                    styles.statusChip,
                    (customer.balance || 0) === 0 ? styles.cashChip : styles.creditChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {(customer.balance || 0) === 0 ? 'Cash Customer' : 'Credit Customer'}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredCustomers.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="people" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>No Customers Found</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 'No customers match your search' : 'Add your first customer to get started'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateCustomer')}
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
  customerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  customerActions: {
    flexDirection: 'row',
  },
  customerDetails: {
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
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cashChip: {
    backgroundColor: '#E8F5E8',
  },
  creditChip: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default CustomersScreen;