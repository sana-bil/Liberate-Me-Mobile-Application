import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { colors } from '../theme/colors';
import { useAuth } from '../services/AuthContext';

const { width } = Dimensions.get('window');

const ML_API_URL = 'https://sanabillll-ml-backend-api.hf.space';

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } catch {
    return dateStr;
  }
};

const getMoodColor = (score: number): string => {
  if (score >= 8) return '#D32F2F';  // Severe (dark red)
  if (score >= 6) return '#FF6B6B';  // High (red)
  if (score >= 4) return '#FFA500';  // Moderate (orange)
  if (score >= 2) return '#FFD93D';  // Mild (yellow)
  return '#6BCF7F';                  // Good (green)
};

export default function InsightsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'7' | '14' | '30' | '90'>('7');
  const chartRef = React.useRef<any>(null);

  useEffect(() => {
    fetchAnalysis();
    fetchHistoricalData();
  }, []);

  const fetchAnalysis = async () => {
    if (!user?.uid) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const url = `${ML_API_URL}/analyze/${user.uid}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      if (text.trim().startsWith('<')) throw new Error('HTML response');

      const data = JSON.parse(text);

      if (data.status === 'success') {
        setAnalysis(data);
      } else if (data.status === 'no_data') {
        setError('Not enough data yet. Keep journaling!');
      } else {
        setError(data.message || 'Unable to analyze');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('API is waking up... Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchHistoricalData = async () => {
    if (!user?.uid) return;

    try {
      setHistoryLoading(true);
      const url = `${ML_API_URL}/history/${user.uid}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const text = await response.text();
      if (text.trim().startsWith('<')) throw new Error('HTML response');

      const data = JSON.parse(text);

      if (data.status === 'success' && Array.isArray(data.history)) {
        const sorted = data.history.sort((a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setHistoricalData(sorted);
      } else {
        setHistoricalData([]);
      }
    } catch (err: any) {
      console.error('History error:', err);
      setHistoricalData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!historicalData || historicalData.length === 0) return [];

    const days = parseInt(selectedRange);
    return historicalData.slice(-days);
  };

  const getDepressionChartData = () => {
    const data = getFilteredData();
    if (data.length === 0) return [];

    return data.map((item: any) => ({
      value: item.depression_score || 0,
      label: formatDate(item.date),
      frontColor: getMoodColor(item.depression_score || 0),
      topLabelComponent: () => (
        <Text style={styles.barTopLabel}>{item.depression_score?.toFixed(1) || '0'}</Text>
      ),
    }));
  };

  const getAnxietyChartData = () => {
    const data = getFilteredData();
    if (data.length === 0) return [];

    return data.map((item: any) => ({
      value: item.anxiety_score || 0,
      label: formatDate(item.date),
      frontColor: getMoodColor(item.anxiety_score || 0),
      topLabelComponent: () => (
        <Text style={styles.barTopLabel}>{item.anxiety_score?.toFixed(1) || '0'}</Text>
      ),
    }));
  };

  const exportCharts = async () => {
    try {
      if (chartRef.current) {
        const uri = await captureRef(chartRef, {
          format: 'png',
          quality: 1,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Exported!', 'Chart saved to device');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalysis();
    fetchHistoricalData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Insights</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing your journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Insights</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>{error}</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const depressionData = getDepressionChartData();
  const anxietyData = getAnxietyChartData();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mental Health Insights</Text>
        <TouchableOpacity onPress={exportCharts}>
          <Text style={styles.exportText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TIME RANGE SELECTOR */}
        <View style={styles.rangeSection}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.rangeButtons}>
            {['7', '14', '30', '90'].map((days) => (
              <TouchableOpacity
                key={days}
                style={[styles.rangeButton, selectedRange === days && styles.rangeButtonActive]}
                onPress={() => setSelectedRange(days as any)}
              >
                <Text style={[styles.rangeButtonText, selectedRange === days && styles.rangeButtonTextActive]}>
                  {days === '7' ? '1 Week' : days === '14' ? '2 Weeks' : days === '30' ? '1 Month' : '3 Months'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View ref={chartRef} collapsable={false}>
          {/* DEPRESSION CHART */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Depression Mood Score</Text>
                <Text style={styles.chartSubtitle}>Daily mood intensity (0 = good, 10 = severe)</Text>
              </View>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeLabel}>Current</Text>
                <Text style={styles.currentBadgeValue}>{analysis.depression_level?.toUpperCase()}</Text>
              </View>
            </View>

            {historyLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color="#FF6B6B" />
              </View>
            ) : depressionData.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={depressionData}
                  height={220}
                  width={Math.max(width - 60, depressionData.length * 35)}
                  barWidth={28}
                  spacing={depressionData.length > 20 ? 8 : 15}
                  roundedTop
                  roundedBottom
                  hideRules
                  xAxisThickness={1}
                  yAxisThickness={1}
                  xAxisColor="#E0E0E0"
                  yAxisColor="#E0E0E0"
                  yAxisTextStyle={{ color: '#999', fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: '#666', fontSize: 10, marginTop: 5 }}
                  noOfSections={5}
                  maxValue={10}
                  isAnimated
                  animationDuration={600}
                />
              </ScrollView>
            ) : (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>No data for this period</Text>
              </View>
            )}

            {/* LEGEND */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6BCF7F' }]} />
                <Text style={styles.legendText}>0-2 Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFD93D' }]} />
                <Text style={styles.legendText}>2-4 Mild</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                <Text style={styles.legendText}>4-6 Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>6-8 High</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D32F2F' }]} />
                <Text style={styles.legendText}>8-10 Severe</Text>
              </View>
            </View>
          </View>

          {/* ANXIETY CHART */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Anxiety Mood Score</Text>
                <Text style={styles.chartSubtitle}>Daily mood intensity (0 = calm, 10 = severe)</Text>
              </View>
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeLabel}>Current</Text>
                <Text style={styles.currentBadgeValue}>{analysis.anxiety_level?.toUpperCase()}</Text>
              </View>
            </View>

            {historyLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color="#FFA500" />
              </View>
            ) : anxietyData.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={anxietyData}
                  height={220}
                  width={Math.max(width - 60, anxietyData.length * 35)}
                  barWidth={28}
                  spacing={anxietyData.length > 20 ? 8 : 15}
                  roundedTop
                  roundedBottom
                  hideRules
                  xAxisThickness={1}
                  yAxisThickness={1}
                  xAxisColor="#E0E0E0"
                  yAxisColor="#E0E0E0"
                  yAxisTextStyle={{ color: '#999', fontSize: 11 }}
                  xAxisLabelTextStyle={{ color: '#666', fontSize: 10, marginTop: 5 }}
                  noOfSections={5}
                  maxValue={10}
                  isAnimated
                  animationDuration={600}
                />
              </ScrollView>
            ) : (
              <View style={styles.noData}>
                <Text style={styles.noDataText}>No data for this period</Text>
              </View>
            )}

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6BCF7F' }]} />
                <Text style={styles.legendText}>0-2 Calm</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFD93D' }]} />
                <Text style={styles.legendText}>2-4 Mild</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                <Text style={styles.legendText}>4-6 Moderate</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>6-8 High</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D32F2F' }]} />
                <Text style={styles.legendText}>8-10 Severe</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SUMMARY STATS */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{analysis.total_days_analyzed || 0}</Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{analysis.negative_days || 0}</Text>
              <Text style={styles.statLabel}>Difficult Days</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{analysis.total_entries || 0}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
          </View>
        </View>

        {/* CRISIS WARNING */}
        {analysis.crisis_detected && (
          <View style={styles.crisisCard}>
            <Text style={styles.crisisEmoji}>⚠️</Text>
            <Text style={styles.crisisTitle}>Immediate Support Available</Text>
            <Text style={styles.crisisText}>We've detected concerning thoughts. You're not alone.</Text>
            <TouchableOpacity
              style={styles.crisisButton}
              onPress={() => navigation.navigate('EmergencySOS')}
            >
              <Text style={styles.crisisButtonText}>Get Help Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Overall analysis based on DSM-V criteria</Text>
          <Text style={styles.footerText}>Daily scores based on sentiment analysis</Text>
          <Text style={styles.footerSubtext}>
            Last updated: {new Date(analysis.analyzed_at).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backText: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  headerTitle: { fontWeight: '700', fontSize: 17, color: '#1A1A1A' },
  exportText: { fontSize: 22 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 15, color: '#666', fontWeight: '500' },
  scrollContent: { padding: 16, paddingBottom: 100 },

  // RANGE SELECTOR
  rangeSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  rangeButtons: { flexDirection: 'row', gap: 8 },
  rangeButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  rangeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeButtonText: { fontSize: 13, fontWeight: '600', color: '#666' },
  rangeButtonTextActive: { color: '#FFF' },

  // CHARTS
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  chartSubtitle: { fontSize: 12, color: '#999' },
  currentBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  currentBadgeLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  currentBadgeValue: { fontSize: 12, fontWeight: '700', color: '#333' },
  chartLoading: { paddingVertical: 100, alignItems: 'center' },
  noData: { paddingVertical: 100, alignItems: 'center' },
  noDataText: { fontSize: 14, color: '#999' },
  barTopLabel: { fontSize: 10, fontWeight: '600', color: '#666' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#666' },

  // STATS
  statsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16, backgroundColor: '#F8F9FA', borderRadius: 12 },
  statNumber: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#666', fontWeight: '500' },

  // CRISIS
  crisisCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  crisisEmoji: { fontSize: 36, marginBottom: 8 },
  crisisTitle: { fontSize: 17, fontWeight: '700', color: '#D32F2F', marginBottom: 8 },
  crisisText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  crisisButton: { backgroundColor: '#D32F2F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  crisisButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  // EMPTY STATE
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#999' },

  // FOOTER
  footer: { alignItems: 'center', marginTop: 16, marginBottom: 16 },
  footerText: { fontSize: 11, color: '#999', marginBottom: 4, textAlign: 'center' },
  footerSubtext: { fontSize: 10, color: '#CCC', marginTop: 4 },
});