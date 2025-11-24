/**
 * Zod to Ant Design Form Rules Adapter
 * 
 * Converts Zod schemas to Ant Design Form validation rules
 * This enables using Zod schemas (Single Source of Truth) for client-side validation
 * 
 * Usage:
 * ```tsx
 * import { zodToAntdRules } from '@/lib/utils/zod-to-antd-rules';
 * import { propertyCreateSchema } from '@/lib/schemas';
 * 
 * <Form.Item 
 *   name="addressLine1" 
 *   rules={zodToAntdRules(propertyCreateSchema.shape.addressLine1)}
 * >
 *   <Input />
 * </Form.Item>
 * ```
 */

import { z } from 'zod';
import type { Rule } from 'antd/es/form';

type AntdRule = Rule;

/**
 * Convert a Zod schema to Ant Design form rules
 */
export function zodToAntdRules(schema: z.ZodTypeAny, fieldName?: string): AntdRule[] {
  const rules: AntdRule[] = [];

  // Handle ZodString
  if (schema instanceof z.ZodString) {
    // Required check
    if (!schema.isOptional() && !schema.isNullable()) {
      rules.push({
        required: true,
        message: `${fieldName || 'This field'} is required`,
      });
    }

    // Min length
    if (schema._def.checks) {
      const minCheck = schema._def.checks?.find((check: any) => check.kind === 'min');
      if (minCheck && 'value' in minCheck) {
        rules.push({
          min: (minCheck as any).value,
          message: `${fieldName || 'This field'} must be at least ${(minCheck as any).value} characters`,
        });
      }

      // Max length
      const maxCheck = schema._def.checks?.find((check: any) => check.kind === 'max');
      if (maxCheck && 'value' in maxCheck) {
        rules.push({
          max: (maxCheck as any).value,
          message: `${fieldName || 'This field'} must be at most ${(maxCheck as any).value} characters`,
        });
      }

      // Email
      const emailCheck = schema._def.checks.find((check: any) => check.kind === 'email');
      if (emailCheck) {
        rules.push({
          type: 'email',
          message: 'Please enter a valid email address',
        });
      }

      // URL
      const urlCheck = schema._def.checks.find((check: any) => check.kind === 'url');
      if (urlCheck) {
        rules.push({
          type: 'url',
          message: 'Please enter a valid URL',
        });
      }

      // Regex pattern
      const regexCheck = schema._def.checks?.find((check: any) => check.kind === 'regex');
      if (regexCheck && 'regex' in regexCheck) {
        rules.push({
          pattern: (regexCheck as any).regex,
          message: (regexCheck as any).message || 'Invalid format',
        });
      }
    }
  }

  // Handle ZodNumber
  if (schema instanceof z.ZodNumber) {
    // Required check
    if (!schema.isOptional() && !schema.isNullable()) {
      rules.push({
        required: true,
        message: `${fieldName || 'This field'} is required`,
      });
    }

    // Min/Max
    if (schema._def.checks) {
      const minCheck = schema._def.checks.find((check: any) => check.kind === 'min');
      if (minCheck && 'value' in minCheck) {
        rules.push({
          type: 'number',
          min: (minCheck as any).value,
          message: `${fieldName || 'This field'} must be at least ${(minCheck as any).value}`,
        });
      }

      const maxCheck = schema._def.checks.find((check: any) => check.kind === 'max');
      if (maxCheck && 'value' in maxCheck) {
        rules.push({
          type: 'number',
          max: (maxCheck as any).value,
          message: `${fieldName || 'This field'} must be at most ${(maxCheck as any).value}`,
        });
      }

      const intCheck = schema._def.checks.find((check: any) => check.kind === 'int');
      if (intCheck) {
        rules.push({
          type: 'number',
          message: `${fieldName || 'This field'} must be an integer`,
          validator: (_, value) => {
            if (value === undefined || value === null || value === '') {
              return Promise.resolve();
            }
            return Number.isInteger(Number(value))
              ? Promise.resolve()
              : Promise.reject(new Error(`${fieldName || 'This field'} must be an integer`));
          },
        });
      }
    }
  }

  // Handle ZodEnum
  if (schema instanceof z.ZodEnum || (z as any).ZodNativeEnum && schema instanceof (z as any).ZodNativeEnum) {
    if (!schema.isOptional() && !schema.isNullable()) {
      rules.push({
        required: true,
        message: `${fieldName || 'This field'} is required`,
      });
    }
  }

  // Handle ZodOptional and ZodNullable
  const def = (schema as any)._def;
  if (def && (def.typeName === 'ZodOptional' || def.typeName === 'ZodNullable')) {
    // Recursively get rules from inner schema
    const innerType = def.innerType || def.type;
    if (innerType) {
      const innerRules = zodToAntdRules(innerType, fieldName);
      // Remove required rules since it's optional/nullable
      return innerRules.filter((rule: any) => !rule.required);
    }
  }

  // Handle ZodDefault
  if (def && def.typeName === 'ZodDefault') {
    const innerType = def.innerType || def.type;
    if (innerType) {
      return zodToAntdRules(innerType, fieldName);
    }
  }

  // Handle ZodRefine (custom validation) - ZodEffects in v4
  if (def && (def.typeName === 'ZodEffects' || def.typeName === 'ZodRefine')) {
    const baseSchema = def.schema || def.type;
    if (baseSchema) {
      const baseRules = zodToAntdRules(baseSchema, fieldName);
      
      // Add custom validator for refine
      baseRules.push({
        validator: async (_: any, value: any) => {
          try {
            await schema.parseAsync(value);
            return Promise.resolve();
          } catch (error) {
            if (error instanceof z.ZodError) {
              // Zod v4: use issues() instead of errors
              const issues = 'issues' in error ? (error as any).issues : (error as any).errors || [];
              const firstError = issues[0];
              return Promise.reject(new Error(firstError?.message || 'Validation failed'));
            }
            return Promise.reject(new Error('Validation failed'));
          }
        },
      });
      
      return baseRules;
    }
  }

  // Handle ZodObject (for nested objects)
  if (schema instanceof z.ZodObject) {
    // For object fields, we typically don't add rules here
    // Instead, use the shape property to get rules for specific fields
    return [];
  }

  // Generic required check for other types
  if (!schema.isOptional() && !schema.isNullable()) {
    rules.push({
      required: true,
      message: `${fieldName || 'This field'} is required`,
    });
  }

  return rules;
}

/**
 * Get validation rules for a specific field from a Zod object schema
 */
export function getFieldRules<T extends z.ZodObject<any>>(
  schema: T,
  fieldName: keyof z.infer<T>
): AntdRule[] {
  const fieldSchema = schema.shape[fieldName];
  if (!fieldSchema) {
    return [];
  }
  return zodToAntdRules(fieldSchema, String(fieldName));
}

/**
 * Create a validator function from a Zod schema
 */
export function zodValidator(schema: z.ZodTypeAny) {
  return async (_: any, value: any) => {
    try {
      await schema.parseAsync(value);
      return Promise.resolve();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Zod v4: use issues() instead of errors
        const issues = 'issues' in error ? (error as any).issues : (error as any).errors || [];
        const firstError = issues[0];
        return Promise.reject(new Error(firstError?.message || 'Validation failed'));
      }
      return Promise.reject(new Error('Validation failed'));
    }
  };
}

