/**
 * useChartComponents Hook
 * 
 * Centralizes dynamic chart component imports to avoid SSR issues
 * Provides consistent chart loading states and error handling
 * 
 * Usage:
 * ```jsx
 * const { Line, Column, Pie, DualAxes, ChartLoader } = useChartComponents();
 * 
 * <ChartLoader height={400}>
 *   <DualAxes data={chartData} ... />
 * </ChartLoader>
 * ```
 */

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const DEFAULT_LOADING_HEIGHT = 300;

/**
 * Chart loading component
 */
const ChartLoader = ({ height = DEFAULT_LOADING_HEIGHT, children }) => {
  return (
    <div style={{ width: '100%', minHeight: height }}>
      {children}
    </div>
  );
};

export function useChartComponents() {
  // Dynamically import all chart components to avoid SSR issues
  const Line = useMemo(() => dynamic(
    () => import('@ant-design/charts').then(mod => mod.Line),
    { 
      ssr: false,
      loading: () => (
        <div style={{ 
          height: DEFAULT_LOADING_HEIGHT, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          Loading chart...
        </div>
      )
    }
  ), []);

  const Column = useMemo(() => dynamic(
    () => import('@ant-design/charts').then(mod => mod.Column),
    { 
      ssr: false,
      loading: () => (
        <div style={{ 
          height: DEFAULT_LOADING_HEIGHT, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          Loading chart...
        </div>
      )
    }
  ), []);

  const Pie = useMemo(() => dynamic(
    () => import('@ant-design/charts').then(mod => mod.Pie),
    { 
      ssr: false,
      loading: () => (
        <div style={{ 
          height: DEFAULT_LOADING_HEIGHT, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          Loading chart...
        </div>
      )
    }
  ), []);

  const DualAxes = useMemo(() => dynamic(
    () => import('@ant-design/charts').then(mod => mod.DualAxes),
    { 
      ssr: false,
      loading: () => (
        <div style={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          Loading chart...
        </div>
      )
    }
  ), []);

  return {
    Line,
    Column,
    Pie,
    DualAxes,
    ChartLoader
  };
}

