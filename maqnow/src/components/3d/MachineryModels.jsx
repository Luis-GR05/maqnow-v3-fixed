import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const EXCAVATOR_MODEL_URL = '/models/Meshy_AI_Mini_Excavator_0915152802_generate.glb';
useGLTF.preload(EXCAVATOR_MODEL_URL);

// ==============================================================================
// 1. MINIEXCAVADORA DE CADENAS (Modelo 3D: CAT 303.5 CR)
// ==============================================================================
export function DetailedExcavator({ progress = 0, interactive = true }) {
  const g = useRef();
  const { scene } = useGLTF(EXCAVATOR_MODEL_URL);

  const geometry = useMemo(() => {
    let sourceMesh = null;
    scene.traverse((child) => {
      if (child.isMesh && !sourceMesh) {
        sourceMesh = child;
      }
    });

    if (!sourceMesh || !sourceMesh.geometry) return null;

    const geo = sourceMesh.geometry.clone();
    geo.computeVertexNormals();
    return geo;
  }, [scene]);

  // Amarillo característico de CAT (Caterpillar Industrial Yellow)
  const catYellowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#ffb700',
      metalness: 0.35,
      roughness: 0.3,
      envMapIntensity: 1.2
    });
  }, []);

  // Animación natural de ralentí y reacción al scroll
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = 2.65 + Math.sin(t * 0.3) * 0.05 + progress * 0.7;
    g.current.rotation.x = Math.sin(t * 0.5) * 0.015 - progress * 0.06;
    g.current.position.y = 0.48 + Math.sin(t * 1.1) * 0.02;
  });

  return (
    <group ref={g} rotation={[0, 2.65, 0]} scale={2.25} position={[0, 0.48, 0]}>
      {geometry && (
        <mesh
          geometry={geometry}
          material={catYellowMaterial}
          castShadow
          receiveShadow
        />
      )}

      {/* ETIQUETA TELEMÉTRICA 3D INTERACTIVA */}
      <Html position={[0, 0.62, 0]} distanceFactor={7}>
        <div className="model-tag">
          <span className="live-dot" /> CAT 303.5 CR · HOJA DOZER & CADENAS
        </div>
      </Html>
    </group>
  );
}

