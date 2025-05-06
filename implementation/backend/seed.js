require('dotenv').config();
const { sequelize, User, Account } = require('./models');
(async ()=>{
  await sequelize.sync({ force:true });
  const u = await User.create({
    name:'Demo', email:'demo@test.com', passwordHash: await require('bcryptjs').hash('demo',10)
  });
  const acct = await Account.create({
    userId:u.id, accountType:'Checking', accountNumber:'12345678', balance:500
  });

  await acct.deposit(100);
  
  console.log('Seed done: demo/demo – account 12345678');
  console.log(acct.balance);
  process.exit(0);
})();
