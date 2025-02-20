'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { get, set, entries } from 'idb-keyval';
import {Avatar, Box, Button, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import dynamic from 'next/dynamic';
import useDataProcessor from "@/app/hooks/useDataProcessor";

let dataBuffer: any[] = [];
const SAVE_INTERVAL = 30000;
const PROCESSOR_START_DELAY = 20000;

const P5Visualization = dynamic(() => import('./P5Visualization'), { ssr: false });
const BouncingBallsVisualization = dynamic(() => import('./BouncingBallsVisualization'), { ssr: false });

export default function WebSocketPage() {
	const dataProcessor = useDataProcessor({
		autoStart: false,
	});
	const [socket, setSocket] = useState<Socket | null>(null);
	const [data, setData] = useState<any>(null);
	const [list, setList] = useState<any>([]);
	const [isConnected, setIsConnected] = useState(false);
	const updateTimesRef = useRef<number[]>([]);
	const [frequency, setFrequency] = useState(0);

	useEffect(() => {
		const socketInstance = io('https://data-simulation.kkhomelab.site');

		socketInstance.on('connect', () => {
			console.log('Connected to WebSocket server');
			setIsConnected(true);
		});

		socketInstance.on('disconnect', () => {
			console.log('Disconnected from WebSocket server');
			setIsConnected(false);
		});

		socketInstance.on('data', (receivedData) => {
			const parsed = JSON.parse(receivedData);
			if (!parsed) {
				setFrequency(0);
			}
			const now = new Date();
			const nowMs = now.getTime();
			updateTimesRef.current.push(nowMs);
			// 保留最近 5 秒的時間戳
			updateTimesRef.current = updateTimesRef.current.filter(t => nowMs - t < 5000);
			const freq = updateTimesRef.current.length / 5;
			setFrequency(freq);
			setData(parsed);
			dataBuffer.push(parsed);
		});

		setSocket(socketInstance);

		return () => {
			socketInstance.disconnect();
		};
	}, []);

	useEffect(() => {
		const intervalId = setInterval(async () => {
			if (dataBuffer.length > 0) {
				const now = new Date();
				const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${Math.floor(now.getSeconds() / 30) * 30}`;
				const existing = await get(key);
				const newData = existing ? existing.concat(dataBuffer) : dataBuffer;
				await set(key, newData);
				console.log(`Saved ${dataBuffer.length} items to key: ${key}`);
				dataBuffer = [];
				dataProcessor.refreshStatus();
			}
			const listData = await entries();
			setList(listData);
			console.log(listData);
		}, SAVE_INTERVAL);

		return () => clearInterval(intervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// 開始模擬
	const handleStartSimulation = () => {
		if (socket) {
			socket.emit('simulation:start');
			console.log('Started simulation');
			setTimeout(() => {
				console.log(`Starting data processor after ${PROCESSOR_START_DELAY/1000} seconds delay`);
				dataProcessor.startProcessing();
			}, PROCESSOR_START_DELAY);
		}
	};

	return (
		<Box display="flex" alignItems="center" justifyItems="center" gap={3}>
			<Box display="flex" flexDirection="row" gap={5}>
				<Box
					sx={{
						p: 3,
						color: 'text.primary',
						borderRadius: 2,
						minHeight: 200,
					}}
				>
					<Typography variant="h5" gutterBottom>
						WebSocket Connection Status: {isConnected ? 'Connected' : 'Disconnect'}
					</Typography>

					<Button
						variant="contained"
						onClick={handleStartSimulation}
						disabled={!isConnected}
						sx={{ mt: 2 }}
					>
						Start Simulation
					</Button>

					{data && (
						<Box mt={3} display="flex" gap={2}>
							<Paper
								variant="outlined"
								elevation={2}
								sx={{
									flex: 1,
									p: 2,
									background: '#f5f5f5',
									overflow: 'auto',
									borderRadius: 2,
								}}
							>
								<Typography variant="h6" gutterBottom>
									Data Sample
								</Typography>
								<pre
									style={{
										margin: 0,
										whiteSpace: 'pre-wrap',
									}}
								>
                  {Object.entries(data).map(([key, val]) => `${key}: ${val}`).join('\n')}
                </pre>
							</Paper>
						</Box>
					)}
				</Box>
				<Box display="flex" flexDirection="column" sx={{ mt: 2 }}>
					<P5Visualization frequency={frequency} />
					<BouncingBallsVisualization frequency={frequency} />
				</Box>
				<Box>
					<Box>
						<List sx={{ color: 'black'}}>
							{list.map(([key, val]: any) => (
								<ListItem key={key}>
									<ListItemAvatar>
										<Avatar>
											<FolderIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary={key}
										secondary={`Total ${val.length} items`}
									/>
								</ListItem>
							))}
						</List>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
