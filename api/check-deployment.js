// api/check-deployment.js
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = process.env.OPENCLAW_CLUSTER_ID;
const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

const PROJECT_GET = `
  query project($id: String!) {
    project(id: $id) {
      services {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  }
`;

module.exports = async (req, res) => {
  const { workspace } = req.query;

  if (!workspace) {
    return res.status(400).json({ status: 'error', message: 'Missing workspace name' });
  }

  try {
    const response = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RAILWAY_TOKEN}`,
      },
      body: JSON.stringify({ query: PROJECT_GET, variables: { id: PROJECT_ID } }),
    });

    const json = await response.json();
    if (json.errors) throw new Error(json.errors[0].message);

    const services = json.data.project.services.edges.map(e => e.node);
    const service = services.find(s => s.name.toLowerCase() === workspace.toLowerCase());

    if (service) {
      return res.status(200).json({ 
        status: 'ready', 
        serviceId: service.id,
        url: `${workspace}.openclawcloud.ca`,
        message: 'Deployment detected and live.'
      });
    } else {
      return res.status(200).json({ 
        status: 'provisioning', 
        message: 'Looking for cluster resources...' 
      });
    }

  } catch (error) {
    console.error(`[STATUS] Error: ${error.message}`);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