// ==============================================================================
// 2. PLATAFORMA ARTICULADA DIÉSEL (Estilo JLG 450AJ / Genie Z-45/25)
// ==============================================================================
export function DetailedBoomLift({ progress = 0 }) {
  const g = useRef();

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = 0.3 + Math.sin(t * 0.32) * 0.05 + progress * 0.5;
    g.current.position.y = Math.sin(t * 0.95) * 0.02;
  });

  const boomAngle = 0.35 + progress * 0.42;
  const telescopeExt = 0.25 + progress * 0.55;

  return (
    <group ref={g} rotation={[0, 0.3, 0]} scale={1.05} position={[0, -0.2, 0]}>
      {/* ----------------- 4X4 ROUGH-TERRAIN CHASSIS ----------------- */}
      <group position={[0, 0.25, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.42, 1.55]} />
          <meshStandardMaterial color="#17222a" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Chassis Tie-Down Rings & Forklift Passages */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[1.8, 0.12, 1.58]} />
          <meshStandardMaterial color="#0f161c" metalness={0.9} />
        </mesh>

        {/* 4 HEAVY-DUTY FOAM-FILLED ROUGH-TERRAIN WHEELS */}
        {[
          [-0.92, 0, 0.92],
          [-0.92, 0, -0.92],
          [0.92, 0, 0.92],
          [0.92, 0, -0.92]
        ].map((p, i) => (
          <group key={i} position={p}>
            {/* Deep Lug Tire */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.38, 28]} />
              <meshStandardMaterial color="#0e1418" metalness={0.5} roughness={0.65} />
            </mesh>
            {/* Safety Orange Steel Wheel Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.4, 18]} />
              <meshStandardMaterial color="#ff5722" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* 8-Bolt Center Hub */}
            <mesh position={[0, 0, p[2] > 0 ? 0.21 : -0.21]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ----------------- 360° TURNTABLE BODY (Torreta) ----------------- */}
      <group position={[0, 0.54, 0]}>
        {/* Turntable Bearing Ring */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.76, 0.76, 0.18, 32]} />
          <meshStandardMaterial color="#ff5722" metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Engine Enclosure Cowling & Counterweight */}
        <mesh position={[-0.5, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.58, 1.3]} />
          <meshStandardMaterial color="#1a252d" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Amber Flashing Safety Beacon (Luz rotativa de obra) */}
        <group position={[-0.75, 0.78, 0.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
            <meshStandardMaterial color="#0d1419" metalness={0.9} />
          </mesh>
        </group>

        {/* ----------------- PARALLELOGRAM DUAL RISER ----------------- */}
        <group position={[0.22, 0.48, 0]} rotation={[0, 0, boomAngle]}>
          {/* Lower Main Boom Link */}
          <mesh position={[0.85, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.24, 0.28]} />
            <meshStandardMaterial color="#ff5722" metalness={0.35} roughness={0.3} />
          </mesh>
          {/* Hydraulic Lift Ram */}
          <mesh position={[0.5, 0.1, 0.16]} rotation={[0, 0, 0.18]}>
            <cylinderGeometry args={[0.06, 0.06, 1.25, 16]} />
            <meshStandardMaterial color="#18232a" metalness={0.85} />
          </mesh>
          <mesh position={[0.8, 0.16, 0.16]} rotation={[0, 0, 0.18]}>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.05} />
          </mesh>

          {/* Knuckle Joint & Upper Telescoping Boom */}
          <group position={[1.75, 0.68, 0]} rotation={[0, 0, -0.28]}>
            {/* Outer Base Boom */}
            <mesh position={[0.7, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.22, 0.24]} />
              <meshStandardMaterial color="#1c2830" metalness={0.8} />
            </mesh>
            {/* Telescoping Inner Section with Chrome Extension */}
            <mesh position={[telescopeExt + 0.75, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.17, 0.19]} />
              <meshStandardMaterial color="#f97316" metalness={0.4} roughness={0.3} />
            </mesh>
            {/* Cable Carrier Drag Chain (Cadena Portacables) */}
            <mesh position={[telescopeExt * 0.5 + 0.7, 0.12, 0.14]}>
              <boxGeometry args={[1.2, 0.05, 0.07]} />
              <meshStandardMaterial color="#0f161b" roughness={0.8} />
            </mesh>

            {/* Articulated Jib Arm (Plumín) & Operator Work Basket */}
            <group position={[telescopeExt + 1.55, -0.18, 0]}>
              {/* Jib Arm */}
              <mesh position={[0.25, 0.08, 0]} rotation={[0, 0, -0.25]}>
                <boxGeometry args={[0.55, 0.12, 0.14]} />
                <meshStandardMaterial color="#19242b" metalness={0.8} />
              </mesh>

              {/* Steel Operator Basket (Cesta de personal) */}
              <group position={[0.65, -0.05, 0]}>
                {/* Non-Slip Basket Floor Plate */}
                <mesh position={[0, -0.32, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.92, 0.06, 1.1]} />
                  <meshStandardMaterial color="#22313a" metalness={0.85} roughness={0.3} />
                </mesh>
                {/* 15 cm Regulatory Kickplate Toe-Board (Rodapié) */}
                <mesh position={[0, -0.22, 0]}>
                  <boxGeometry args={[0.94, 0.14, 1.12]} />
                  <meshStandardMaterial color="#ff5722" metalness={0.5} />
                </mesh>
                {/* Tubular Steel Guardrails & Entry Gate */}
                <mesh position={[0, 0.12, 0]} castShadow>
                  <boxGeometry args={[0.92, 0.68, 1.08]} />
                  <meshStandardMaterial color="#f8fafc" wireframe metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Operator Control Box with Dual Joysticks */}
                <group position={[0.38, 0.28, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.2, 0.18, 0.32]} />
                    <meshStandardMaterial color="#0f171d" metalness={0.8} />
                  </mesh>
                  {/* Joysticks */}
                  {[-0.08, 0.08].map((z, i) => (
                    <mesh key={i} position={[0, 0.12, z]}>
                      <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
                      <meshStandardMaterial color="#ef4444" />
                    </mesh>
                  ))}
                  {/* Red Emergency Stop Push-Button */}
                  <mesh position={[0.06, 0.1, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
                    <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.8} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>

        <Html position={[-1.1, 1.5, 0]} distanceFactor={8}>
          <div className="model-tag">
            <span className="live-dot" /> JLG 450AJ · 15.7M PLUMÍN & CESTA 4WD
          </div>
        </Html>
      </group>
    </group>
  );
}

