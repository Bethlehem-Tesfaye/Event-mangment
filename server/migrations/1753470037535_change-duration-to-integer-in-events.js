export function up(pgm) {
  pgm.alterColumn("events", "duration", {
    type: "integer",
    using: "duration::integer"
  });
}

export function down(pgm) {
  pgm.alterColumn("events", "duration", {
    type: "text",
    using: "duration::text"
  });
}
