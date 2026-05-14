import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, DataTable } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import api from '../services/api';

interface ReportData {
  totalMensagens: number;
  mensagensPorCategoria: {
    categoria: string;
    quantidade: number;
  }[];
  mensagensPorPeriodo: {
    periodo: string;
    quantidade: number;
  }[];
}

export function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  async function loadReportData() {
    try {
      const response = await api.get('/relatorios');
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const chartData = data?.mensagensPorCategoria.map(item => ({
    name: item.categoria,
    population: item.quantidade,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  })) || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Relatórios</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Total de Mensagens</Text>
          <Text style={styles.cardValue}>{data?.totalMensagens || 0}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Mensagens por Categoria</Text>
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Mensagens por Período</Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Período</DataTable.Title>
              <DataTable.Title numeric>Quantidade</DataTable.Title>
            </DataTable.Header>

            {data?.mensagensPorPeriodo.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.periodo}</DataTable.Cell>
                <DataTable.Cell numeric>{item.quantidade}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 24,
    color: '#2196F3',
  },
}); 