// ==============================================================================
// 3. MANIPULADOR TELESCÓPICO (Estilo Manitou MT 1440 / JCB 531-70)
// ==============================================================================
export function DetailedForklift({ progress = 0 }) {
  const g = useRef();

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = -0.38 + Math.sin(t * 0.3) * 0.06 + progress * 0.4;
    g.current.position.y = Math.sin(t * 1.05) * 0.02;
  });

  const boomLift = 0.15 + progress * 0.35;
  const forkLift = progress * 0.4;

  return (
    <group ref={g} rotation={[0, -0.38, 0]} scale={1.12} position={[0, -0.15, 0]}>
      {/* ----------------- HEAVY-DUTY CHASSIS & TIRES ----------------- */}
      <group position={[0, 0.48, 0]}>
        {/* Main Monobloc Welded Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.35, 0.58, 1.35]} />
          <meshStandardMaterial color="#dc2626" metalness={0.35} roughness={0.3} />
        </mesh>
        {/* Rear Counterweight Block */}
        <mesh position={[-1.02, 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.64, 1.32]} />
          <meshStandardMaterial color="#16222a" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* 4 LARGE CONSTRUCTION TIRES WITH DEEP CHEVRON TREADS */}
        {[
          [-0.82, -0.12, 0.78],
          [-0.82, -0.12, -0.78],
          [0.82, -0.12, 0.78],
          [0.82, -0.12, -0.78]
        ].map((p, i) => (
          <group key={i} position={p}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.36, 24]} />
              <meshStandardMaterial color="#0e151a" metalness={0.5} roughness={0.7} />
            </mesh>
            {/* Red Rim & Planetary Wheel Hub */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.38, 16]} />
              <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* FRONT DEPLOYABLE HYDRAULIC STABILIZERS (Patas estabilizadoras) */}
        {[0.62, -0.62].map((z, i) => (
          <group key={i} position={[1.15, -0.1, z]}>
            <mesh rotation={[0, 0, -0.3]} castShadow>
              <boxGeometry args={[0.32, 0.12, 0.12]} />
              <meshStandardMaterial color="#19232a" metalness={0.8} />
            </mesh>
            {/* Wide Ground Foot Pad */}
            <mesh position={[0.18, -0.22, 0]} castShadow>
              <boxGeometry args={[0.24, 0.05, 0.24]} />
              <meshStandardMaterial color="#0f161c" metalness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ----------------- OFFSET OPERATOR CABIN (LEFT SIDE) ----------------- */}
      <group position={[-0.12, 1.05, 0.36]}>
        {/* Enclosed ROPS/FOPS Cabin Shell */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.82, 0.64]} />
          <meshStandardMaterial color="#121b22" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Curved Safety Panoramic Windshield */}
        <mesh position={[0.02, 0.05, 0]}>
          <boxGeometry args={[0.88, 0.72, 0.65]} />
          <meshStandardMaterial color="#5eead4" transparent opacity={0.38} metalness={0.95} roughness={0.08} />
        </mesh>
        {/* Overhead FOPS Steel Protective Roof Bars */}
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={i} position={[x, 0.44, 0]}>
            <boxGeometry args={[0.05, 0.03, 0.6]} />
            <meshStandardMaterial color="#dc2626" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ----------------- RIGHT-SIDE ENGINE COMPARTMENT ----------------- */}
      <group position={[-0.05, 0.85, -0.38]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.45, 0.58]} />
          <meshStandardMaterial color="#1c2830" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Engine Cooling Louvers */}
        {[-0.1, 0, 0.1].map((y, i) => (
          <mesh key={i} position={[0, y, -0.3]}>
            <boxGeometry args={[0.7, 0.04, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        ))}
        {/* Vertical Exhaust Stack */}
        <mesh position={[-0.35, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
          <meshStandardMaterial color="#0f161b" metalness={0.9} />
        </mesh>
      </group>

      {/* ----------------- 2-STAGE REAR-PIVOT TELESCOPIC BOOM ----------------- */}
      <group position={[-0.75, 0.85, -0.05]} rotation={[0, 0, boomLift]}>
        {/* Outer Heavy Steel Boom Section */}
        <mesh position={[1.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.28, 0.28]} />
          <meshStandardMaterial color="#dc2626" metalness={0.35} roughness={0.3} />
        </mesh>
        {/* Inner Telescopic Section */}
        <mesh position={[1.7 + forkLift, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.22, 0.22]} />
          <meshStandardMaterial color="#1e2a32" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Quick-Attach Carriage Plate with Forged Pallet Forks */}
        <group position={[2.5 + forkLift, -0.08, 0]}>
          {/* Backrest Guard (Rejilla salvacargas vertical) */}
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.12, 0.65, 0.85]} />
            <meshStandardMaterial color="#182329" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Forged Steel Pallet Forks (Horquillas de acero templado) */}
          {[-0.26, 0.26].map((z, i) => (
            <group key={i} position={[0.45, -0.3, z]}>
              <mesh castShadow>
                <boxGeometry args={[0.9, 0.05, 0.12]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.08} />
              </mesh>
              {/* Fork Vertical Shank */}
              <mesh position={[-0.4, 0.22, 0]}>
                <boxGeometry args={[0.1, 0.44, 0.12]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      <Html position={[-1.1, 1.5, 0]} distanceFactor={8}>
        <div className="model-tag">
          <span className="live-dot" /> MANITOU MT 1440 · 4T / 14M ESTABILIZADORES
        </div>
      </Html>
    </group>
  );
}

// ==============================================================================
// 4. GRUPO ELECTRÓGENO INSONORIZADO (Estilo Atlas Copco QAS 60 / Himoinsa)
// ==============================================================================
export function DetailedGenerator({ progress = 0 }) {
  const g = useRef();

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = 0.25 + Math.sin(t * 0.25) * 0.04 + progress * 0.3;
    g.current.position.y = Math.sin(t * 1.0) * 0.015;
  });

  return (
    <group ref={g} rotation={[0, 0.25, 0]} scale={1.15} position={[0, -0.1, 0]}>
      {/* ----------------- BASE SKID & BUNDED FUEL TANK (110% Retención) ----------------- */}
      <group position={[0, 0.12, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.55, 0.22, 1.35]} />
          <meshStandardMaterial color="#16222a" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Forklift Tine Passages (Pasos de carretilla en bancada) */}
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={i} position={[x, -0.02, 0]}>
            <boxGeometry args={[0.28, 0.12, 1.38]} />
            <meshStandardMaterial color="#0b1014" metalness={0.9} />
          </mesh>
        ))}
        {/* 4 Corner Heavy-Duty Drag / Tie-Down Eyes */}
        {[
          [-1.22, -0.02, 0.62],
          [-1.22, -0.02, -0.62],
          [1.22, -0.02, 0.62],
          [1.22, -0.02, -0.62]
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
            <meshStandardMaterial color="#ffb700" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ----------------- SOUNDPROOF CANOPY (Carrocería Insonorizada) ----------------- */}
      <group position={[0, 0.72, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.25, 0.98, 1.22]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.25} roughness={0.4} />
        </mesh>

        {/* Front Radiator Cooling Air Discharge Cowl with Louvers */}
        <group position={[1.14, 0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.75, 1.05]} />
            <meshStandardMaterial color="#1a252d" metalness={0.8} />
          </mesh>
          {[-0.25, -0.1, 0.05, 0.2].map((y, i) => (
            <mesh key={i} position={[0.04, y, 0]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.04, 0.06, 0.98]} />
              <meshStandardMaterial color="#0f161b" />
            </mesh>
          ))}
        </group>

        {/* Side Double-Access Inspection Doors with Flush Paddle Handles */}
        {[-0.6, 0.4].map((x, i) => (
          <group key={i} position={[x, -0.05, 0.62]}>
            <mesh castShadow>
              <boxGeometry args={[0.72, 0.8, 0.04]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.35} />
            </mesh>
            {/* Stainless Steel Flush Handle */}
            <mesh position={[0.26, 0, 0.03]}>
              <boxGeometry args={[0.08, 0.14, 0.02]} />
              <meshStandardMaterial color="#0f171d" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Top Heavy-Duty Forged Crane Lifting Eye (Cáncamo central certificado) */}
        <group position={[0, 0.58, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
            <meshStandardMaterial color="#16222a" metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.09, 0.03, 16, 24]} />
            <meshStandardMaterial color="#ffb700" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Residential Silencer Vertical Exhaust with Counterweighted Rain Flap */}
        <group position={[-0.65, 0.58, -0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.32, 16]} />
            <meshStandardMaterial color="#11181d" metalness={0.9} />
          </mesh>
          {/* Rain Flap Cap */}
          <mesh position={[0.02, 0.18, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.2, 0.02, 0.16]} />
            <meshStandardMaterial color="#1a242c" metalness={0.8} />
          </mesh>
        </group>

        {/* Recessed Control Panel with Digital DSE Screen & Protected Sockets */}
        <group position={[-0.75, 0.05, 0.62]}>
          {/* Recessed Compartment */}
          <mesh>
            <boxGeometry args={[0.55, 0.68, 0.06]} />
            <meshStandardMaterial color="#0c1419" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* DSE Digital LCD Display with Backlight */}
          <mesh position={[0, 0.15, 0.02]}>
            <boxGeometry args={[0.38, 0.22, 0.03]} />
            <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={1.4} />
          </mesh>
          {/* Red Emergency Stop Mushroom Button */}
          <mesh position={[0.18, -0.15, 0.04]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
          </mesh>
          {/* Power Sockets CETAC / Schuko */}
          {[-0.14, -0.02, 0.1].map((x, i) => (
            <mesh key={i} position={[x, -0.22, 0.03]}>
              <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
          ))}
        </group>

        <Html position={[-1.1, 1.45, 0]} distanceFactor={8}>
          <div className="model-tag">
            <span className="live-dot" /> ATLAS COPCO QAS 60 · 60 kVA STAGE V
          </div>
        </Html>
      </group>
    </group>
  );
}

