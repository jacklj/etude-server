export const renderUpdateEventLogMessage = event => {
  let message = `Event updated (event_id: ${event.event_id}, type: ${event.type}`;
  if (event.lesson_id) {
    message = `${message}, lesson_id: ${event.lesson_id})`;
  } else if (event.masterclass_id) {
    message = `${message}, masterclass_id: ${event.masterclass_id})`;
  } else if (event.performance_id) {
    message = `${message}, performance_id: ${event.performance_id})`;
  } else {
    message = `${message})`;
  }
  return message;
};

export const renderCreateNoteLogMessage = note => {
  let message = `New note added (id: ${note.note_id})`;
  if (note.event_id) {
    message = `${message} to event ${note.event_id}`;
  } else if (note.item_id) {
    message = `${message} to item ${note.item_id}`;
  }
  return message;
};
