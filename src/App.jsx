import * as THREE from "three";
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";

const min = 0;
const maxX = 0.3;
const maxZ = 0;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function Banana({ z }) {
  const ref = useRef();
  const { nodes, materials } = useGLTF("/elium-v1-transformed.glb");
  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z]);

  const [data] = useState({
    x: THREE.MathUtils.randFloatSpread(2), // x -3 to 3
    y: THREE.MathUtils.randFloatSpread(height),
    rX: Math.random() * Math.PI * 2,
    rY: Math.random() * Math.PI * 2,
    rZ: (Math.random() * Math.PI) / 4,
  });

  useFrame((state) => {
    ref.current.rotation.set(
      Math.sin((state.clock.elapsedTime / 4) * data.rX) / 2,
      (data.rY += 0.01),
      Math.sin((state.clock.elapsedTime / 4) * data.rZ) / 2
    );
    ref.current.position.set(data.x * width, (data.y += 0.025), z);
    if (data.y > height) {
      data.y = -height;
    }
  });

  return (
    <mesh
      scale={0.012}
      ref={ref}
      geometry={nodes.balloon.geometry}
      material={materials.material}
      material-emissive="#e03d52"
    />
  );
}

useGLTF.preload("/elium-v1-transformed.glb");

export default function App({ count = 120, depth = 80 }) {
  return (
    <>
      <div className="title-container">
        <h1>ELIUM</h1>
        <p></p>
      </div>
      <Canvas gl={{ alpha: false }} camera={{ near: 0.01, far: 110, fov: 30 }}>
        <color attach="background" args={["#fff"]} />
        <Suspense fallback={null}>
          <spotLight position={[10, 10, 10]} intensity={1} />

          <Environment preset="sunset" />
          {Array.from({ length: count }, (_, i) => (
            <Banana key={i} z={-(i / count) * depth - 20} />
          ))}
          <EffectComposer>
            <DepthOfField
              target={[0, 0, depth / 2]}
              focasLength={0.5}
              bokehScale={5}
              height={700}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </>
  );
}
