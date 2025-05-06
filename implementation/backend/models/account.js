// models/account.js
'use strict';
const { Model } = require('sequelize');

/**
 * All monetary values are stored as **integer cents** to avoid floating-point errors.
 * UI/route layers should convert user-entered dollar strings → cents
 * before calling these helpers.
 */
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      Account.hasMany(models.Transaction, { foreignKey: 'accountId' });
    }

    // Ensure account isn't closed
    _assertOpen() {
      if (this.closedAt) throw new Error('closed');
    }

    /**
     * Deposit positive integer cents with optional description
     */
    async deposit(cents, opts = {}) {
      this._assertOpen();
      const { Transaction } = sequelize.models;
      const txOpts = opts.transaction ? { transaction: opts.transaction } : {};

      await Transaction.create(
        {
          accountId: this.id,
          type: 'DEPOSIT',
          amount: cents,
          description: opts.description ?? null
        },
        txOpts
      );

      await this.increment({ balance: cents }, txOpts);
    }

    /**
     * Withdraw positive integer cents with optional description
     */
    async withdraw(cents, opts = {}) {
      this._assertOpen();
      if (Number(this.balance) < cents) throw new Error('insufficient');
      const { Transaction } = sequelize.models;
      const txOpts = opts.transaction ? { transaction: opts.transaction } : {};

      await Transaction.create(
        {
          accountId: this.id,
          type: 'WITHDRAW',
          amount: -cents,
          description: opts.description ?? null
        },
        txOpts
      );

      await this.decrement({ balance: cents }, txOpts);
    }

    /**
     * Atomic transfer between two Account instances (both open).
     */
    async transferTo(destAccount, cents, memo = null) {
      this._assertOpen();
      if (destAccount.closedAt) throw new Error('dest_closed');
      if (this.id === destAccount.id) throw new Error('same_account');
      if (Number(this.balance) < cents) throw new Error('insufficient');

      const { Transaction } = sequelize.models;

      return sequelize.transaction(async (t) => {
        const opts = { transaction: t };

        // Source side (negative)
        await Transaction.create(
          {
            accountId: this.id,
            targetAccountId: destAccount.id,
            type: 'TRANSFER_OUT',
            amount: -cents,
            description: memo,
          },
          opts
        );
        await this.decrement({ balance: cents }, opts);

        // Destination side (positive)
        await Transaction.create(
          {
            accountId: destAccount.id,
            targetAccountId: this.id,
            type: 'TRANSFER_IN',
            amount: cents,
            description: memo,
          },
          opts
        );
        await destAccount.increment({ balance: cents }, opts);
      });
    }
  }

  Account.init(
    {
      userId: DataTypes.INTEGER,
      accountNumber: DataTypes.STRING,
      accountType: DataTypes.STRING,
      balance: DataTypes.INTEGER, // integer cents
      closedAt: DataTypes.DATE,    // null ⇒ open
      nickname: DataTypes.STRING,
    },
    { sequelize, modelName: 'Account' }
  );

  return Account;
};
