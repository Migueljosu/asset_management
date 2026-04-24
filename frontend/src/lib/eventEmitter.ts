/**
 * Event Emitter simples para comunicação cross-component
 * Usado para notificações em tempo real entre features
 */

type Listener = () => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);

    // Retorna função de unsubscribe
    return () => {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    };
  }

  emit(event: string): void {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener());
    }
  }
}

export const notificationEmitter = new EventEmitter();

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_CREATED: 'notification:created',
} as const;
