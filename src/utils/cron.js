//cron for deleting the period over transactions
const cron = require("node-cron");
const prisma = require("../db/prisma");

const job = cron.schedule("*/2 * * * *", async () => {
  console.log("cron running at : ", new Date(Date.now()));
  const data = await prisma.map_customer.deleteMany({
    where: {
      // user_id: {
      //   not: null,
      // },
      status: "locked",
      lock_expires: {
        lt: new Date(Date.now()),
      },
    },
  });

  console.log(data);
});

job.start();

module.exports = {
  job,
};
