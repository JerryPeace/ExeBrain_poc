# EEG Neurofeedback Application POC

## Project Overview

This proof of concept (POC) demonstrates a brain-wave visualization application designed for EEG neurofeedback training. The application receives real-time EEG data through WebSockets, processes frequency bands, displays visual feedback using P5.js, and implements an efficient data pipeline with IndexedDB storage and Web Worker background processing.

## Key Features

### 1. Real-time Brain Wave Visualization

The application maps EEG frequency bands to different mental states:
- **Delta (0.5-4 Hz)**: Deep sleep state
- **Theta (4-8 Hz)**: Drowsiness, meditation, memory
- **Alpha (8-13 Hz)**: Relaxation and cognitive readiness
- **Beta (13-30 Hz)**: Active thinking and focus
- **Gamma (30+ Hz)**: Higher cognitive functions

### 2. Dual Visual Feedback Mechanisms

- **Facial Expression Visualization**: Changes facial expressions based on frequency range
- **Bouncing Ball Physics**: Dynamic particle simulation where the number and speed of particles change based on the detected brain state

### 3. Optimized Data Pipeline

- **Real-time WebSocket Connection**: Connects to a simulation server to receive continuous EEG data
- **Data Buffering**: Temporarily stores incoming data in memory
- **Periodic Data Persistence**: Saves buffered data to IndexedDB at regular intervals
- **Background Processing**: Uses Web Workers to process and upload data asynchronously
- **Batch Processing**: Groups data by time intervals to reduce API load

## Technical Architecture

### Frontend Components
- **Next.js** for the React application framework
- **P5.js** for creative visual feedback
- **Material UI** for the user interface components

### Data Processing Pipeline
- **Socket.io** for real-time data streaming
- **IndexedDB** (via idb-keyval) for client-side storage
- **Web Workers** for background processing

### Performance Optimizations
- Frequency calculation from update timestamps
- Time-sliced data storage (30-second intervals)
- Delayed worker initialization to prioritize UI responsiveness
- Configurable artificial processing delay for simulated network conditions

## How It Works

1. **Data Reception**: The application connects to the WebSocket server and begins receiving brain wave data
2. **Frequency Calculation**: The application calculates the current frequency (updates per second) based on recent updates
3. **State Determination**: The frequency is mapped to a brain state (Delta, Theta, Alpha, Beta, or Gamma)
4. **Visual Feedback**: Two different P5.js visualizations update in real-time based on the detected state
5. **Data Buffering**: Incoming data is stored in a temporary buffer
6. **Periodic Storage**: Every 30 seconds, the buffer is saved to IndexedDB with a timestamped key
7. **Background Processing**: A Web Worker processes stored data in batches
8. **API Upload**: Processed data is formatted and uploaded to the server via API endpoints

## Visualization Details

### Facial Expression Visualization
- **Delta (< 2 Hz)**: Sleeping face with closed eyes (horizontal lines)
- **Theta (2-10 Hz)**: Half-closed eyes with slight smile
- **Alpha (10-25 Hz)**: Normal, relaxed expression
- **Beta (25-40 Hz)**: Alert face with wider eyes
- **Gamma (> 40 Hz)**: Highly alert face with wide eyes and smile

### Bouncing Balls Visualization
- **Delta**: 2 balls moving slowly
- **Theta**: 10 balls with moderate movement
- **Alpha**: 15 balls with normal speed
- **Beta**: 30 balls with increased speed
- **Gamma**: 50 balls with rapid movement

## Data Processing Details

### Data Buffer Management
- Data points are collected in memory
- Every 30 seconds (configurable), data is saved to IndexedDB
- Keys are formatted as `YYYY-MM-DD-HH-MM-SS` for easy sorting

### Web Worker Background Processing
- Starts after a configurable delay to prioritize UI initialization
- Processes oldest data batches first
- Includes artificial processing delay to simulate network conditions
- Provides status updates to the main thread


## Getting Started

```bash
docker compase up -d
```
And then, head to http://localhost:3000/socket-sample

