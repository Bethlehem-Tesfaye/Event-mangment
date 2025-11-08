/* eslint-disable no-console */
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma.js";

dotenv.config();

const seed = async () => {
  try {
    // 1. Create Organizer and Attendee
    const [organizer, attendee] = await Promise.all(
      ["organizer@example.com", "attendee@example.com"].map(async (email) => {
        const passwordHash = await bcrypt.hash("Test1234!", 10);

        // Upsert user
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            id: uuidv4(),
            email,
            name: email === "organizer@example.com" ? "Organizer" : "Attendee",
            profile: {
              create: {
                firstName:
                  email === "organizer@example.com" ? "Organizer" : "Attendee",
                lastName: "User",
                city: "Addis Ababa",
                country: "Ethiopia",
                picture: "https://loremflickr.com/320/240/person"
              }
            }
          }
        });

        // Create account for login
        await prisma.account.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            providerId: "email",
            accountId: email,
            password: passwordHash
          }
        });

        return user;
      })
    );

    // 2. Create Categories
    const categoryNames = [
      "Tech",
      "Business",
      "Education",
      "Health",
      "Entertainment",
      "Art",
      "Science",
      "Sports",
      "Music",
      "Finance",
      "Technology",
      "Food",
      "Travel",
      "Lifestyle"
    ];

    await prisma.category.createMany({
      data: categoryNames.map((name) => ({ name })),
      skipDuplicates: true
    });

    const categories = await prisma.category.findMany({ take: 3 });

    // 3. Create Event
    const event = await prisma.event.create({
      data: {
        userId: organizer.id,
        title: "Tech Expo 2025",
        description: "An event showcasing the latest in technology.",
        locationType: "inPerson",
        location: "Skylight Hotel, Addis Ababa",
        status: "published",
        startDatetime: new Date("2025-09-15T09:00:00"),
        endDatetime: new Date("2025-09-15T17:00:00"),
        duration: 480,
        eventBannerUrl: "https://loremflickr.com/800/400/technology"
      }
    });

    // 4. Link Categories to Event
    await prisma.eventCategory.createMany({
      data: categories.map((cat) => ({
        eventId: event.id,
        categoryId: cat.id
      }))
    });

    // 5. Add Speakers
    await prisma.eventSpeaker.createMany({
      data: [
        {
          eventId: event.id,
          name: "Bethlehem T.",
          bio: "Engineer and tech speaker.",
          photoUrl: "https://loremflickr.com/320/240/portrait"
        },
        {
          eventId: event.id,
          name: "John Doe",
          bio: "Entrepreneur and business mentor.",
          photoUrl: "https://loremflickr.com/320/240/business"
        }
      ]
    });

    // 6. Add Ticket
    const ticket = await prisma.ticket.create({
      data: {
        eventId: event.id,
        type: "Standard",
        price: 250.0,
        totalQuantity: 50,
        remainingQuantity: 50,
        maxPerUser: 1
      }
    });

    // 7. Register Attendee
    await prisma.registration.create({
      data: {
        eventId: event.id,
        userId: attendee.id,
        ticketType: ticket.id,
        registeredQuantity: 1
      }
    });

    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during seed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
