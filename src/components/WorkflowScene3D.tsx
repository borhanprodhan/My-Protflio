import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface WorkflowScene3DProps {
  scrollProgressRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}

const _vec3 = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function WorkflowScene3D({ scrollProgressRef, mouseRef }: WorkflowScene3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareWebGL();
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080B14');
    scene.fog = new THREE.FogExp2('#080B14', 0.068);

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0.6, isMobile ? 11.5 : 9.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      return;
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Mandatory studio environment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Balanced 3-point warm/cool studio lighting
    const hemiLight = new THREE.HemisphereLight('#38BDF8', '#080B14', 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF5EA', 1.8);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#7C3AED', 1.5);
    rimLight.position.set(-7, -4, -5);
    scene.add(rimLight);

    // Master workflow lattice group
    const latticeGroup = new THREE.Group();
    latticeGroup.position.set(isMobile ? 0 : 1.9, 0.15, 0);
    scene.add(latticeGroup);

    // Shared materials with varied roughness/metalness
    const anodizedMat = new THREE.MeshStandardMaterial({
      color: '#1E293B',
      metalness: 0.88,
      roughness: 0.28,
    });
    const violetCoreMat = new THREE.MeshStandardMaterial({
      color: '#7C3AED',
      emissive: '#4C1D95',
      emissiveIntensity: 0.55,
      metalness: 0.25,
      roughness: 0.2,
    });
    const skyCoreMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      emissive: '#0369A1',
      emissiveIntensity: 0.45,
      metalness: 0.3,
      roughness: 0.22,
    });
    const bezelMat = new THREE.MeshPhysicalMaterial({
      color: '#0F172A',
      metalness: 0.1,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });
    const conduitMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      metalness: 0.78,
      roughness: 0.34,
    });

    // Shared geometries for composite 3-part workflow nodes
    const collarGeo = new THREE.TorusGeometry(0.32, 0.045, 12, 28);
    const coreGeo = new THREE.OctahedronGeometry(0.18, 0);
    const baseCapGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.08, 6);

    const nodePositions: THREE.Vector3[] = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2.3, 1.35, -0.6),
      new THREE.Vector3(2.2, 1.5, -0.4),
      new THREE.Vector3(-2.1, -1.4, 0.7),
      new THREE.Vector3(2.35, -1.25, 0.55),
      new THREE.Vector3(0.15, 2.35, -1.1),
      new THREE.Vector3(-0.2, -2.3, -0.8),
      new THREE.Vector3(-3.3, 0.05, -1.5),
      new THREE.Vector3(3.4, 0.1, -1.2),
    ];

    const nodeMeshes: THREE.Group[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [collarGeo, coreGeo, baseCapGeo];

    nodePositions.forEach((pos, idx) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      const scaleFactor = idx === 0 ? 1.45 : idx <= 4 ? 1.0 : 0.82;
      nodeGroup.scale.setScalar(scaleFactor);

      // Part 1: Anodized hexagonal base housing
      const base = new THREE.Mesh(baseCapGeo, bezelMat);
      base.rotation.x = Math.PI / 2;
      base.position.z = -0.06;
      nodeGroup.add(base);

      // Part 2: Precision metallic orbital collar
      const collar = new THREE.Mesh(collarGeo, anodizedMat);
      nodeGroup.add(collar);

      // Part 3: Inner active signal core
      const core = new THREE.Mesh(coreGeo, idx % 2 === 0 ? violetCoreMat : skyCoreMat);
      core.position.z = 0.03;
      nodeGroup.add(core);

      latticeGroup.add(nodeGroup);
      nodeMeshes.push(nodeGroup);
    });

    // Connecting workflow conduits (CatmullRomCurve3 + TubeGeometry)
    const connections: Array<[number, number]> = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 5],
      [2, 5],
      [1, 7],
      [3, 7],
      [2, 8],
      [4, 8],
      [3, 6],
      [4, 6],
    ];

    const curves: THREE.CatmullRomCurve3[] = [];
    connections.forEach(([aIdx, bIdx], idx) => {
      const a = nodePositions[aIdx];
      const b = nodePositions[bIdx];
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.z += idx % 2 === 0 ? 0.45 : -0.45;
      const curve = new THREE.CatmullRomCurve3([a.clone(), mid, b.clone()]);
      curves.push(curve);

      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.022, 8, false);
      disposableGeometries.push(tubeGeo);
      const tubeMesh = new THREE.Mesh(tubeGeo, conduitMat);
      latticeGroup.add(tubeMesh);
    });

    // Subtle geometric outer orbital rings
    const outerRingGeo = new THREE.TorusGeometry(3.85, 0.012, 8, 96);
    disposableGeometries.push(outerRingGeo);
    const outerRing = new THREE.Mesh(outerRingGeo, conduitMat);
    outerRing.rotation.x = Math.PI / 3;
    outerRing.rotation.y = Math.PI / 6;
    latticeGroup.add(outerRing);

    // Instanced data signal packets travelling along workflow conduits
    const packetsPerCurve = 2;
    const totalPackets = curves.length * packetsPerCurve;
    const packetGeo = new THREE.SphereGeometry(0.055, 10, 10);
    disposableGeometries.push(packetGeo);
    const packetMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });
    const packetInstanced = new THREE.InstancedMesh(packetGeo, packetMat, totalPackets);
    packetInstanced.frustumCulled = false;

    const violetTint = new THREE.Color('#A78BFA');
    const skyTint = new THREE.Color('#38BDF8');
    for (let i = 0; i < totalPackets; i++) {
      packetInstanced.setColorAt(i, i % 2 === 0 ? violetTint : skyTint);
    }
    if (packetInstanced.instanceColor) {
      packetInstanced.instanceColor.needsUpdate = true;
    }
    latticeGroup.add(packetInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let currentPosX = isMobile ? 0 : 1.9;
    let currentPosY = 0.15;

    function updatePackets(timeSec: number) {
      let instanceIdx = 0;
      for (let c = 0; c < curves.length; c++) {
        const curve = curves[c];
        for (let p = 0; p < packetsPerCurve; p++) {
          const t = (timeSec * 0.24 + c * 0.13 + p * 0.5) % 1;
          curve.getPointAt(t, _vec3);
          _mat4.compose(_vec3, _quat, _scale);
          packetInstanced.setMatrixAt(instanceIdx, _mat4);
          instanceIdx++;
        }
      }
      packetInstanced.instanceMatrix.needsUpdate = true;
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext | null;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function renderFrame(now: number) {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      elapsed += dt;

      const scrollVal = scrollProgressRef.current;
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Scroll-driven orbit & gentle mouse parallax
      const targetRotY = scrollVal * Math.PI * 1.45 + mouseX * 0.25 + elapsed * 0.08;
      const targetRotX = scrollVal * 0.55 - mouseY * 0.18 + Math.sin(elapsed * 0.35) * 0.06;
      const targetPosX = isMobile ? 0 : 1.9 - scrollVal * 2.2;
      const targetPosY = 0.15 - scrollVal * 0.4;

      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 4.5, dt);
      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX, 4.5, dt);
      currentPosX = THREE.MathUtils.damp(currentPosX, targetPosX, 3.8, dt);
      currentPosY = THREE.MathUtils.damp(currentPosY, targetPosY, 3.8, dt);

      latticeGroup.rotation.y = currentRotY;
      latticeGroup.rotation.x = currentRotX;
      latticeGroup.position.x = currentPosX;
      latticeGroup.position.y = currentPosY;

      outerRing.rotation.z = elapsed * 0.12;
      for (let i = 0; i < nodeMeshes.length; i++) {
        const core = nodeMeshes[i].children[2];
        if (core) {
          core.rotation.y = elapsed * 0.8 + i;
          core.rotation.x = elapsed * 0.5 + i * 0.4;
        }
      }

      updatePackets(elapsed);
      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(() => renderFrame(performance.now()));
      } else {
        frameId = requestAnimationFrame(renderFrame);
      }
    }

    // Initial render
    updatePackets(0);
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(renderFrame);
    }

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      disposableGeometries.forEach((g) => g.dispose());
      anodizedMat.dispose();
      violetCoreMat.dispose();
      skyCoreMat.dispose();
      bezelMat.dispose();
      conduitMat.dispose();
      packetMat.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mouseRef, scrollProgressRef]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none opacity-80"
    />
  );
}
