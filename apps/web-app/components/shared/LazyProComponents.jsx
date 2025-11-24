/**
 * Legacy Pro Components Compatibility Layer
 * 
 * @deprecated This file provides placeholder components for legacy Ant Design Pro components.
 * All components have been migrated to Flowbite equivalents:
 * - ProTable → FlowbiteTable (use FlowbiteTable from '@/components/shared/FlowbiteTable')
 * - ProForm → Flowbite Form components (use TextInput, Select, etc. from 'flowbite-react')
 * - ProCard → Card (use Card from 'flowbite-react')
 * 
 * This file is kept for backward compatibility only. Remove imports and update code to use Flowbite components directly.
 */

"use client";

import dynamic from 'next/dynamic';
import { Spinner, Card } from 'flowbite-react';

// Loading component
const ComponentLoading = () => (
  <div className="flex justify-center items-center min-h-[200px] p-5">
    <Spinner size="xl" />
  </div>
);

/**
 * @deprecated Use FlowbiteTable from '@/components/shared/FlowbiteTable' instead
 */
export const ProTable = dynamic(
  () => Promise.resolve(() => (
    <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700 rounded-lg">
      <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
        ⚠️ ProTable is deprecated. Please use FlowbiteTable from '@/components/shared/FlowbiteTable'
      </p>
    </div>
  )),
  { 
    ssr: false,
    loading: () => <ComponentLoading />
  }
);

/**
 * @deprecated Use Flowbite Form components (TextInput, Select, etc.) from 'flowbite-react' instead
 */
export const ProForm = dynamic(
  () => Promise.resolve(() => (
    <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700 rounded-lg">
      <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
        ⚠️ ProForm is deprecated. Please use Flowbite Form components (TextInput, Select, etc.) from 'flowbite-react'
      </p>
    </div>
  )),
  { 
    ssr: false,
    loading: () => <ComponentLoading />
  }
);

/**
 * @deprecated Use TextInput from 'flowbite-react' instead
 */
export const ProFormText = dynamic(
  () => Promise.resolve(() => <div className="text-yellow-600">⚠️ Use TextInput from 'flowbite-react'</div>),
  { ssr: false }
);

/**
 * @deprecated Use Select from 'flowbite-react' instead
 */
export const ProFormSelect = dynamic(
  () => Promise.resolve(() => <div className="text-yellow-600">⚠️ Use Select from 'flowbite-react'</div>),
  { ssr: false }
);

/**
 * @deprecated Use NumberInput or TextInput with type="number" from 'flowbite-react' instead
 */
export const ProFormDigit = dynamic(
  () => Promise.resolve(() => <div className="text-yellow-600">⚠️ Use NumberInput from Flowbite components</div>),
  { ssr: false }
);

/**
 * @deprecated Use Datepicker from 'flowbite-react' instead
 */
export const ProFormDatePicker = dynamic(
  () => Promise.resolve(() => <div className="text-yellow-600">⚠️ Use Datepicker from 'flowbite-react'</div>),
  { ssr: false }
);

/**
 * @deprecated Use Textarea from 'flowbite-react' instead
 */
export const ProFormTextArea = dynamic(
  () => Promise.resolve(() => <div className="text-yellow-600">⚠️ Use Textarea from 'flowbite-react'</div>),
  { ssr: false }
);

/**
 * ProCard replacement - use Flowbite Card directly
 * This is kept for backward compatibility but just re-exports Flowbite Card
 */
export const ProCard = dynamic(
  () => Promise.resolve(Card),
  { 
    ssr: true,
    loading: () => <div className="min-h-[100px]" />
  }
);
