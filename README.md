# 🗨 SMServer — Intelligent SMS Communication Server

A Node.js-based server that enables sending and receiving SMS messages through a Huawei LTE modem, with AI-powered message handling and additional smart features.

## 🎯 Overview

**SMServer** is a self-hosted solution for managing SMS communications at home. It integrates with a Huawei LTE modem to enable bidirectional SMS messaging, while providing intelligent message processing powered by AI and third-party APIs.

### Hardware

The project was tested on a Huawei E3531 USB dongle.
It will probably work with other models of modems, maybe after a bit of additional configuration.

### Key Features

- **📱 SMS Management**: Automatically poll and process incoming SMS messages from a Huawei LTE modem
- **🤖 AI-Powered Responses**: Leverage OpenAI API (via OpenRouter) for intelligent, context-aware message replies
- **🌤️ Weather Information**: Query real-time weather forecasts via OpenWeatherMap API
- **🔗 URL Shortening**: Compress long URLs before sending them via SMS
- **🔐 Security Controls**: Built-in whitelist and admin authentication for message handling
- **📊 Logging**: Comprehensive server activity logging
- **🐳 Docker Support**: Easy deployment via Docker and Docker Compose

## 🏗️ Architecture

### Core Components

| File                                                 | Purpose                                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| [server.ts](src/server.ts)                           | Main server entry point; connects to modem and polls for SMS messages |
| [HandleMessage.ts](src/HandleMessage.ts)             | Processes incoming messages and routes them to appropriate handlers   |
| [LlmHandler.ts](src/LlmHandler.ts)                   | Integrates with OpenAI API for AI-powered message responses           |
| [WeatherHandler.ts](src/WeatherHandler.ts)           | Fetches weather data from OpenWeatherMap API                          |
| [UrlShortenerHandler.ts](src/UrlShortenerHandler.ts) | Shortens URLs                                                         |
| [SendMessage.ts](src/SendMessage.ts)                 | Sends SMS responses back through the modem                            |
| [Logging.ts](src/Logging.ts)                         | Centralized logging functionality                                     |
| [Types.ts](src/Types.ts)                             | TypeScript type definitions                                           |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Docker**
- A **Huawei LTE modem** with web interface access
- API Keys (optional, depending on features used):
  - OpenRouter API key for AI responses
  - OpenWeatherMap API key for weather data

### Installation

#### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/TheBoloss/SMServer.git
   cd SMServer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure your environment**

   ```bash
   # Copy the sample config
   cp config.sample.yml config.yml

   # Copy the sample .env file
   cp .env.sample .env
   ```

4. **Update config.yml**

   ```yaml
   config:
     enable_whitelist: true
     whitelist:
       - "+1234567890"
       - "+0987654321"
     admin_list:
       - "+1234567890"
   ```

5. **Build and run**
   ```bash
   npm run build
   npm start
   ```

#### Docker Deployment

```bash
docker-compose up -d
```

Or build and run manually:

```bash
docker build -t smserver .
docker run -d \
  --name smserver \
  -e CONNECTION_URL=http://modem-ip:8000 \
  -e OPENROUTER_API_KEY=your_key \
  -e OPENWEATHERMAP_API_KEY=your_key \
  -v /path/to/config.yml:/app/config.yml \
  smserver
```

### PM2 Process Management

For production environments using PM2:

```bash
npm run pm2:start      # Start the server with PM2
npm run pm2:stop       # Stop the server
npm run pm2:restart    # Restart the server
npm run pm2:logs       # View logs
npm run pm2:monitor    # Monitor in real-time
```

## ⚙️ Configuration

### Environment Variables

```env
CONNECTION_URL              # Huawei modem web interface URL (required)
OPENROUTER_API_KEY         # API key for OpenRouter (optional)
OPENWEATHERMAP_API_KEY     # API key for weather data (optional)
```

### config.yml Structure

```yaml
config:
  enable_whitelist: boolean # Enable/disable message whitelist
  whitelist: # List of allowed phone numbers
    - "+1234567890"
  admin_list: # Phone numbers with admin privileges
    - "+0987654321"
```

## 📝 Usage Examples

### Incoming Message Flow

1. Server polls the modem every second for new SMS messages
2. Messages from whitelisted numbers are processed (if the whitelist is enabled)
3. Message content is analyzed and routed to appropriate handlers:
   - **"ping"** → Tests the server's availability to receive and send SMS
   - **"weather [city]"** → Fetches weather forecast
   - **"ask [question]"** → Gets AI-powered response
   - **"[website link]"** → Shortens the URL
   - **"forward [phone] [message]"** → Send the specified message to another number via the server (SMS proxy) - **Admin only**
4. Response is sent back via SMS

### Admin Commands

Messages from numbers in `admin_list` have access to extended functionality and can trigger special operations: forward command.

## 🛠️ Development

### Build

```bash
npm run build
```

### Available Scripts

- `npm start` - Build and start the server
- `npm run build` - Compile TypeScript to JavaScript
- `npm run pm2:start` - Start with PM2
- `npm run pm2:stop` - Stop PM2 process
- `npm run pm2:restart` - Restart with PM2
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:monitor` - Monitor with PM2

## 📦 Dependencies

- **huawei-lte-api** - Modem communication
- **openai** - AI integration (via OpenRouter)
- **cheerio** - HTML parsing
- **dotenv** - Environment configuration
- **yaml** - Config file parsing
- **pm2** - Process management
- **typescript** - Type safety

## 📄 Project Structure

```
SMServer/
├── src/
│   ├── server.ts              # Main entry point
│   ├── HandleMessage.ts       # Message routing & processing
│   ├── LlmHandler.ts          # AI responses
│   ├── WeatherHandler.ts      # Weather API integration
│   ├── UrlShortenerHandler.ts # URL shortening
│   ├── SendMessage.ts         # SMS sending
│   ├── Logging.ts             # Logging utilities
│   └── Types.ts               # TypeScript definitions
├── config.yml                 # Configuration file
├── .env                       # Environment variables
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
├── ecosystem.config.cjs       # PM2 configuration
└── package.json               # Project dependencies
```

## 🔒 Security Considerations

- **Whitelist Protection**: Restrict message processing to known phone numbers
- **Admin List**: Designate specific numbers for administrative operations
- **API Keys**: Store sensitive keys in `.env` file, never commit to repository
- **Environment Isolation**: Use separate configurations for development and production

## 🐛 Troubleshooting

### Connection Issues

- Verify modem is accessible at `CONNECTION_URL`
- Ensure modem web interface is enabled

### Missing API Responses

- Verify API keys are correctly set in `.env`
- Check API rate limits and quotas
- Review server logs for error messages

### SMS Not Being Received

- Confirm whitelist settings if enabled
- Check phone number format consistency
- Review server logs for error messages

## 📜 License

MIT License. [View license file](LICENSE.md)

## 👤 Author

Created by TheBoloss
