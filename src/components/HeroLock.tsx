import {useEffect, useRef} from "react";
import * as THREE from "three";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";

export default function HeroLock() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    } catch {
      // Keep the original artwork when WebGL is unavailable.
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0.2, 9);
    camera.lookAt(0, 0.2, 0);

    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    environment.dispose();
    pmrem.dispose();

    const keyLight = new THREE.DirectionalLight(0xfff2d6, 4);
    keyLight.position.set(-6, 5, 2);
    const fillLight = new THREE.DirectionalLight(0xc5d5ff, 0.25);
    fillLight.position.set(4, 1, -3);
    scene.add(keyLight, fillLight);

    const lock = new THREE.Group();
    scene.add(lock);

    // A beveled body with a real keyhole cut through its depth.
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.95, -1.3);
    bodyShape.lineTo(0.95, -1.3);
    bodyShape.quadraticCurveTo(1.15, -1.3, 1.15, -1.1);
    bodyShape.lineTo(1.15, 0.6);
    bodyShape.quadraticCurveTo(1.15, 0.8, 0.95, 0.8);
    bodyShape.lineTo(-0.95, 0.8);
    bodyShape.quadraticCurveTo(-1.15, 0.8, -1.15, 0.6);
    bodyShape.lineTo(-1.15, -1.1);
    bodyShape.quadraticCurveTo(-1.15, -1.3, -0.95, -1.3);

    const keyhole = new THREE.Path();
    keyhole.absarc(0, -0.05, 0.3, -Math.PI / 3, Math.PI * 4 / 3, false);
    keyhole.lineTo(-0.18, -0.7);
    keyhole.quadraticCurveTo(0, -0.84, 0.18, -0.7);
    keyhole.closePath();
    bodyShape.holes.push(keyhole);

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.58,
      bevelEnabled: true,
      bevelThickness: 0.16,
      bevelSize: 0.1,
      bevelSegments: 8,
      curveSegments: 32,
    });
    bodyGeometry.translate(0, 0, -0.29);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e313c,
      metalness: 0,
      roughness: 0.7,
      envMapIntensity: 0.12,
    });
    lock.add(new THREE.Mesh(bodyGeometry, bodyMaterial));

    // A dark plate inside the body so the keyhole reads as a hole, not a window.
    const keyholeGeometry = new THREE.PlaneGeometry(0.8, 1.2);
    const keyholeMaterial = new THREE.MeshBasicMaterial({color: 0x050507, side: THREE.DoubleSide});
    const keyholePlate = new THREE.Mesh(keyholeGeometry, keyholeMaterial);
    keyholePlate.position.set(0, -0.35, 0.2);
    lock.add(keyholePlate);

    const shacklePath = new THREE.CurvePath<THREE.Vector3>();
    shacklePath.add(new THREE.LineCurve3(
      new THREE.Vector3(-0.76, 0.65, 0),
      new THREE.Vector3(-0.76, 1.2, 0),
    ));
    shacklePath.add(new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.76, 1.2, 0),
      new THREE.Vector3(-0.76, 2.3, 0),
      new THREE.Vector3(0.76, 2.3, 0),
      new THREE.Vector3(0.76, 1.2, 0),
    ));
    shacklePath.add(new THREE.LineCurve3(
      new THREE.Vector3(0.76, 1.2, 0),
      new THREE.Vector3(0.76, 0.65, 0),
    ));
    const shackleGeometry = new THREE.TubeGeometry(shacklePath, 96, 0.15, 20, false);
    const shackleMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8901a,
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 0.9,
    });
    lock.add(new THREE.Mesh(shackleGeometry, shackleMaterial));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The lock always faces the viewer: it sways gently on its own, tilts
    // toward the mouse while it is over the hero, and follows a finger while
    // it is dragged on touch screens. It never turns edge-on.
    const base = {x: -0.12, y: -0.3};
    let pointer: {x: number; y: number} | null = null;
    lock.rotation.set(base.x, base.y, -0.12);

    let elapsed = 0;
    let lastTime: number | undefined;
    let inView = true;
    const render = () => {
      lock.position.y = -0.15 + Math.sin(elapsed * Math.PI * 2 / 2.5) * 0.09;
      renderer.render(scene, camera);
    };
    const animate = (time: number) => {
      const delta = lastTime === undefined ? 0 : (time - lastTime) / 1000;
      elapsed += delta;
      lastTime = time;
      const target = pointer
        ? {x: base.x + pointer.y * 0.35, y: base.y + pointer.x * 0.5}
        : {x: base.x + Math.sin(elapsed * 0.9) * 0.08, y: base.y + Math.sin(elapsed * 0.6) * 0.5};
      const ease = 1 - Math.exp(-delta * (pointer ? 6 : 2));
      lock.rotation.x += (target.x - lock.rotation.x) * ease;
      lock.rotation.y += (target.y - lock.rotation.y) * ease;
      render();
    };
    const updateAnimation = () => {
      lastTime = undefined;
      renderer.setAnimationLoop(
        !reducedMotion.matches && !document.hidden && inView ? animate : null,
      );
      render();
    };
    const hero = container.closest("main") ?? container;
    const track = (event: PointerEvent) => {
      if (event.pointerType === "mouse" ? event.currentTarget !== hero : !event.buttons) return;
      const rect = container.getBoundingClientRect();
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      pointer = {
        x: clamp((event.clientX - rect.left - rect.width / 2) / rect.width),
        y: clamp((event.clientY - rect.top - rect.height / 2) / rect.height),
      };
    };
    const release = () => {
      pointer = null;
    };
    hero.addEventListener("pointermove", track);
    hero.addEventListener("pointerleave", release);
    renderer.domElement.addEventListener("pointerdown", track);
    renderer.domElement.addEventListener("pointermove", track);
    renderer.domElement.addEventListener("pointerup", release);
    renderer.domElement.addEventListener("pointercancel", release);
    renderer.domElement.style.touchAction = "pan-y";
    const resizeObserver = new ResizeObserver(() => {
      const {width, height} = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.zoom = window.matchMedia("(min-width: 48rem)").matches ? 1.25 : 1;
      camera.updateProjectionMatrix();
      render();
      container.dataset.ready = "true";
    });
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateAnimation();
    });
    intersectionObserver.observe(container);
    reducedMotion.addEventListener("change", updateAnimation);
    document.addEventListener("visibilitychange", updateAnimation);
    updateAnimation();

    return () => {
      renderer.setAnimationLoop(null);
      hero.removeEventListener("pointermove", track);
      hero.removeEventListener("pointerleave", release);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      reducedMotion.removeEventListener("change", updateAnimation);
      document.removeEventListener("visibilitychange", updateAnimation);
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      keyholeGeometry.dispose();
      keyholeMaterial.dispose();
      shackleGeometry.dispose();
      shackleMaterial.dispose();
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete container.dataset.ready;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="A floating three-dimensional padlock with a gold shackle. It tilts toward the pointer."
      className="group relative z-10 aspect-square w-60 md:w-80 lg:w-96"
    >
      <picture className="group-data-[ready=true]:invisible">
        <source srcSet="/lock.webp" type="image/webp" />
        <img src="/lock.png" alt="" className="h-full w-full object-contain" />
      </picture>
    </div>
  );
}
