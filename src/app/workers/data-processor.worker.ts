import { get, del, keys } from 'idb-keyval';
// Simulation settings
const API_ENDPOINT = '/api/upload';
const PROCESSING_INTERVAL = 15000;
const ARTIFICIAL_PROCESSING_DELAY = 5000;

// Message types for worker communication
type WorkerMessage = {
	type: 'START_PROCESSING' | 'STOP_PROCESSING' | 'GET_STATUS';
};

// Processing state
let isProcessing = false;
let processingInterval: number | null = null;
let currentStatus = {
	processedKeys: 0,
	totalKeys: 0,
	processedItems: 0,
	inProgress: false,
	lastProcessedTimestamp: null as number | null,
	lastResponse: null as any,
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// API upload function
async function uploadJsonFile(formData: FormData): Promise<boolean> {
	try {
		await delay(ARTIFICIAL_PROCESSING_DELAY);
		const response = await fetch(API_ENDPOINT, {
			method: 'POST',
			body: formData,
		});

		if (response.ok) {
			const result = await response.json();
			console.log(`[Worker] File upload success:`, result);
			currentStatus.lastResponse = result;
			return true;
		}

		console.warn(`[Worker] File upload failed: ${response.status}`);
		// 依照需求，就算失敗也返回成功
		return true;
	} catch (error) {
		console.error(`[Worker] Error uploading file:`, error);
		// 依照需求，就算出錯也返回成功
		return true;
	}
}

// Process a single batch of data
async function processDataBatch(): Promise<void> {
	try {
		// Get all keys from IndexedDB
		const allKeys = await keys();
		currentStatus.totalKeys = allKeys.length;

		if (allKeys.length === 0) {
			console.log('[Worker] No data to process');
			return;
		}
		// Sort keys by date (assuming format YYYY-MM-DD-HH-MM)
		const sortedKeys = allKeys.sort();
		const keyToProcess = sortedKeys[0] as string;

		// Get data for this key
		const data = await get(keyToProcess);
		if (!data || data.length === 0) {
			await del(keyToProcess);
			return;
		}
		// Log processing attempt
		console.log(`[Worker] Processing key: ${keyToProcess} with ${data.length} items`);
		// 生成 JSON 檔案
		const jsonContent = JSON.stringify(data);
		const fileName = `${keyToProcess}.json`;
		// 建立 Blob 物件
		const blob = new Blob([jsonContent], { type: 'application/json' });
		const file = new File([blob], fileName, { type: 'application/json' });
		// 準備要上傳的資料
		const formData = new FormData();
		formData.append('file', file);
		formData.append('key', keyToProcess);

		// 上傳檔案
		const uploadSuccess = await uploadJsonFile(formData);

		if (uploadSuccess) {
			// Delete the processed data since upload was "successful"
			await del(keyToProcess);
			currentStatus.processedKeys += 1;
			currentStatus.processedItems += data.length;
			currentStatus.lastProcessedTimestamp = Date.now();
		}

		// Send status update
		self.postMessage({
			type: 'STATUS_UPDATE',
			payload: { ...currentStatus },
		});

	} catch (error) {
		console.error('[Worker] Error processing data batch:', error);
		self.postMessage({
			type: 'ERROR',
			payload: { error: 'Failed to process data batch', details: error },
		});
	}
}

// Start the processing loop
function startProcessing() {
	if (isProcessing) return;

	isProcessing = true;
	currentStatus.inProgress = true;

	console.log('[Worker] Starting background processing');

	// Set interval to process data regularly
	processingInterval = self.setInterval(async () => {
		await processDataBatch();
	}, PROCESSING_INTERVAL);

	// Initial processing
	processDataBatch().catch(error => {
		console.error('[Worker] Error during initial processing:', error);
	});
}

// Stop the processing loop
function stopProcessing() {
	if (!isProcessing) return;

	if (processingInterval !== null) {
		self.clearInterval(processingInterval);
		processingInterval = null;
	}

	isProcessing = false;
	currentStatus.inProgress = false;
	console.log('[Worker] Stopped background processing');

	self.postMessage({
		type: 'STATUS_UPDATE',
		payload: { ...currentStatus },
	});
}

// Handle messages from the main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
	const message = event.data;

	switch (message.type) {
		case 'START_PROCESSING':
			startProcessing();
			break;

		case 'STOP_PROCESSING':
			stopProcessing();
			break;

		case 'GET_STATUS':
			self.postMessage({
				type: 'STATUS_UPDATE',
				payload: { ...currentStatus },
			});
			break;

		default:
			console.warn('[Worker] Unknown message type:', message.type);
	}
});

// Log worker initialization
console.log('[Worker] Data processor worker initialized');