/**
 * Tests for RedLobster AI Assistant
 */

const { AIAssistant } = require('./index.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

function runTests() {
  console.log('Running tests...\n');
  
  // Test 1: Create assistant
  console.log('Test 1: Create AI Assistant');
  const assistant = new AIAssistant('TestBot');
  assert(assistant.name === 'TestBot', 'Assistant name should be TestBot');
  console.log('✓ Pass\n');
  
  // Test 2: Learn functionality
  console.log('Test 2: Learn functionality');
  const learnResult = assistant.learn('Node.js', "A JavaScript runtime built on Chrome's V8 engine");
  assert(learnResult.includes('Node.js'), 'Learn should return confirmation message');
  console.log('✓ Pass\n');
  
  // Test 3: Recall functionality
  console.log('Test 3: Recall functionality');
  const recallResult = assistant.recall('Node.js');
  assert(recallResult.includes('JavaScript runtime'), 'Recall should return learned information');
  console.log('✓ Pass\n');
  
  // Test 4: Recall unknown topic
  console.log('Test 4: Recall unknown topic');
  const unknownResult = assistant.recall('Unknown Topic');
  assert(unknownResult.includes('don\'t have information'), 'Should handle unknown topics');
  console.log('✓ Pass\n');
  
  // Test 5: Process greeting
  console.log('Test 5: Process greeting');
  const greetingResponse = assistant.process('Hello');
  assert(greetingResponse.includes('Hello'), 'Should respond to greetings');
  console.log('✓ Pass\n');
  
  // Test 6: Process help request
  console.log('Test 6: Process help request');
  const helpResponse = assistant.process('help');
  assert(helpResponse.includes('Commands'), 'Should provide help information');
  console.log('✓ Pass\n');
  
  // Test 7: Conversation history
  console.log('Test 7: Conversation history');
  const history = assistant.getHistory();
  assert(history.length > 0, 'Should store conversation history');
  assert(history[0].type === 'user', 'Should record user messages');
  console.log('✓ Pass\n');
  
  // Test 8: Clear history
  console.log('Test 8: Clear history');
  assistant.clear();
  assert(assistant.getHistory().length === 0, 'Should clear conversation history');
  console.log('✓ Pass\n');
  
  // Test 9: Case insensitive learning
  console.log('Test 9: Case insensitive learning and recall');
  assistant.learn('Python', 'A high-level programming language');
  const pythonRecall = assistant.recall('python');
  assert(pythonRecall.includes('high-level'), 'Should be case insensitive');
  console.log('✓ Pass\n');
  
  console.log('=== All tests passed! ===');
}

// Run the tests
try {
  runTests();
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
