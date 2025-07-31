export function up(pgm) {
  pgm.renameColumn("registrations", "quantity", "registered_quantity");
  pgm.renameColumn("tickets", "current_quantity", "remaining_quantity");
  pgm.renameColumn("registrations", "ticket_id", "ticket_type");

  pgm.addColumn("registrations", {
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade"
    }
  });
}

export function down(pgm) {
  pgm.renameColumn("registrations", "registered_quantity", "quantity");
  pgm.renameColumn("tickets", "remaining_quantity", "current_quantity");
  pgm.renameColumn("registrations", "ticket_type", "ticket_id");
  pgm.dropColumn("registrations", "event_id");
}
