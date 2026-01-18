import cron from "node-cron";
import EventRegistration from "../models/EventRegistration.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";

const formatSG = (date) =>
  new Date(date).toLocaleString("en-SG", { timeZone: "Asia/Singapore" });

export const startThreeDayReminderJob = () => {
  console.log("3-day reminder job initialized (SGT).");
  cron.schedule(
    "0 9 * * *",
    async () => {
      try {
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const registrations = await EventRegistration.find({
          status: 0,
          $or: [
            { wantsEmailReminder: true, emailReminderSent: false },
            { wantsInAppReminder: true, inAppReminderSent: false },
          ],
        })
          .populate("event")
          .populate("user");
        const due = registrations.filter((reg) => {
          const eventStart = new Date(reg.event.startDateTime);
          return eventStart > now && eventStart <= threeDaysFromNow;
        });
        for (const reg of due) {
          const { user, event } = reg;
          // 1) EMAIL reminder
          if (reg.wantsEmailReminder && !reg.emailReminderSent) {
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

          // 2) IN-APP reminder
          if (reg.wantsInAppReminder && !reg.inAppReminderSent) {
            await Notification.create({
              user: user._id,
              event: event._id,
              type: "EVENT_REMINDER",
              title: event.title,
              message: `Your event starts on ${formatSG(event.startDateTime)} (within the next 3 days).`,
            });
            await EventRegistration.updateOne(
              { _id: reg._id, inAppReminderSent: false },
              { $set: { inAppReminderSent: true } }
            );
          }
        }
        console.log("3-day reminder job completed.");
      } catch (err) {
        console.error("3-day reminder job failed:", err);
      }
    },
    { timezone: "Asia/Singapore" }
  );
};

// Use to test if email and notification service is working, this will run every minute to check events happening in less than 3 days. I left it in for demo purposes aft submission
// import cron from "node-cron";
// import EventRegistration from "../models/EventRegistration.js";
// import Notification from "../models/Notification.js";
// import { sendEmail } from "./emailService.js";

// const formatSG = (date) =>
//   new Date(date).toLocaleString("en-SG", {
//     timeZone: "Asia/Singapore",
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// export const startThreeDayReminderJob = () => {
//   console.log("Test reminder job initialized: runs every minute (SGT).");
//   cron.schedule(
//     "* * * * *", // every minute
//     async () => {
//       const jobStartedAt = new Date();
//       const windowEnd = new Date(jobStartedAt.getTime() + 3 * 24 * 60 * 60 * 1000);

//       console.log("Running reminder test job...");
//       console.log("   Now (SGT):       ", formatSG(jobStartedAt));
//       console.log("   Window end (SGT):", formatSG(windowEnd));
//       try {
//         const registrations = await EventRegistration.find({
//           status: 0, 
//           $or: [
//             { wantsEmailReminder: true, emailReminderSent: false },
//             { wantsInAppReminder: true, inAppReminderSent: false },
//           ],
//         })
//           .populate("event")
//           .populate("user");
//         const due = registrations.filter((reg) => {
//           if (!reg.event?.startDateTime) return false;
//           const eventStart = new Date(reg.event.startDateTime);
//           return eventStart > jobStartedAt && eventStart <= windowEnd;
//         });
//         console.log(`   Eligible registrations: ${registrations.length}`);
//         console.log(`   Due within 3 days:      ${due.length}`);
//         for (const reg of due) {
//           const { user, event } = reg;
//           // email reminder
//           if (reg.wantsEmailReminder && !reg.emailReminderSent) {
//             await sendEmail(
//               user.email,
//               `Reminder: ${event.title} is coming up soon`,
//               `Hi ${user.username},\nYour event "${event.title}" starts on ${formatSG(
//                 event.startDateTime
//               )}.\n`,
//               `
//                 <h2>Event Reminder</h2>
//                 <p>Hi <strong>${user.username}</strong>,</p>
//                 <p>Your event <strong>${event.title}</strong> is coming up soon.</p>
//                 <p>Start Time: <b>${formatSG(event.startDateTime)}</b></p>
//               `
//             );
//             await EventRegistration.updateOne(
//               { _id: reg._id, emailReminderSent: false },
//               { $set: { emailReminderSent: true } }
//             );
//           }
//           // In-app reminder
//           if (reg.wantsInAppReminder && !reg.inAppReminderSent) {
//             await Notification.create({
//               user: user._id,
//               event: event._id,
//               type: "EVENT_REMINDER",
//               title: `Reminder: ${event.title}`,
//               message: `Your event starts on ${formatSG(event.startDateTime)}.`,
//               read: false,
//             });
//             await EventRegistration.updateOne(
//               { _id: reg._id, inAppReminderSent: false },
//               { $set: { inAppReminderSent: true } }
//             );
//           }
//         }
//         console.log("Reminder test job completed.\n");
//       } catch (err) {
//         console.error("Reminder test job failed:", err);
//       }
//     },
//     { timezone: "Asia/Singapore" }
//   );
// };