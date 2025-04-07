export interface State {
    id: string;
    name: string;
    created_at: string;
  }
  
  export interface ClimateData {
    id: string;
    state_id: string;
    year: number;
    temperature: number;
    pollution: number;
    precipitation: number;
    rainfall: number;
    humidity: number;
    wind_speed: number;
    created_at: string;
  }
  
  export interface DataTypeInfo {
    id: string;
    label: string;
    unit: string;
    color: string;
  }