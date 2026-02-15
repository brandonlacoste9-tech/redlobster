#!/usr/bin/env node

/**
 * RedLobster - AI Assistant Tool
 * A simple AI-powered helper application
 */

class AIAssistant {
  constructor(name = 'RedLobster') {
    this.name = name;
    this.knowledge = new Map();
    this.conversationHistory = [];
  }

  /**
   * Learn new information
   * @param {string} topic - The topic to learn
   * @param {string} information - The information to store
   */
  learn(topic, information) {
    this.knowledge.set(topic.toLowerCase(), information);
    return `Learned about ${topic}`;
  }

  /**
   * Recall information about a topic
   * @param {string} topic - The topic to recall
   * @returns {string} - The information or a default message
   */
  recall(topic) {
    const info = this.knowledge.get(topic.toLowerCase());
    return info || `I don't have information about ${topic} yet.`;
  }

  /**
   * Process a user query
   * @param {string} query - The user's query
   * @returns {string} - The response
   */
  process(query) {
    this.conversationHistory.push({ type: 'user', message: query });
    
    let response;
    
    // Simple pattern matching for AI-like responses
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      response = `Hello! I'm ${this.name}, your AI assistant. How can I help you today?`;
    } else if (query.toLowerCase().includes('help')) {
      response = this.getHelp();
    } else if (query.toLowerCase().includes('who are you')) {
      response = `I'm ${this.name}, an AI assistant designed to help you with information and tasks.`;
    } else if (query.toLowerCase().includes('what can you do')) {
      response = 'I can learn new information, recall what I\'ve learned, and engage in simple conversations. Ask me anything!';
    } else {
      // Try to recall information from learned topics
      const topics = Array.from(this.knowledge.keys());
      const matchedTopic = topics.find(topic => 
        query.toLowerCase().includes(topic)
      );
      
      if (matchedTopic) {
        response = this.recall(matchedTopic);
      } else {
        response = 'I\'m processing your query. I can learn new things if you teach me using the learn() method!';
      }
    }
    
    this.conversationHistory.push({ type: 'assistant', message: response });
    return response;
  }

  /**
   * Get help information
   * @returns {string} - Help text
   */
  getHelp() {
    return `
${this.name} AI Assistant - Available Commands:
- learn(topic, information): Teach me something new
- recall(topic): Ask me to recall information
- process(query): Have a conversation with me
- getHistory(): View conversation history
- clear(): Clear conversation history
    `.trim();
  }

  /**
   * Get conversation history
   * @returns {Array} - The conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clear() {
    this.conversationHistory = [];
    return 'Conversation history cleared.';
  }
}

// CLI Interface
if (require.main === module) {
  const assistant = new AIAssistant();
  
  console.log('=== RedLobster AI Assistant ===');
  console.log('Starting interactive mode...\n');
  
  // Demonstrate capabilities
  console.log('Example usage:');
  console.log('> ' + assistant.process('Hello!'));
  console.log();
  console.log('> ' + assistant.process('What can you do?'));
  console.log();
  
  // Teach the assistant
  console.log('Teaching the assistant...');
  console.log('> ' + assistant.learn('JavaScript', 'A popular programming language for web development'));
  console.log('> ' + assistant.learn('AI', 'Artificial Intelligence - the simulation of human intelligence by machines'));
  console.log();
  
  // Query learned information
  console.log('> ' + assistant.process('Tell me about JavaScript'));
  console.log();
  console.log('> ' + assistant.recall('AI'));
  console.log();
  
  console.log('\nFor interactive usage, you can import this module and use:');
  console.log('const { AIAssistant } = require("./index.js");');
  console.log('const assistant = new AIAssistant();');
}

module.exports = { AIAssistant };
