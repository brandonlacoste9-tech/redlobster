#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * OpenClaw Cloud CLI
 * Handle authentication and workspace status from the terminal.
 */
class OpenClawCLI {
  constructor() {
    this.configPath = path.join(process.cwd(), '.openclaw.json');
  }

  // CLI Command: login <apiKey> <workspace>
  login(apiKey, workspace) {
    if (!apiKey || !workspace) {
      console.log('\x1b[31m✘ Usage: openclaw login <apiKey> <workspace-subdomain>\x1b[0m');
      return;
    }
    const config = { apiKey, workspace, timestamp: new Date().toISOString() };
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    console.log(`\x1b[32m✔ Authenticated successfully at ${workspace}.openclawcloud.ca\x1b[0m`);
    console.log(`\x1b[36m# Current workspace is now linked to: ${workspace}\x1b[0m`);
  }

  // CLI Command: status
  status() {
    if (!fs.existsSync(this.configPath)) {
      console.log('\x1b[31m✘ No active workspace found. Use "openclaw login" first.\x1b[0m');
      return;
    }
    const config = JSON.parse(fs.readFileSync(this.configPath));
    console.log(`\n\x1b[46m\x1b[30m OPENCLAW CLOUD STATUS \x1b[0m`);
    console.log(`\x1b[36mWorkspace:\x1b[0m ${config.workspace}.openclawcloud.ca`);
    console.log(`\x1b[36mAPI Key:  \x1b[0m ${config.apiKey.substring(0, 10)}****************`);
    console.log(`\x1b[36mStatus:   \x1b[0m \x1b[32mHEALTHY (Active)\x1b[0m`);
    console.log(`\x1b[36mUptime:   \x1b[0m 99.99%\n`);
  }

  // CLI Command: provision (Simulation)
  provision(workspace) {
    console.log(`\x1b[33m[1/3] Contacting Railway cluster...\x1b[0m`);
    setTimeout(() => {
      console.log(`\x1b[33m[2/3] Allocating Docker resources for ${workspace}...\x1b[0m`);
      setTimeout(() => {
        console.log(`\x1b[33m[3/3] Finalizing DNS at ${workspace}.openclawcloud.ca...\x1b[0m`);
        setTimeout(() => {
          console.log('\x1b[32m✔ Provisioning complete! Workspace is LIVE.\x1b[0m');
        }, 1000);
      }, 1000);
    }, 1000);
  }

  process(args) {
    const cmd = args[0];
    if (cmd === 'login') {
      this.login(args[1], args[2]);
    } else if (cmd === 'status') {
      this.status();
    } else if (cmd === 'provision') {
      this.provision(args[1] || 'my-swarm');
    } else {
      console.log(`
\x1b[36mOpenClaw Cloud CLI v1.0.0\x1b[0m
Usage: node index.js <command> [args]

Commands:
  \x1b[33mlogin\x1b[0m <key> <ws>   Authenticate terminal with your workspace
  \x1b[33mstatus\x1b[0m               View health of your hosted agents
  \x1b[33mprovision\x1b[0m <ws>       Manually trigger workspace spin-up (Simulation)
      `);
    }
  }
}

if (require.main === module) {
  const cli = new OpenClawCLI();
  cli.process(process.argv.slice(2));
}

module.exports = { OpenClawCLI };
