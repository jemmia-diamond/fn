// Polyfill for BigInt serialization
// This allows BigInt values (returned by Prisma/Postgres) to be serialized as strings in JSON responses.
// Without this, JSON.stringify() throws "Do not know how to serialize a BigInt".

if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
}
