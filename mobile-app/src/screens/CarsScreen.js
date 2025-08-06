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
  List,
  Chip,
  IconButton,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { carsAPI } from '../services/api';

const CarsScreen = ({ navigation }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const response = await carsAPI.getAll();
      setCars(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cars');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCars();
  };

  const filteredCars = cars.filter(car =>
    car.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (car.numberPlate && car.numberPlate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteCar = (carId, carName) => {
    Alert.alert(
      'Delete Car',
      `Are you sure you want to delete ${carName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await carsAPI.delete(carId);
              Alert.alert('Success', 'Car deleted successfully');
              loadCars();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete car');
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
        placeholder="Search cars..."
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
        {filteredCars.map((car) => (
          <Card key={car._id} style={styles.carCard}>
            <Card.Content>
              <View style={styles.carHeader}>
                <View style={styles.carInfo}>
                  <Title style={styles.carName}>{car.carName}</Title>
                  <Paragraph style={styles.numberPlate}>
                    {car.numberPlate || 'No Plate'}
                  </Paragraph>
                </View>
                <View style={styles.carActions}>
                  <IconButton
                    icon="eye"
                    size={20}
                    onPress={() => navigation.navigate('CarDetails', { carId: car._id })}
                  />
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#f44336"
                    onPress={() => handleDeleteCar(car._id, car.carName)}
                  />
                </View>
              </View>

              <View style={styles.carDetails}>
                <View style={styles.detailRow}>
                  <Icon name="attach-money" size={16} color="#4CAF50" />
                  <Paragraph style={styles.detailText}>
                    Balance: ${(car.balance || 0).toLocaleString()}
                  </Paragraph>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="person" size={16} color="#2196F3" />
                  <Paragraph style={styles.detailText}>
                    Driver: {car.driverId?.employeeName || 'Not Assigned'}
                  </Paragraph>
                </View>

                <Chip
                  style={[
                    styles.statusChip,
                    car.status === 'Active' ? styles.activeChip : styles.inactiveChip
                  ]}
                  textStyle={styles.chipText}
                >
                  {car.status || 'Active'}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredCars.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="directions-car" size={64} color="#ccc" />
              <Title style={styles.emptyTitle}>No Cars Found</Title>
              <Paragraph style={styles.emptyText}>
                {searchQuery ? 'No cars match your search' : 'Add your first car to get started'}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateCar')}
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
  carCard: {
    marginBottom: 12,
    elevation: 2,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carInfo: {
    flex: 1,
  },
  carName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  numberPlate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  carActions: {
    flexDirection: 'row',
  },
  carDetails: {
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
  activeChip: {
    backgroundColor: '#E8F5E8',
  },
  inactiveChip: {
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

export default CarsScreen;