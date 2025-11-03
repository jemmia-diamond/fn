export class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = "HaravanApiError";
    this.statusCode = 400;
  }
}
