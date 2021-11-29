import * as THREE from "three";
import { useRef, useState, useMemo, useLayoutEffect } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
const tempObject = new THREE.Object3D();

const Snow = ({ count = 400 }) => {
  const { viewport, camera } = useThree();
  const snowTexture = useLoader(THREE.TextureLoader, "/snowflake.png");
  const meshRef = useRef(null);
  const a1Array = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const z = Math.random() * 3;
      const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z]);
      const i3 = 3 * i;
      arr[i3] = THREE.MathUtils.randFloatSpread(width);
      arr[i3 + 1] = THREE.MathUtils.randFloatSpread(height) + height;
      arr[i3 + 2] = z;
    }
    return arr;
  }, []);
  const aVelocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = 3 * i;
      arr[i3] = Math.floor(Math.random() * 6 - 3) * 0.2;
      arr[i3 + 1] = Math.floor(Math.random() * 10 + 3) * 0.125;
      arr[i3 + 2] = Math.floor(Math.random() * 6 - 3) * 0.1;
    }
    return arr;
  }, []);
  useFrame((state, dt) => {
    for (let i = 0; i < count; i++) {
      const id = i;
      const i3 = 3 * i;
      const time = state.clock.elapsedTime;
      const newZ = a1Array[i3 + 2]; //+ Math.cos(time * aVelocities[i3 + 2]) * 0.1;
      const { height } = viewport.getCurrentViewport(camera, [0, 0, newZ]);

      tempObject.position.set(
        a1Array[i3] + Math.sin(time * aVelocities[i3]) * 1.5,
        a1Array[i3 + 1] -
          (((time * aVelocities[i3 + 1]) / 6) % (height + a1Array[i3 + 1])),
        a1Array[i3 + 2]
      );
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(id, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <planeGeometry args={[0.02, 0.02]}>
        <instancedBufferAttribute
          attachObject={["attributes", "a1"]}
          args={[a1Array, 3]}
        />
        <instancedBufferAttribute
          attachObject={["attributes", "aVelocity"]}
          args={[aVelocities, 0.3]}
        />
      </planeGeometry>
      <meshBasicMaterial
        color="white"
        blending={THREE.AdditiveBlending}
        attach="material"
        map={snowTexture}
      />
    </instancedMesh>
  );
};

export default Snow;
