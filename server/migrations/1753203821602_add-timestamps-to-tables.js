export function up(pgm) {
  pgm.addColumns("profiles", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });

  pgm.addColumns("users", {
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });

  pgm.addColumns("events", {
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });

  pgm.addColumns("categories", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });

  pgm.addColumns("event_categories", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  pgm.addColumns("event_speakers", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });

  pgm.addColumns("tickets", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });

  pgm.addColumns("registrations", {
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    deleted_at: {
      type: "timestamp",
      notNull: false,
      default: null
    }
  });
}

export function down(pgm) {
  pgm.dropColumns("profiles", ["created_at", "updated_at", "deleted_at"]);

  pgm.dropColumns("users", ["updated_at", "deleted_at"]);

  pgm.dropColumns("events", ["updated_at", "deleted_at"]);

  pgm.dropColumns("categories", ["created_at", "updated_at", "deleted_at"]);

  pgm.dropColumns("event_categories", ["created_at", "updated_at"]);

  pgm.dropColumns("event_speakers", ["created_at", "updated_at", "deleted_at"]);

  pgm.dropColumns("tickets", ["created_at", "updated_at", "deleted_at"]);

  pgm.dropColumns("registrations", ["created_at", "updated_at", "deleted_at"]);
}
