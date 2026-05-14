import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { MapPin, Navigation, Search, Camera, School, Cpu } from 'lucide-react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { NavigationScene } from './src/components/NavigationScene';

// Firebase configuration
import { db, rtdb } from './src/config/Firebase';
import { ref, onValue } from 'firebase/database'; 
import { collection, getDocs } from 'firebase/firestore';
import { findPath } from './src/services/PathFinder';
import { styles, COLORS } from './src/styles/theme';

export default function App() {
  // ── 1. States ──────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Campus Toggle: 'Nodes_Main' or 'Nodes_Digital'
  const [selectedCampus, setSelectedCampus] = useState('Nodes_Main'); 
  // Sub-Building Filter: 'ALL', 'Gd_1', 'Gd_2', 'Gd_3'
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');

  const [nodeMap, setNodeMap] = useState({});
  const [lookupMap, setLookupMap] = useState({});
  const [startID, setStartID] = useState('');
  const [endID, setEndID] = useState('');
  const [path, setPath] = useState([]);

  const [liveSettings, setLiveSettings] = useState({
    lineColor: COLORS.primary,
    yOffset: -1.2,
  });

  // ── 2. Realtime Settings Listener ──────────────────────────────────────────
  useEffect(() => {
    const settingsRef = ref(rtdb, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLiveSettings({
          lineColor: data.lineColor || COLORS.primary,
          yOffset: parseFloat(data.yOffset) ?? -1.2,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // ── 3. Dynamic Node Loader ──────────────────────────────────────────────────
  useEffect(() => {
    const loadNodes = async () => {
      setLoading(true);
      try {
        const nodesCol = collection(db, selectedCampus);
        const querySnapshot = await getDocs(nodesCol);

        const rawMap = {};
        const nameMap = {};

        querySnapshot.forEach(doc => {
          const data = doc.data();
          const docId = doc.id;
          rawMap[docId] = data;

          // Recognition Logic: Only add rooms to the lookup list if they match 
          // the selected building filter (or if searching all of Main Campus).
          const isMain = selectedCampus === 'Nodes_Main';
          const matchesBuilding = 
            !isMain || 
            selectedBuilding === 'ALL' || 
            docId.startsWith(selectedBuilding);

          if (matchesBuilding && data.rooms && Array.isArray(data.rooms)) {
            data.rooms.forEach(room => {
              if (room.roomName) {
                const normalized = room.roomName.toLowerCase().trim();
                nameMap[normalized] = docId;
              }
            });
          }
        });

        setNodeMap(rawMap);
        setLookupMap(nameMap);
        setLoading(false);
      } catch (err) {
        console.error('Data Load Error: ', err);
        setLoading(false);
      }
    };
    loadNodes();
  }, [selectedCampus, selectedBuilding]);

  // ── 4. Calculation Logic ───────────────────────────────────────────────────
  const handleCalculate = () => {
    const sInput = startID.toLowerCase().trim();
    const eInput = endID.toLowerCase().trim();

    // Map room names (e.g. "Lobby") to technical IDs (e.g. "Gd_1_GroundFloor...")
    const actualStartID = lookupMap[sInput] || startID.trim();
    const actualEndID   = lookupMap[eInput] || endID.trim();

    if (!nodeMap[actualStartID] || !nodeMap[actualEndID]) {
      Alert.alert(
        'Location Not Found', 
        `We couldn't find those locations in ${selectedCampus === 'Nodes_Main' ? 'Main' : 'Digital'} Campus.`
      );
      return;
    }

    const result = findPath(actualStartID, actualEndID, nodeMap);

    if (result && result.length > 0) {
      setPath(result);
      setPage(3);
    } else {
      Alert.alert('Path Blocked', 'No connection found between these points.');
    }
  };

  // ── 5. Main Render ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>ARISE</Text>
        <Text style={styles.headerSubtitle}>
          {selectedCampus === 'Nodes_Main' ? 'Main Campus' : 'Digital Campus'}
        </Text>
      </View>

      {/* PAGE 1: DASHBOARD */}
      {page === 1 && (
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <Camera color={COLORS.primary} size={50} strokeWidth={1.5} />
            <Text style={styles.heroText}>Welcome, Navigator</Text>
            <Text style={styles.heroSubtext}>
              {Object.keys(nodeMap).length} spatial nodes synchronized for this campus.
            </Text>
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={() => setPage(2)}>
            <Navigation color="white" size={20} />
            <Text style={styles.buttonText}>START NAVIGATION</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PAGE 2: SEARCH & FILTERS */}
      {page === 2 && (
        <View style={styles.content}>
          
          {/* CAMPUS TOGGLE */}
          <View style={[styles.toggleContainer, { marginBottom: 10 }]}>
            <TouchableOpacity 
              style={[styles.toggleTab, { backgroundColor: selectedCampus === 'Nodes_Main' ? COLORS.primary : 'transparent' }]}
              onPress={() => { setSelectedCampus('Nodes_Main'); setSelectedBuilding('ALL'); }}
            >
              <School size={16} color={selectedCampus === 'Nodes_Main' ? 'white' : COLORS.grey} />
              <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: 'bold', color: selectedCampus === 'Nodes_Main' ? 'white' : COLORS.grey }}>MAIN</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleTab, { backgroundColor: selectedCampus === 'Nodes_Digital' ? COLORS.primary : 'transparent' }]}
              onPress={() => { setSelectedCampus('Nodes_Digital'); setSelectedBuilding('ALL'); }}
            >
              <Cpu size={16} color={selectedCampus === 'Nodes_Digital' ? 'white' : COLORS.grey} />
              <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: 'bold', color: selectedCampus === 'Nodes_Digital' ? 'white' : COLORS.grey }}>DIGITAL</Text>
            </TouchableOpacity>
          </View>

          {/* BUILDING SUB-FILTER (Main Campus Only) */}
          {selectedCampus === 'Nodes_Main' && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {['ALL', 'Gd_1', 'Gd_2', 'Gd_3'].map((bldg) => (
                <TouchableOpacity
                  key={bldg}
                  onPress={() => setSelectedBuilding(bldg)}
                  style={{
                    flex: 1,
                    marginHorizontal: 2,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: selectedBuilding === bldg ? COLORS.primary : COLORS.white,
                    borderWidth: 1,
                    borderColor: selectedBuilding === bldg ? COLORS.primary : '#ddd',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: selectedBuilding === bldg ? 'white' : COLORS.text }}>
                    {bldg === 'ALL' ? 'ALL' : bldg.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading ? (
             <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 30 }} />
          ) : (
            <View style={styles.searchCard}>
              <Text style={styles.label}>Origin</Text>
              <View style={styles.inputWrapper}>
                <MapPin color={COLORS.primary} size={18} />
                <TextInput 
                  style={styles.input} 
                  value={startID} 
                  onChangeText={setStartID} 
                  placeholder="Scan or type room name..." 
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.divider} />
              <Text style={styles.label}>Destination</Text>
              <View style={styles.inputWrapper}>
                <Search color={COLORS.primary} size={18} />
                <TextInput 
                  style={styles.input} 
                  value={endID} 
                  onChangeText={setEndID} 
                  placeholder="Search destination..." 
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.mainButton} onPress={handleCalculate}>
            <Text style={styles.buttonText}>CALCULATE ROUTE</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPage(1)}>
            <Text style={styles.backLink}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PAGE 3: AR NAVIGATION */}
      {page === 3 && (
        <View style={{ flex: 1 }}>
          <ViroARSceneNavigator
            autofocus={true}
            initialScene={{ scene: NavigationScene }}
            viroAppProps={{
              path: path,
              lineColor: liveSettings.lineColor,
              yOffset: liveSettings.yOffset,
              startNode: path[0],
            }}
            style={{ flex: 1 }}
          />

          <View style={[styles.navHUD, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                {path.length > 1 
                  ? (path[1]?.nodeID?.includes('Portal') ? "Bridge to Next Building" : `Head to ${path[path.length-1].nodeID.split('_').pop()}`)
                  : 'Destination Reached'}
              </Text>
              <Text style={styles.distanceText}>{path.length} waypoints remaining</Text>
            </View>

            <TouchableOpacity 
              style={[styles.mainButton, { backgroundColor: 'rgba(178, 34, 34, 0.9)' }]} 
              onPress={() => { setPath([]); setPage(1); }}
            >
              <Text style={styles.buttonText}>END SESSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}