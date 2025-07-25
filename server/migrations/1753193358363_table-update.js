export function up(pgm) {
  pgm.dropColumns("events", ["start_time", "end_time", "date"]);
  pgm.addColumns("events", {
    start_datetime: { type: "timestamp", notNull: true },
    end_datetime: { type: "timestamp", notNull: true },
    duration: { type: "text" }
  });
  pgm.addColumn("events", {
    event_banner_url: { type: "varchar(255)" }
  });

  pgm.renameColumn("tickets", "quantity", "current_quantity");
  pgm.addColumn("tickets", {
    total_quantity: { type: "integer", notNull: true }
  });

  pgm.createType("location_type_enum", ["online", "in-person"]);
  pgm.alterColumn("events", "location_type", {
    type: "location_type_enum",
    using: "location_type::text::location_type_enum"
  });

  pgm.alterColumn("events", "status", { default: null });
  pgm.createType("event_status_enum", ["draft", "published", "canceled"]);
  pgm.alterColumn("events", "status", {
    type: "event_status_enum",
    using: "status::text::event_status_enum"
  });
  pgm.alterColumn("events", "status", { default: "draft" });
}

export function down(pgm) {
  pgm.dropColumns("events", ["start_datetime", "end_datetime", "duration"]);
  pgm.addColumns("events", {
    date: { type: "date", notNull: true },
    start_time: { type: "time", notNull: true },
    end_time: { type: "time", notNull: true }
  });

  pgm.dropColumn("tickets", "total_quantity");
  pgm.renameColumn("tickets", "current_quantity", "quantity");

  pgm.alterColumn("events", "location_type", { type: "varchar(50)" });
  pgm.dropType("location_type_enum");

  pgm.alterColumn("events", "status", { type: "varchar(20)" });
  pgm.dropType("event_status_enum");
}
