/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { useFBO, MeshTransmissionMaterial } from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {} }) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const { ...modeProps } = rawOverrides;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        <Wrapper modeProps={modeProps} />
      </Canvas>
    </div>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  shape = 'lens',
  ...props
}) {
  const ref = useRef();
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2.5 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2.5 : 0;
    if (ref.current) {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
      ref.current.rotation.y += delta * 0.4;
      ref.current.rotation.x += delta * 0.2;
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    gl.setClearColor(0x090c15, 0);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent opacity={0.85} />
      </mesh>
      <mesh ref={ref} scale={scale ?? 0.45} rotation-x={Math.PI / 3} {...props}>
        {shape === 'cube' ? (
          <boxGeometry args={[4, 4, 4]} />
        ) : shape === 'bar' ? (
          <boxGeometry args={[12, 1.5, 1.5]} />
        ) : (
          <cylinderGeometry args={[3.5, 3.5, 1, 64]} />
        )}
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.3}
          thickness={thickness ?? 8}
          anisotropy={anisotropy ?? 0.03}
          chromaticAberration={chromaticAberration ?? 0.3}
          roughness={0.02}
          transmission={0.98}
          color="#6366f1"
          attenuationColor="#4f46e5"
          attenuationDistance={0.5}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }) {
  return <ModeWrapper shape="lens" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }) {
  return <ModeWrapper shape="cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }) {
  const defaultMat = {
    transmission: 0.98,
    roughness: 0.02,
    thickness: 8,
    ior: 1.25,
    color: '#6366f1',
    attenuationColor: '#4f46e5',
    attenuationDistance: 0.5
  };

  return (
    <ModeWrapper
      shape="bar"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}
