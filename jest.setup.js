const { sequelize } = require('./src/models/user'); // Adjust the path if needed

beforeAll(async () => {
    // Sync the database before tests start (force will drop tables and recreate them)
    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    // Truncate all tables to ensure no data from previous tests
    for (const modelName of Object.keys(sequelize.models)) {
        try {
            await sequelize.models[modelName].destroy({
                where: {},
                truncate: true,
                restartIdentity: true, // Reset auto-increment values
            });
        } catch (error) {
            console.error(`Error truncating table for model ${modelName}:`, error);
        }
    }
});

afterAll(async () => {
    // Close the database connection after all tests
    await sequelize.close();
});
