'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add new columns to device_state
    await queryInterface.addColumn('device_state', 'heading', {
      type: Sequelize.FLOAT,
      allowNull: true
    }).catch(() => {/* column may already exist */});

    await queryInterface.addColumn('device_state', 'ignition', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      comment: 'ACC/ignition state from heartbeat terminalInfo bit 1'
    }).catch(() => {});

    await queryInterface.addColumn('device_state', 'relay_status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      comment: 'Relay/immobilizer state from heartbeat terminalInfo bit 0 (armed)'
    }).catch(() => {});

    await queryInterface.addColumn('device_state', 'heartbeat', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Latest decoded heartbeat packet'
    }).catch(() => {});

    // 2. Create device_commands table
    await queryInterface.createTable('device_commands', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      device_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: { model: 'devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_string_id: {
        allowNull: false,
        type: Sequelize.STRING,
        comment: 'IMEI / device string ID'
      },
      command: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('pending', 'sent', 'acknowledged', 'failed'),
        defaultValue: 'pending'
      },
      server_flag: {
        allowNull: true,
        type: Sequelize.STRING(8)
      },
      serial: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      response: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      sent_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      acked_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      error: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('device_commands', ['device_id']);
    await queryInterface.addIndex('device_commands', ['device_string_id']);
    await queryInterface.addIndex('device_commands', ['server_flag']);
    await queryInterface.addIndex('device_commands', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_commands');
    await queryInterface.removeColumn('device_state', 'heartbeat').catch(() => {});
    await queryInterface.removeColumn('device_state', 'relay_status').catch(() => {});
    await queryInterface.removeColumn('device_state', 'ignition').catch(() => {});
    await queryInterface.removeColumn('device_state', 'heading').catch(() => {});
  }
};
