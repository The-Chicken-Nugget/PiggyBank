'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Accounts', 'closedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Accounts', 'balanceTmp', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.sequelize.query(
      'UPDATE "Accounts" SET "balanceTmp" = ROUND("balance"*100)::int;'
    );
    await queryInterface.removeColumn('Accounts', 'balance');
    await queryInterface.renameColumn('Accounts', 'balanceTmp', 'balance');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Accounts', 'balanceDec', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.sequelize.query(
      'UPDATE "Accounts" SET "balanceDec" = "balance"/100.0;'
    );
    await queryInterface.removeColumn('Accounts', 'balance');
    await queryInterface.renameColumn('Accounts', 'balanceDec', 'balance');
    await queryInterface.removeColumn('Accounts', 'closedAt');
  },
};
