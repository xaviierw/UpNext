import cron from "node-cron";
import EventRegistration from "../models/EventRegistration.js";
import { sendEmail } from "./emailService.js";

const formatSG = (date) =>
  new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore" });

export const startThreeDayReminderJob = () => {
  console.log("3-day reminder job initialized (SGT).");

  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        console.log("Checking for events within the next 3 days...");
        console.log("   Now (SGT):", formatSG(now));
        console.log("   Window End (SGT):", formatSG(threeDaysFromNow));

        const registrations = await EventRegistration.find({
          status: 0,
          wantsEmailReminder: true,
          emailReminderSent: false,
        })
          .populate("event")
          .populate("user");

        const due = registrations.filter((reg) => {
          const eventStart = new Date(reg.event.startDateTime);

          return eventStart > now && eventStart <= threeDaysFromNow;
        });

        console.log(`Events happening within 3 days: ${due.length}`);

        for (const reg of due) {
          const { user, event } = reg;

          await sendEmail(
            user.email,
            `Reminder: ${event.title} is coming up soon`,
            `Hi ${user.username},\nYour event "${event.title}" starts on ${formatSG(
              event.startDateTime
            )}.\n(Within the next 3 days)`,
            `
                <h2>Event Reminder</h2>
                <p>Hi <strong>${user.username}</strong>,</p>
                <p>Your event <strong>${event.title}</strong> is coming up soon.</p>
                <p>Start Time: <b>${formatSG(event.startDateTime)}</b></p>
            `
          );

          await EventRegistration.updateOne(
            { _id: reg._id, emailReminderSent: false },
            { $set: { emailReminderSent: true } }
          );
        }

        console.log("3-day reminder job completed.");
      } catch (err) {
        console.error("3-day reminder job failed:", err);
      }
    },
    { timezone: "Asia/Singapore" }
  );
};