import { CosmosClient, Database, Container } from '@azure/cosmos';

const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DATABASE || 'DolphinCoveDB';

if (!connectionString) {
  throw new Error('COSMOS_CONNECTION_STRING environment variable is required');
}

const client = new CosmosClient(connectionString);
const database: Database = client.database(databaseName);

// Export container references
export const containers = {
  users: database.container('Users'),
  posts: database.container('Posts'),
  messages: database.container('Messages'),
  freelanceJobs: database.container('FreelanceJobs'),
  tasks: database.container('Tasks'),
};

export { database, client };

// Initialize containers (call during startup if needed)
export async function initializeContainers(): Promise<void> {
  const containerConfigs = [
    { id: 'Users', partitionKey: '/id' },
    { id: 'Posts', partitionKey: '/authorId' },
    { id: 'Messages', partitionKey: '/conversationId' },
    { id: 'FreelanceJobs', partitionKey: '/clientId' },
    { id: 'Tasks', partitionKey: '/participantId' },
  ];

  for (const config of containerConfigs) {
    try {
      await database.containers.createIfNotExists({
        id: config.id,
        partitionKey: { paths: [config.partitionKey] },
      });
      console.log(`Container ${config.id} is ready`);
    } catch (error) {
      console.error(`Error creating container ${config.id}:`, error);
    }
  }
}
