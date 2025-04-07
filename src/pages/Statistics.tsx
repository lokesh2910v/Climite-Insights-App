import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStates } from '@/hooks/useStates';
import { useClimateData } from '@/hooks/useClimateData';
import { ClimateData } from '@/types/climate'; 
import Layout from '@/pages/Layout';

const dataTypes = [
  { id: 'temperature', label: 'Temperature', unit: '°C', color: '#FF9800' },
  { id: 'pollution', label: 'Pollution (AQI)', unit: 'AQI', color: '#F44336' },
  { id: 'precipitation', label: 'Precipitation', unit: 'mm', color: '#2196F3' },
  { id: 'rainfall', label: 'Rainfall', unit: 'mm', color: '#4CAF50' },
  { id: 'humidity', label: 'Humidity', unit: '%', color: '#9C27B0' },
  { id: 'wind_speed', label: 'Wind Speed', unit: 'km/h', color: '#00BCD4' },
];

const Statistics: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDataType, setSelectedDataType] = useState<string>('temperature');

  const { states, loading: statesLoading, error: statesError } = useStates();
  const {
    data: chartData,
    loading: dataLoading,
    error: dataError,
  } = useClimateData(selectedState, selectedDataType as keyof ClimateData); // 🔥 FIXED

  const dataTypeInfo = dataTypes.find(type => type.id === selectedDataType) || dataTypes[0];

  const latestValue = chartData && chartData.length > 0
    ? chartData[chartData.length - 1].value
    : 0;

  const getStatusColor = () => {
    if (selectedDataType === 'temperature') {
      return latestValue > 30 ? 'text-red-500' : 'text-green-500';
    } else if (selectedDataType === 'pollution') {
      return latestValue > 100 ? 'text-red-500' : 'text-green-500';
    }
    return 'text-blue-500';
  };

  if (statesLoading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (statesError || dataError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{statesError || dataError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Indian Climate Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Select State</label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-80">
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Select Data Type</label>
          <Select value={selectedDataType} onValueChange={setSelectedDataType}>
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              {dataTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Viewing historical trend data for {dataTypeInfo.label} in {selectedState}.
          This data is regularly updated from reliable climate sources in India.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{dataTypeInfo.label} Trend</span>
            <span className={`text-sm font-normal ${getStatusColor()}`}>
              Latest: {latestValue} {dataTypeInfo.unit}
            </span>
          </CardTitle>
          <CardDescription>Historical data visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} ${dataTypeInfo.unit}`, dataTypeInfo.label]}
                  labelFormatter={(value) => `Year: ${value}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={dataTypeInfo.color}
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average {dataTypeInfo.label}</CardTitle>
            <CardDescription>Historical average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {chartData ? (chartData.reduce((acc, item) => acc + item.value, 0) / chartData.length).toFixed(1) : 0} {dataTypeInfo.unit}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Highest {dataTypeInfo.label}</CardTitle>
            <CardDescription>Peak recorded value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {chartData ? Math.max(...chartData.map(item => item.value)).toFixed(1) : 0} {dataTypeInfo.unit}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Recorded in {chartData ? chartData.find(item => item.value === Math.max(...chartData.map(d => d.value)))?.year : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lowest {dataTypeInfo.label}</CardTitle>
            <CardDescription>Minimum recorded value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {chartData ? Math.min(...chartData.map(item => item.value)).toFixed(1) : 0} {dataTypeInfo.unit}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Recorded in {chartData ? chartData.find(item => item.value === Math.min(...chartData.map(d => d.value)))?.year : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
    </Layout>
  );
};

export default Statistics;
