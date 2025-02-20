import { useRef, useState, useEffect, useCallback } from 'react';

interface ProcessorStatus {
	processedKeys: number;
	totalKeys: number;
	processedItems: number;
	inProgress: boolean;
	lastProcessedTimestamp: number | null;
	lastResponse: any;
}

interface ProcessorOptions {
	batchSize?: number;
	autoStart?: boolean;
}

export function useDataProcessor(options: ProcessorOptions = {}) {
	const workerRef = useRef<Worker | null>(null)
	const [status, setStatus] = useState<ProcessorStatus>({
		processedKeys: 0,
		totalKeys: 0,
		processedItems: 0,
		inProgress: false,
		lastProcessedTimestamp: null,
		lastResponse: null
	});
	const [error, setError] = useState<Error | null>(null);

	// Initialize worker
	useEffect(() => {
		if (typeof window === 'undefined') return;

		try {
			// Create worker
			workerRef.current = new Worker(
				new URL('../workers/data-processor.worker.ts', import.meta.url),
				{ type: 'module' }
			);
			console.log('Worker initialized:', workerRef.current);
			// Set up message handler
			workerRef.current.onmessage = (event) => {
				const { type, payload } = event.data;

				switch (type) {
					case 'STATUS_UPDATE':
						setStatus(payload);
						break;

					case 'PROCESSING_COMPLETE':
						setStatus(prev => ({ ...prev, inProgress: false }));
						break;

					case 'ERROR':
						setError(new Error(payload.error));
						break;
				}
			};

			// Auto-start if configured
			if (options.autoStart) {
				workerRef.current.postMessage({
					type: 'START_PROCESSING',
				});
			}

			// Cleanup on unmount
			return () => {
				if(workerRef.current) {
					workerRef.current.postMessage({ type: 'STOP_PROCESSING' });
					workerRef.current.terminate();
				}
			};
		} catch (err) {
			console.error('Failed to initialize web worker:', err);
			setError(err instanceof Error ? err : new Error('Failed to initialize worker'));
		}
	}, [options.autoStart]);

	// Start processing
	const startProcessing = useCallback(() => {
		if (!workerRef.current) return;

		workerRef.current.postMessage({
			type: 'START_PROCESSING',
		});
	}, []);

	// Stop processing
	const stopProcessing = useCallback(() => {
		if (!workerRef.current) return;
		workerRef.current.postMessage({ type: 'STOP_PROCESSING' });
	}, []);

	// Get current status
	const refreshStatus = useCallback(() => {
		if (!workerRef.current) return;
		workerRef.current.postMessage({ type: 'GET_STATUS' });
	}, []);

	return {
		status,
		error,
		isInitialized: !!workerRef.current,
		startProcessing,
		stopProcessing,
		refreshStatus,
	};
}

export default useDataProcessor;