'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // 🔗 FK to Users.id
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {           // <—
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',    // if user is deleted, delete accounts
        onUpdate: 'CASCADE'
      },

      accountNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true            // <—
      },

      accountType: {
        type: Sequelize.STRING
      },

      balance: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0         // <—
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Accounts');
  }
};