// ==============================================================================
// 5. RODILLO COMPACTADOR TÁNDEM (Estilo Bomag BW 120 / Hamm HD 12)
// ==============================================================================
export function DetailedRoller({ progress = 0 }) {
  const g = useRef();

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.y = -0.3 + Math.sin(t * 0.28) * 0.05 + progress * 0.35;
    g.current.position.y = Math.sin(t * 1.1) * 0.015;
  });

  return (
    <group ref={g} rotation={[0, -0.3, 0]} scale={1.1} position={[0, -0.15, 0]}>
      {/* ----------------- CHASSIS WITH CENTRAL OSCILLATION JOINT ----------------- */}
      <group position={[0, 0.45, 0]}>
        {/* Front & Rear Frame Halves */}
        <mesh position={[0.7, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.35, 1.25]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[-0.7, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.35, 1.25]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Central Articulation Joint with Steering Cylinder */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.36, 20]} />
          <meshStandardMaterial color="#1a252d" metalness={0.9} />
        </mesh>

        {/* FRONT AND REAR POLISHED STEEL VIBRATORY COMPACTION DRUMS */}
        {[-0.95, 0.95].map((x, i) => (
          <group key={i} position={[x, -0.15, 0]}>
            {/* Polished Steel Drum */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.42, 0.42, 1.35, 32]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Drum Scraper Bar (Barra rascadora) */}
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.08, 0.06, 1.38]} />
              <meshStandardMaterial color="#17222a" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* OPERATOR WORKSTATION WITH FOLDING ROPS SAFETY ARCH */}
        <group position={[-0.3, 0.55, 0]}>
          {/* Operator High-Back Seat */}
          <mesh position={[-0.2, 0.18, 0]} castShadow>
            <boxGeometry args={[0.35, 0.45, 0.38]} />
            <meshStandardMaterial color="#11181e" roughness={0.7} />
          </mesh>
          {/* Steering Console & Levers */}
          <group position={[0.2, 0.2, 0]}>
            <mesh>
              <boxGeometry args={[0.25, 0.38, 0.35]} />
              <meshStandardMaterial color="#1a242c" metalness={0.8} />
            </mesh>
            {/* Steering Wheel */}
            <mesh position={[0, 0.25, 0]} rotation={[0.4, 0, 0]}>
              <torusGeometry args={[0.12, 0.02, 12, 24]} />
              <meshStandardMaterial color="#0f161c" />
            </mesh>
          </group>
          {/* Folding ROPS Safety Roll Arch (Arco antivuelco abatible) */}
          <group position={[-0.45, 0.5, 0]}>
            {[-0.55, 0.55].map((z, i) => (
              <mesh key={i} position={[0, 0, z]} castShadow>
                <boxGeometry args={[0.08, 1.0, 0.08]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.5} />
              </mesh>
            ))}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.08, 0.08, 1.18]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.5} />
            </mesh>
          </group>
        </group>

        <Html position={[-1.1, 1.45, 0]} distanceFactor={8}>
          <div className="model-tag">
            <span className="live-dot" /> BOMAG BW 120 · DOBLE TAMBOR VIBRATORIO 2.5T
          </div>
        </Html>
      </group>
    </group>
  );
}
