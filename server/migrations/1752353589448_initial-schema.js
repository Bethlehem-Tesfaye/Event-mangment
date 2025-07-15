export function up(pgm) {
  // users
  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(255)", notNull: true, unique: true },
    password: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  // profiles
  pgm.createTable("profiles", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      unique: true,
      references: "users(id)",
      onDelete: "cascade"
    },
    first_name: { type: "varchar(255)" },
    last_name: { type: "varchar(255)" },
    phone: { type: "varchar(20)" },
    city: { type: "varchar(100)" },
    country: { type: "varchar(100)" },
    address: { type: "text" }
  });

  // events
  pgm.createTable("events", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade"
    },
    title: { type: "varchar(255)", notNull: true },
    description: { type: "text", notNull: true },
    date: { type: "date", notNull: true },
    start_time: { type: "time", notNull: true },
    end_time: { type: "time", notNull: true },
    location_type: { type: "varchar(50)", notNull: true },
    location: { type: "varchar(255)", notNull: true },
    status: { type: "varchar(20)", notNull: true, default: "draft" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  // categories
  pgm.createTable("categories", {
    id: "id",
    name: { type: "varchar(30)", notNull: true, unique: true }
  });

  // event_categories
  pgm.createTable("event_categories", {
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade"
    },
    category_id: {
      type: "integer",
      notNull: true,
      references: "categories(id)",
      onDelete: "cascade"
    }
  });
  pgm.addConstraint("event_categories", "pk_event_categories", {
    primaryKey: ["event_id", "category_id"]
  });

  // event_speakers
  pgm.createTable("event_speakers", {
    id: "id",
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade"
    },
    name: { type: "varchar(255)", notNull: true },
    bio: { type: "text" },
    photo_url: { type: "varchar(255)" }
  });

  // tickets
  pgm.createTable("tickets", {
    id: "id",
    event_id: {
      type: "integer",
      notNull: true,
      references: "events(id)",
      onDelete: "cascade"
    },
    type: { type: "varchar(100)", notNull: true },
    price: { type: "numeric(10,2)", notNull: true },
    quantity: { type: "integer", notNull: true },
    max_per_user: { type: "integer", notNull: true, default: 1 }
  });

  // registrations
  pgm.createTable("registrations", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users(id)",
      onDelete: "cascade"
    },
    ticket_id: {
      type: "integer",
      notNull: true,
      references: "tickets(id)",
      onDelete: "cascade"
    },
    quantity: { type: "integer", notNull: true, default: 1 },
    registered_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });
}

export function down(pgm) {
  pgm.dropTable("registrations");
  pgm.dropTable("tickets");
  pgm.dropTable("event_speakers");
  pgm.dropTable("event_categories");
  pgm.dropTable("categories");
  pgm.dropTable("events");
  pgm.dropTable("profiles");
  pgm.dropTable("users");
}
