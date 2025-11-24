/**
 * useChartComponents Hook
 * 
 * Centralizes dynamic chart component imports to avoid SSR issues
 * Provides consistent chart loading states and error handling
 * 
 * Migrated from @ant-design/charts to recharts for Flowbite compatibility
 * 
 * Usage:
 * ```jsx
 * const { Line, Column, Pie, DualAxes, ChartLoader } = useChartComponents();
 * 
 * <ChartLoader height={400}>
 *   <Line data={chartData} ... />
 * </ChartLoader>
 * ```
 */

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Spinner } from 'flowbite-react';

const DEFAULT_LOADING_HEIGHT = 300;

/**
 * Chart loading component
 */
const ChartLoader = ({ height = DEFAULT_LOADING_HEIGHT, children }) => {
  return (
    <div className="w-full" style={{ minHeight: height }}>
      {children}
    </div>
  );
};

export function useChartComponents() {
  // Dynamically import all chart components from recharts to avoid SSR issues
  const Line = useMemo(() => dynamic(
    () => import('recharts').then(mod => mod.LineChart),
    { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center" style={{ height: DEFAULT_LOADING_HEIGHT }}>
          <Spinner size="xl" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      )
    }
  ), []);

  const Column = useMemo(() => dynamic(
    () => import('recharts').then(mod => mod.BarChart),
    { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center" style={{ height: DEFAULT_LOADING_HEIGHT }}>
          <Spinner size="xl" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      )
    }
  ), []);

  const Pie = useMemo(() => dynamic(
    () => import('recharts').then(mod => mod.PieChart),
    { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center" style={{ height: DEFAULT_LOADING_HEIGHT }}>
          <Spinner size="xl" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading chart...</span>
        </div>
      )
    }
  ), []);

  // DualAxes in recharts is typically achieved with ComposedChart
  const DualAxes = useMemo(() => dynamic(
    () => import('recharts').then(mod => mod.ComposedChart),
    { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center" style={{ height: 400 }}>
          <Spinner size="xl" />
          <span className="ml-3 text-gray-500 dark:text-gray-400">Loading chart...</span>
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

