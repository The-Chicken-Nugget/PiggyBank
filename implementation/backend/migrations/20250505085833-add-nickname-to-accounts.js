'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(q, S) {
    return q.addColumn('Accounts', 'nickname', { type: S.STRING, allowNull: true });
  },
  down(q) {
    return q.removeColumn('Accounts', 'nickname');
  },
};

