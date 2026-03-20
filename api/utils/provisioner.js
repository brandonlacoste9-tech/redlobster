// api/utils/provisioner.js
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = process.env.OPENCLAW_CLUSTER_ID;
const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

const SERVICE_CREATE = `
  mutation serviceCreate($input: ServiceCreateInput!) {
    serviceCreate(input: $input) {
      id
      name
    }
  }
`;

const VARIABLE_UPSERT = `
  mutation variableCollectionUpsert($input: VariableCollectionUpsertInput!) {
    variableCollectionUpsert(input: $input)
  }
`;

async function queryRailway(query, variables = {}) {
  const response = await fetch(RAILWAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Railway API Error: ${text}`);
  }
  
  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

async function deployToRailway({ workspace, email, useCase, channels, plan }) {
  console.log(`[PROVISIONER] Starting Railway deployment for ${workspace} (${email})...`);

  // 1. Create the Service
  const serviceData = await queryRailway(SERVICE_CREATE, {
    input: {
      projectId: PROJECT_ID,
      name: workspace,
      source: {
        repo: "qwibitai/nanoclaw"
      }
    }
  });

  const serviceId = serviceData.serviceCreate.id;

  // 2. Add Environment Variables
  await queryRailway(VARIABLE_UPSERT, {
    input: {
      projectId: PROJECT_ID,
      environmentId: process.env.RAILWAY_ENVIRONMENT_ID,
      serviceId: serviceId,
      variables: {
        OPENCLAW_WORKSPACE: workspace,
        OPENCLAW_USER_EMAIL: email,
        OPENCLAW_USE_CASE: useCase || 'default',
        OPENCLAW_CHANNELS: (channels || []).join(','),
        OPENCLAW_PLAN: plan,
        PORT: "3000"
      }
    }
  });

  return {
    serviceId,
    url: `${workspace}.openclawcloud.ca`,
    apiKey: `oc_live_${Math.random().toString(36).substr(2, 24)}`
  };
}

module.exports = { deployToRailway };
