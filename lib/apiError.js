/** An expected problem, with a message that's safe to show the person. */
export class ApiError extends Error {
  constructor(status, message, suggestions) {
    super(message);
    this.status = status;
    this.suggestions = suggestions;
  }
}
