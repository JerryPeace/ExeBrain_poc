'use client';

import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface P5VisualizationProps {
	frequency?: number; // Data updates per second, used to determine brain wave state
}

export default function P5Visualization({ frequency = 0 }: P5VisualizationProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const p5InstanceRef = useRef<p5 | null>(null);

	useEffect(() => {
		// Only initialize p5 when the component is first loaded
		const sketch = (p: p5) => {
			let currentFrequency = 0;

			// Let external code call this method to update frequency
			(p as any).setFrequency = (freq: number) => {
				currentFrequency = freq;
			};

			// Determine state based on frequency
			const getState = (freq: number) => {
				if (freq < 2) return 'Delta';
				else if (freq < 10) return 'Theta';
				else if (freq < 25) return 'Alpha';
				else if (freq < 40) return 'Beta';
				else return 'Gamma';
			};

			// Draw eyes (maintain original settings)
			const drawEyes = (state: string) => {
				p.fill(0); // Use black
				switch (state) {
					case 'Delta': // Delta state: deep sleep, eyes are two short horizontal lines
						p.stroke(0);
						p.strokeWeight(3);
						p.line(-25, -22, -15, -22);
						p.line(15, -22, 25, -22);
						break;
					case 'Theta': // Half-closed
						p.ellipse(-30, -22, 18, 7);
						p.ellipse(30, -22, 18, 7);
						break;
					case 'Alpha': // Relaxed
						p.ellipse(-30, -22, 15, 15);
						p.ellipse(30, -22, 15, 15);
						break;
					case 'Beta':  // Focused
						p.ellipse(-30, -22, 22, 22);
						p.ellipse(30, -22, 22, 22);
						break;
					case 'Gamma': // Excited
						p.ellipse(-30, -22, 25, 25);
						p.ellipse(30, -22, 25, 25);
						break;
				}
			};

			// Draw mouth: default in Delta state is a horizontal line
			const drawMouth = (state: string) => {
				p.stroke(0);
				p.strokeWeight(4);
				p.noFill();
				switch (state) {
					case 'Delta':
						// Horizontal line: 40 pixels on each side
						p.line(-30, 30, 30, 30);
						break;
					case 'Theta':
						p.arc(0, 35, 70, 15, 180, 360);
						break;
					case 'Alpha':
						p.arc(0, 30, 80, 25, 0, 180);
						break;
					case 'Beta':
						p.arc(0, 30, 70, 20, 0, 180);
						break;
					case 'Gamma':
						p.arc(0, 30, 90, 30, 0, 180);
						break;
				}
			};

			p.setup = () => {
				p.textFont('sans-serif');
				p.createCanvas(320, 320);
				p.angleMode(p.DEGREES);
			};

			p.draw = () => {
				// White background
				p.background(255);

				const state = getState(currentFrequency);

				// Draw face (scaled-down face)
				p.push();
				p.translate(p.width / 2, p.height / 2);
				p.noStroke();
				p.fill(255, 204, 0); // Yellow
				p.ellipse(0, 0, 170, 170); // Face diameter 180

				// Draw eyes and mouth
				drawEyes(state);
				drawMouth(state);
				p.pop();

				// Display state text
				p.fill(0);
				p.noStroke();
				p.textAlign(p.LEFT, p.TOP);
				p.textSize(16);
				p.text(`Frequency: ${currentFrequency.toFixed(2)}/sec`, 70, 10);
				p.text(`State: ${state}`, 100, 40);
			};
		};

		if (containerRef.current) {
			p5InstanceRef.current = new p5(sketch, containerRef.current);
		}

		return () => {
			if (p5InstanceRef.current) {
				p5InstanceRef.current.remove();
			}
		};
	}, []);

	// When frequency changes, update the value in p5Instance
	useEffect(() => {
		if (p5InstanceRef.current && (p5InstanceRef.current as any).setFrequency) {
			(p5InstanceRef.current as any).setFrequency(frequency);
		}
	}, [frequency]);

	return <div ref={containerRef} />;
}