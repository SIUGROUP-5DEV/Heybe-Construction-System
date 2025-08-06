import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, List } from 'react-native-paper';
import { testBackendConnection, testLogin } from '../services/connectionTest';

const ConnectionTestScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const runConnectionTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      // Test backend connection
      const workingUrl = await testBackendConnection();
      
      if (workingUrl) {
        setTestResults(prev => [...prev, {
          type: 'success',
          message: `✅ Backend connected: ${workingUrl}`
        }]);
        
        // Test login
        const loginSuccess = await testLogin(workingUrl);
        
        if (loginSuccess) {
          setTestResults(prev => [...prev, {
            type: 'success',
            message: '✅ Login test successful'
          }]);
        } else {
          setTestResults(prev => [...prev, {
            type: 'error',
            message: '❌ Login test failed'
          }]);
        }
      } else {
        setTestResults(prev => [...prev, {
          type: 'error',
          message: '❌ No backend connection available'
        }]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'error',
        message: `❌ Test error: ${error.message}`
      }]);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Backend Connection Test</Title>
          <Paragraph style={styles.description}>
            Test connection to backend server and login functionality
          </Paragraph>
          
          <Button
            mode="contained"
            onPress={runConnectionTest}
            loading={testing}
            style={styles.button}
          >
            {testing ? 'Testing...' : 'Run Connection Test'}
          </Button>
          
          {testResults.length > 0 && (
            <View style={styles.results}>
              <Title style={styles.resultsTitle}>Test Results:</Title>
              {testResults.map((result, index) => (
                <List.Item
                  key={index}
                  title={result.message}
                  titleStyle={[
                    styles.resultText,
                    result.type === 'success' ? styles.successText : styles.errorText
                  ]}
                />
              ))}
            </View>
          )}
          
          <View style={styles.instructions}>
            <Title style={styles.instructionsTitle}>Troubleshooting:</Title>
            <Paragraph>1. Make sure backend server is running</Paragraph>
            <Paragraph>2. Check your IP address in api.js</Paragraph>
            <Paragraph>3. Ensure phone and computer are on same network</Paragraph>
            <Paragraph>4. Try different URLs in the test</Paragraph>
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
    padding: 16,
  },
  card: {
    padding: 16,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  button: {
    marginBottom: 16,
  },
  results: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#f44336',
  },
  instructions: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1976d2',
  },
});

export default ConnectionTestScreen;