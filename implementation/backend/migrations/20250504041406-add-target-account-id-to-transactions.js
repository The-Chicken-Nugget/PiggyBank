'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Transactions', 'targetAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {          // keep referential integrity for internal transfers
        model: 'Accounts',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Transactions', 'targetAccountId');
  },
};
