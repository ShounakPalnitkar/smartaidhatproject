import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Switch } from 'react-native';
import { 
  PaperProvider, 
  Card, 
  TextInput, 
  Checkbox, 
  List,
  RadioButton,
  Button
} from 'react-native-paper';
import WebView from 'react-native-webview'; // Fixed import
import MapView, { Marker } from 'react-native-maps';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: '#ff8c00',
              tabBarInactiveTintColor: '#888',
            }}
          >
            <Tab.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Navigation"
              component={NavigationScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="map" size={24} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Detection"
              component={DetectionScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="target" size={24} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Sensors"
              component={SensorsScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="sine-wave" size={24} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="System"
              component={SystemScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="cog" size={24} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Voice"
              component={VoiceScreen}
              options={{
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="microphone" size={24} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

// Dashboard Screen
const DashboardScreen = () => {
  const [motionStatus, setMotionStatus] = useState('Detected');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMotionStatus(Math.random() > 0.2 ? 'Detected' : 'No motion');
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to Smart Aid Dashboard</Text>
      <Text style={styles.subtitle}>Use the tabs to explore system features</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.text}>Motion: {motionStatus}</Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>System Analytics</Text>
          <WebView 
            source={{ uri: 'https://smartaid.ngrok.io/analytics/' }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={styles.text}>Loading analytics...</Text>
              </View>
            )}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Navigation Screen
const NavigationScreen = () => {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState('');
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);
  
  const startVoiceSearch = () => {
    Speech.speak("Listening for destination...");
    const destinations = ["library", "coffee shop", "post office", "park"];
    const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
    setDestination(randomDestination);
    Speech.speak(`Getting directions to ${randomDestination}`);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.mapContainer}>
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Location"
                />
              </MapView>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.text}>Loading map...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              label="Search destination"
              value={destination}
              onChangeText={setDestination}
              style={styles.searchInput}
            />
            <Button 
              mode="contained" 
              onPress={startVoiceSearch}
              style={styles.voiceButton}
              labelStyle={styles.voiceButtonLabel}
            >
              🎙️ Voice
            </Button>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.text}>Distance: 0 m</Text>
            <Text style={styles.text}>Speed: 0 km/h</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Detection Screen
const DetectionScreen = () => {
  const [mute, setMute] = useState(false);
  const [mode, setMode] = useState('public');
  const [showCustomLabels, setShowCustomLabels] = useState(false);
  const [detections, setDetections] = useState([]);
  const [lastDetection, setLastDetection] = useState('');
  
  const addDetection = useCallback(() => {
    const objects = ["person", "car", "bicycle", "bench"];
    const distances = ["1 meter", "2 meters", "3 meters", "5 meters"];
    const directions = ["ahead", "to your left", "to your right", "behind you"];
    
    const randomObj = objects[Math.floor(Math.random() * objects.length)];
    const randomDist = distances[Math.floor(Math.random() * distances.length)];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    
    const detection = `${randomObj} detected ${randomDist} ${randomDir}`;
    setLastDetection(detection);
    setDetections([detection, ...detections.slice(0, 9)]);
    
    if (!mute) {
      Speech.speak(detection);
    }
  }, [mute, detections]);

  useEffect(() => {
    const interval = setInterval(() => {
      addDetection();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [addDetection]);
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text style={styles.text}>🔇 Mute Voice Output</Text>
            <Switch value={mute} onValueChange={setMute} />
          </View>
          
          <Text style={styles.text}>Mode:</Text>
          <View style={styles.modeSelector}>
            <Button 
              mode={mode === 'home' ? 'contained' : 'outlined'} 
              onPress={() => setMode('home')}
              style={styles.modeButton}
            >
              🏠 Home
            </Button>
            <Button 
              mode={mode === 'public' ? 'contained' : 'outlined'} 
              onPress={() => setMode('public')}
              style={styles.modeButton}
            >
              🌆 Public
            </Button>
            <Button 
              mode={mode === 'custom' ? 'contained' : 'outlined'} 
              onPress={() => {
                setMode('custom');
                setShowCustomLabels(!showCustomLabels);
              }}
              style={styles.modeButton}
            >
              🧩 Custom
            </Button>
          </View>
          
          {showCustomLabels && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.text}>Select labels for Custom Mode:</Text>
                <List.Section>
                  <List.Item 
                    title="Person" 
                    titleStyle={styles.text}
                    left={() => <Checkbox status="checked" color="#ff8c00" />} 
                  />
                  <List.Item 
                    title="Car" 
                    titleStyle={styles.text}
                    left={() => <Checkbox status="checked" color="#ff8c00" />} 
                  />
                  <List.Item 
                    title="Bicycle" 
                    titleStyle={styles.text}
                    left={() => <Checkbox status="unchecked" color="#ff8c00" />} 
                  />
                  <List.Item 
                    title="Traffic Light" 
                    titleStyle={styles.text}
                    left={() => <Checkbox status="checked" color="#ff8c00" />} 
                  />
                </List.Section>
              </Card.Content>
            </Card>
          )}
          
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={() => Speech.speak('Object filter applied')} style={styles.orangeButton}>
              Apply
            </Button>
            <Button mode="outlined" onPress={() => Speech.speak(lastDetection || 'No detection')} style={styles.outlinedButton}>
              🔊 Repeat
            </Button>
            <Button mode="outlined" onPress={() => setDetections([])} style={styles.outlinedButton}>
              Clear Log
            </Button>
          </View>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Detections:</Text>
              {detections.length > 0 ? (
                detections.map((det, i) => (
                  <Text key={i} style={styles.listItem}>• {det}</Text>
                ))
              ) : (
                <Text style={styles.text}>No detections yet</Text>
              )}
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Sensors Screen
const SensorsScreen = () => {
  const [thresholds, setThresholds] = useState({
    'Left Front': 70,
    'Left Middle': 70,
    'Left Rear': 70,
    'Right Front': 70,
    'Right Middle': 70,
    'Right Rear': 70,
  });

  const applyThresholds = () => {
    Speech.speak("Ultrasonic thresholds updated");
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Ultrasonic Thresholds (cm)</Text>
          
          {Object.entries(thresholds).map(([sensor, value]) => (
            <View key={sensor} style={styles.sliderContainer}>
              <Text style={styles.text}>{sensor}: {value} cm</Text>
              <View style={styles.sliderBackground}>
                <View style={[styles.sliderFill, {width: `${(value/150)*100}%`}]} />
              </View>
              <View style={styles.sliderControls}>
                <Button 
                  mode="outlined" 
                  onPress={() => setThresholds(prev => ({...prev, [sensor]: Math.max(10, value - 5)}))}
                  style={styles.sliderButton}
                >
                  -
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setThresholds(prev => ({...prev, [sensor]: Math.min(150, value + 5)}))}
                  style={styles.sliderButton}
                >
                  +
                </Button>
              </View>
            </View>
          ))}
          
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={applyThresholds} style={styles.orangeButton}>
              Save Thresholds
            </Button>
            <Button mode="outlined" onPress={() => {}} style={styles.outlinedButton}>
              Full Screen
            </Button>
          </View>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Live Video Feed</Text>
              <View style={styles.videoPlaceholder}>
                <Text style={styles.placeholderText}>Live Video Stream</Text>
              </View>
            </Card.Content>
          </Card>
          
          <Button mode="outlined" onPress={() => {}} style={styles.outlinedButton}>
            Download Latest Video
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// System Screen
const SystemScreen = () => {
  const [indoorMode, setIndoorMode] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const [wakeWord, setWakeWord] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  const toggleIndoorMode = () => {
    setIndoorMode(!indoorMode);
    Speech.speak(!indoorMode ? "Indoor mode enabled" : "Indoor mode disabled");
  };

  const toggleQuietMode = () => {
    setQuietMode(!quietMode);
    Speech.speak(!quietMode ? "Quiet mode enabled" : "Quiet mode disabled");
  };

  const toggleWakeWord = () => {
    setWakeWord(!wakeWord);
    Speech.speak(!wakeWord ? "Wake word enabled" : "Wake word disabled");
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Text style={styles.text}>Indoor Mode</Text>
            <Switch value={indoorMode} onValueChange={toggleIndoorMode} />
          </View>
          
          <View style={styles.row}>
            <Text style={styles.text}>Quiet Mode</Text>
            <Switch value={quietMode} onValueChange={toggleQuietMode} />
          </View>
          
          <View style={styles.row}>
            <Text style={styles.text}>Wake Word</Text>
            <Switch value={wakeWord} onValueChange={toggleWakeWord} />
          </View>
          
          <Card style={styles.statusCard}>
            <Card.Content>
              <Text style={styles.text}><Text style={styles.bold}>Device:</Text> Smart Aid v2.1</Text>
              <Text style={styles.text}><Text style={styles.bold}>Quiet:</Text> {quietMode ? "ON" : "OFF"}</Text>
              <Text style={styles.text}><Text style={styles.bold}>Mode:</Text> Public</Text>
            </Card.Content>
          </Card>
          
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={() => {}} style={styles.orangeButton}>
              Check Status
            </Button>
            <Button mode="outlined" onPress={() => setShowLogs(!showLogs)} style={styles.outlinedButton}>
              {showLogs ? "Hide Logs" : "Show Logs"}
            </Button>
          </View>
          
          {showLogs && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>System Logs:</Text>
                <Text style={styles.text}>[12:45:32] System started</Text>
                <Text style={styles.text}>[12:46:15] GPS location acquired</Text>
                <Text style={styles.text}>[12:47:22] Motion detected</Text>
              </Card.Content>
            </Card>
          )}
          
          <Card style={styles.statusCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>📶 Wi-Fi Status</Text>
              <Text style={styles.text}><Text style={styles.bold}>SSID:</Text> SmartAid_Network</Text>
              <Text style={styles.text}><Text style={styles.bold}>Signal:</Text> Excellent</Text>
              <Text style={styles.text}><Text style={styles.bold}>IP Address:</Text> 192.168.1.42</Text>
              <Text style={styles.text}><Text style={styles.bold}>Connection Quality:</Text> 95%</Text>
              <Button mode="outlined" onPress={() => {}} style={styles.outlinedButton}>
                Refresh
              </Button>
            </Card.Content>
          </Card>
          
          <Card style={styles.statusCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>🔒 Security Status</Text>
              <Text style={styles.text}><Text style={styles.bold}>Connection:</Text> Secure 🔒</Text>
              <Text style={styles.text}><Text style={styles.bold}>Data Encryption:</Text> Enabled</Text>
              <Text style={styles.text}><Text style={styles.bold}>Privacy Controls:</Text> Enabled</Text>
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Voice Screen
const VoiceScreen = () => {
  const [voiceType, setVoiceType] = useState('female');
  const [voiceCommand, setVoiceCommand] = useState('');
  
  const sendVoice = () => {
    if (voiceCommand.trim()) {
      Speech.speak(voiceCommand);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Custom Voice Command</Text>
          
          <View style={styles.voiceSelector}>
            <Text style={styles.text}>Voice:</Text>
            <RadioButton.Group onValueChange={setVoiceType} value={voiceType}>
              <View style={styles.radioRow}>
                <RadioButton value="female" color="#ff8c00" />
                <Text style={styles.text}>Female</Text>
              </View>
              <View style={styles.radioRow}>
                <RadioButton value="male" color="#ff8c00" />
                <Text style={styles.text}>Male</Text>
              </View>
            </RadioButton.Group>
          </View>
          
          <TextInput
            label="Say something..."
            value={voiceCommand}
            onChangeText={setVoiceCommand}
            style={styles.voiceInput}
          />
          
          <Button mode="contained" onPress={sendVoice} style={styles.orangeButton}>
            Speak
          </Button>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Voice Command Examples</Text>
              <Text style={styles.text}>• "Navigate to library"</Text>
              <Text style={styles.text}>• "Where am I?"</Text>
              <Text style={styles.text}>• "Enable quiet mode"</Text>
              <Text style={styles.text}>• "Check battery status"</Text>
              <Text style={styles.text}>• "Delete logs"</Text>
            </Card.Content>
          </Card>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
  },
  tabBar: {
    backgroundColor: '#e67300',
    borderTopColor: '#ff8c00',
  },
  title: {
    color: '#ff8c00',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#333333',
  },
  subtitle: {
    color: '#666666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 2,
  },
  statusCard: {
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
  },
  cardTitle: {
    color: '#ff8c00',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  webview: {
    height: 300,
    borderRadius: 10,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  voiceButton: {
    backgroundColor: '#ff8c00',
  },
  voiceButtonLabel: {
    color: '#ffffff',
  },
  statusContainer: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 5,
  },
  modeButton: {
    flex: 1,
    borderColor: '#ff8c00',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  orangeButton: {
    backgroundColor: '#ff8c00',
  },
  outlinedButton: {
    borderColor: '#ff8c00',
  },
  listItem: {
    marginBottom: 5,
    color: '#333333',
  },
  sliderContainer: {
    marginBottom: 15,
  },
  sliderBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#ff8c00',
  },
  sliderControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: 60,
    borderColor: '#ff8c00',
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  placeholderText: {
    color: '#666666',
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  voiceSelector: {
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  voiceInput: {
    backgroundColor: '#ffffff',
    marginBottom: 15,
  },
});

export default App;