// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface BouncingBallsVisualizationProps {
  frequency?: number; // Frequency (Hz), used to determine state and adjust parameters
}
export default function BouncingBallsVisualization({ frequency = 0 }: BouncingBallsVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Configuration for different states: ball count and speed multiplier
  const stateConfig: any = {
    'Delta': { count: 2, speed: 0.1 },
    'Theta': { count: 10, speed: 0.5 },
    'Alpha': { count: 15, speed: 1.0 },
    'Beta':  { count: 30, speed: 1.5 },
    'Gamma': { count: 50, speed: 4.0 },
  };

  // Determine state string based on frequency
  const getStateFromFrequency = (freq: number) => {
    if (freq < 2) return 'Delta';
    else if (freq < 10) return 'Theta';
    else if (freq < 25) return 'Alpha';
    else if (freq < 40) return 'Beta';
    else return 'Gamma';
  };

  useEffect(() => {
    const sketch = (p: p5) => {
      let currentState = getStateFromFrequency(frequency);
      let ballArray: Ball[] = [];
      const sphereRadius = 150; // Boundary sphere radius
      let rotationAngle = 0;
      let font: p5.Font;
      p.preload = () => {
        font = p.loadFont('/assets/GeistMonoVF.woff');
      };

      // define Ball class
      class Ball {
        position: p5.Vector;
        velocity: p5.Vector;
        radius: number;

        constructor() {
          this.radius = 8;
          // Randomly generate a point inside the sphere
          this.position = randomPointInSphere(sphereRadius - this.radius);
          this.velocity = p5.Vector.random3D().mult(p.random(0.5, 1));
        }

        update() {
          this.position.add(this.velocity);
        }

        checkCollision() {
          const d = this.position.mag() + this.radius;
          if (d > sphereRadius) {
            const normal = this.position.copy().normalize();
            const dot = this.velocity.dot(normal);
            this.velocity = p5.Vector.sub(this.velocity, p5.Vector.mult(normal, 2 * dot));
            const overlap = d - sphereRadius;
            this.position.sub(p5.Vector.mult(normal, overlap));
          }
        }

        display() {
          p.push();
          p.translate(this.position.x, this.position.y, this.position.z);
          p.noStroke();
          p.fill(255, 255, 0); // Bright yellow
          p.sphere(this.radius);
          p.pop();
        }
      }

      // Randomly generate a point inside the sphere
      function randomPointInSphere(r: number): p5.Vector {
        const u = p.random();
        const v = p.random();
        const theta = u * p.TWO_PI;
        const phi = p.acos(2 * v - 1);
        const rad = p.random(0, r);
        const sinPhi = p.sin(phi);
        const x = rad * sinPhi * p.cos(theta);
        const y = rad * sinPhi * p.sin(theta);
        const z = rad * p.cos(phi);
        return p.createVector(x, y, z);
      }

      // Initialize ball array
      const initBalls = () => {
        ballArray = [];
        const config = stateConfig[currentState];
        for (let i = 0; i < config.count; i++) {
          const b = new Ball();
          b.velocity.mult(config.speed);
          ballArray.push(b);
        }
      };

      p.setup = () => {
        p.createCanvas(320, 320, p.WEBGL);
        p.textFont(font);
        initBalls();
      };

      p.draw = () => {
        // Black background
        p.background(255);
        p.ambientLight(100);
        p.directionalLight(255, 255, 255, 1, 1, -1);
        // Scene rotation
        rotationAngle += 0.01;
        p.rotateY(rotationAngle);

        // White wireframe boundary sphere
        p.noFill();
        p.stroke(160);
        p.strokeWeight(1);
        p.sphere(sphereRadius);

        // Update, collision detection, display each ball
        for (let b of ballArray) {
          b.update();
          b.checkCollision();
          b.display();
        }
      };

      // When external frequency changes, reinitialize balls if state changes
      (p as any).updateState = (newFrequency: number) => {
        const newState = getStateFromFrequency(newFrequency);
        if (newState !== currentState) {
          currentState = newState;
          initBalls();
        }
      };
    };

    if (containerRef.current) {
      p5InstanceRef.current = new p5(sketch, containerRef.current);
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When frequency changes, notify p5 instance to update state
  useEffect(() => {
    if (p5InstanceRef.current && (p5InstanceRef.current as any).updateState) {
      (p5InstanceRef.current as any).updateState(frequency);
    }
  }, [frequency]);

  return <div ref={containerRef} />;
}