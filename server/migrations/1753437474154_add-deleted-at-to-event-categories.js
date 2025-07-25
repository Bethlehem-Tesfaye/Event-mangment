export function up(pgm) {
  pgm.addColumn("event_categories", {
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });
}

export function down(pgm) {
  pgm.dropColumn("event_categories", "deleted_at");
}
