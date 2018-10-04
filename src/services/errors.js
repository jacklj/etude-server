export function NoEventsError(message) {
  this.name = 'NoEventsError';
  this.message = message;
  this.stack = (new Error()).stack;
}
NoEventsError.prototype = Object.create(Error.prototype);

export function EventNotFoundError(message) {
  this.name = 'EventNotFoundError';
  this.message = message;
  this.stack = (new Error()).stack;
}
EventNotFoundError.prototype = Object.create(Error.prototype);
