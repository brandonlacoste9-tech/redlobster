# RedLobster 🦞

An AI-powered assistant tool built with Node.js. RedLobster is a simple yet powerful AI assistant that can learn information, recall it, and engage in conversations.

## Features

- 🧠 **Learning Capability**: Teach the assistant new information
- 💭 **Memory Recall**: Query the assistant about learned topics
- 💬 **Conversational Interface**: Engage in natural conversations
- 📝 **History Tracking**: Keep track of conversation history
- 🎯 **Simple API**: Easy-to-use programmatic interface

## Installation

Clone the repository and navigate to the directory:

```bash
git clone https://github.com/brandonlacoste9-tech/redlobster.git
cd redlobster
```

## Usage

### Command Line

Run the assistant in demo mode:

```bash
node index.js
```

### Programmatic Usage

```javascript
const { AIAssistant } = require('./index.js');

// Create a new assistant
const assistant = new AIAssistant('MyBot');

// Teach it something
assistant.learn('JavaScript', 'A popular programming language');

// Ask it to recall
console.log(assistant.recall('JavaScript'));
// Output: A popular programming language

// Have a conversation
console.log(assistant.process('Hello!'));
// Output: Hello! I'm MyBot, your AI assistant. How can I help you today?

// Get help
console.log(assistant.process('help'));

// View conversation history
console.log(assistant.getHistory());

// Clear history
assistant.clear();
```

## API Reference

### `AIAssistant`

The main AI assistant class.

#### Constructor

```javascript
new AIAssistant(name)
```

- `name` (string, optional): The name of the assistant. Default: 'RedLobster'

#### Methods

- **`learn(topic, information)`**: Teach the assistant new information
  - `topic` (string): The topic to learn
  - `information` (string): The information to store
  - Returns: Confirmation message

- **`recall(topic)`**: Retrieve learned information
  - `topic` (string): The topic to recall
  - Returns: The stored information or a default message

- **`process(query)`**: Process a conversational query
  - `query` (string): The user's query
  - Returns: The assistant's response

- **`getHistory()`**: Get the conversation history
  - Returns: Array of conversation messages

- **`clear()`**: Clear the conversation history
  - Returns: Confirmation message

- **`getHelp()`**: Get help information
  - Returns: Help text with available commands

## Testing

Run the test suite:

```bash
npm test
```

## Requirements

- Node.js >= 14.0.0

## License

MIT

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
