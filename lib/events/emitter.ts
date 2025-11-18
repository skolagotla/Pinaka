/**
 * Event Emitter
 * 
 * Simple event system for emitting and handling events.
 * Foundation for future webhook system.
 */

import { EventType, EventPayload } from './types';

// Re-export EventType enum for convenience
export { EventType } from './types';
export type { EventPayload } from './types';

type EventHandler = (payload: EventPayload) => Promise<void> | void;

class EventEmitter {
  private handlers: Map<EventType, EventHandler[]> = new Map();

  /**
   * Register an event handler
   */
  on(eventType: EventType, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Remove an event handler
   */
  off(eventType: EventType, handler: EventHandler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit(eventType: EventType, data: any, metadata?: any): Promise<void> {
    const payload: EventPayload = {
      eventType,
      timestamp: new Date().toISOString(),
      data,
      metadata,
    };

    const handlers = this.handlers.get(eventType) || [];
    
    // Execute all handlers in parallel
    await Promise.all(
      handlers.map(handler => {
        try {
          return Promise.resolve(handler(payload));
        } catch (error) {
          console.error(`[EventEmitter] Error in handler for ${eventType}:`, error);
          return Promise.resolve();
        }
      })
    );
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter();

/**
 * Convenience function to emit events
 */
export async function emitEvent(
  eventType: EventType,
  data: any,
  metadata?: any
): Promise<void> {
  return eventEmitter.emit(eventType, data, metadata);
}

/**
 * Log all events (for debugging)
 */
if (process.env.NODE_ENV === 'development') {
  eventEmitter.on(EventType.TENANT_INVITED, (payload) => {
    console.log('[Event]', payload);
  });
  eventEmitter.on(EventType.TENANT_INVITATION_COMPLETED, (payload) => {
    console.log('[Event]', payload);
  });
}

