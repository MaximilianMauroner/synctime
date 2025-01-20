# SyncTime

A time tracking application that helps you monitor your application usage patterns and time spent on different apps.

## Features

- Track active application windows and usage duration
- Generate daily and weekly usage reports
- Categorize applications for better insights
- Export usage statistics
- System tray integration for background monitoring
- Dark/Light mode support

## How it Works

SyncTime runs in the background and monitors:
- Active window titles
- Application focus time
- Application switching patterns
- Total usage duration per application

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/synctime.git
cd synctime
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Building

To create a production build:
```bash
npm run build
```

## Privacy Notice

SyncTime only tracks application names and window titles locally on your machine. No data is sent to external servers, and you have full control over your usage data.

## License

MIT License
