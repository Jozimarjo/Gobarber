module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'users', // tabela q sera add a coluna
            'avatar_id',
            {
                type: Sequelize.INTEGER,
                references: { model: 'files', key: 'id' },
                onUpdates: 'CASCADE',
                onDelete: 'SET NULL',
                allowNull: true,
            } // qual nome da coluna
        );
    },

    down: queryInterface => {
        return queryInterface.removeColumn('users', 'avatar_id');
    },
};
