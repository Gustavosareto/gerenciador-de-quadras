"use client";

import { Renderer, Camera, Program, Mesh, Color, Vec3, Geometry } from 'ogl';
import { useEffect, useRef } from 'react';

interface ThreadsProps {
    color?: [number, number, number];
    amplitude?: number;
    distance?: number;
    enableMouseInteraction?: boolean;
}

export default function Threads({
    color = [0.37, 0.34, 0.34],
    amplitude = 1.6,
    distance = 1,
    enableMouseInteraction = true,
}: ThreadsProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) });
        const gl = renderer.gl;
        
        // Style canvas to cover entire viewport
        gl.canvas.style.position = 'fixed';
        gl.canvas.style.top = '0';
        gl.canvas.style.left = '0';
        gl.canvas.style.width = '100vw';
        gl.canvas.style.height = '100vh';
        gl.canvas.style.pointerEvents = 'none';
        
        container.appendChild(gl.canvas);

        // Clear to transparent
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 50 });
        camera.position.set(0, 0, 15); // Afastado para cobrir toda a viewport

        function resize() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.perspective({ aspect: window.innerWidth / window.innerHeight });
        }
        window.addEventListener('resize', resize);
        resize();

        const mouse = new Vec3();

        if (enableMouseInteraction) {
            window.addEventListener('mousemove', (e) => {
                // Map mouse to -1 to 1
                mouse.set(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    (1.0 - e.clientY / window.innerHeight) * 2 - 1,
                    0
                );
            });
        }

        const count = 150; // Number of lines (density)
        const pointsPerLine = 100; // More points = longer, smoother lines
        const totalPoints = count * pointsPerLine;

        // Create geometry for lines
        const positions = new Float32Array(totalPoints * 3);
        const indices = [];
        const randoms = new Float32Array(totalPoints);

        for (let i = 0; i < count; i++) {
            // Random offset for each line
            const r = Math.random();
            for (let j = 0; j < pointsPerLine; j++) {
                const idx = i * pointsPerLine + j;

                // X position distributed across screen
                positions[idx * 3] = (i / count - 0.5) * 30;
                // Y position from top to bottom - covers full viewport height
                positions[idx * 3 + 1] = (j / (pointsPerLine - 1) - 0.5) * 25;
                positions[idx * 3 + 2] = 0;

                randoms[idx] = r;

                if (j < pointsPerLine - 1) {
                    indices.push(idx, idx + 1);
                }
            }
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: positions },
            random: { size: 1, data: randoms },
            index: { data: new Uint16Array(indices) }
        });

        const vertex = /* glsl */ `
      attribute vec3 position;
      attribute float random;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uMouse;
      uniform float uAmplitude;
      uniform float uDistance; // Controls line warp intensity?

      varying vec3 vColor;

      // Simplex Noise (simplified)
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
      }

      void main() {
        vec3 pos = position;
        
        // Flow movement (slower speed)
        float noise = snoise(vec2(pos.x * 0.5 + random, pos.y * 0.5 + uTime * 0.05));
        pos.x += noise * uAmplitude * 0.3 * sin(pos.y + uTime * 0.3);
        pos.z += noise * uAmplitude * cos(pos.x);
        
        // Mouse Repulsion
        float d = distance(pos.xy, uMouse.xy * 5.0);
        float force = max(0.0, (1.0 - d) * uDistance);
        pos.z += force * 2.0;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        
        // Fade minimal color variation
        vColor = uColor + (noise * 0.1); 
      }
    `;

        const fragment = /* glsl */ `
      precision highp float;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 0.7); // 70% opacity - visible lines
      }
    `;

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new Color(color[0], color[1], color[2]) },
                uMouse: { value: mouse },
                uAmplitude: { value: amplitude },
                uDistance: { value: distance },
            },
            transparent: true,
        });

        const mesh = new Mesh(gl, {
            mode: gl.LINES,
            geometry,
            program,
        });

        let animationId: number;
        function update(t: number) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001;
            program.uniforms.uMouse.value.lerp(mouse, 0.05); // Smooth interaction

            // Rotate slowly for dynamic effect
            // mesh.rotation.y += 0.001;

            renderer.render({ scene: mesh, camera });
        }
        update(0);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            if (container.contains(gl.canvas)) {
                container.removeChild(gl.canvas);
            }
        };
    }, [color, amplitude, distance, enableMouseInteraction]);

    return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />;
}
