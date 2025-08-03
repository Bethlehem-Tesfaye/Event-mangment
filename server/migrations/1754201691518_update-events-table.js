export function up(pgm) {
  pgm.alterColumn("events", "description", { notNull: false });
  pgm.alterColumn("events", "location_type", { notNull: false });
  pgm.alterColumn("events", "location", { notNull: false });
  pgm.alterColumn("events", "start_datetime", { notNull: false });
  pgm.alterColumn("events", "end_datetime", { notNull: false });
}

export function down(pgm) {
  pgm.alterColumn("events", "description", { notNull: true });
  pgm.alterColumn("events", "location_type", { notNull: true });
  pgm.alterColumn("events", "location", { notNull: true });
  pgm.alterColumn("events", "start_datetime", { notNull: true });
  pgm.alterColumn("events", "end_datetime", { notNull: true });
}
