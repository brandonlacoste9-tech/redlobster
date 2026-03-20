// api/provision.js
const { deployToRailway } = require('./utils/provisioner');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { workspace, email, useCase, channels, plan } = req.body;

  if (!workspace || !email || !plan) {
    return res.status(400).json({ status: 'error', message: 'Missing required configuration' });
  }

  console.log(`[PROVISION] Manual request received: ${workspace} (${email})...`);

  try {
    const result = await deployToRailway({ workspace, email, useCase, channels, plan });

    return res.status(200).json({
      status: 'success',
      workspace: result.workspace,
      url: result.url,
      apiKey: result.apiKey,
      message: 'Workspace provisioned successfully on Railway cluster.'
    });

  } catch (error) {
    console.error(`[PROVISION] Error: ${error.message}`);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
